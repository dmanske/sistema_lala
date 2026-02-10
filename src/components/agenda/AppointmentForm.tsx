"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm, useWatch, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Calendar as CalendarIcon,
    Clock,
    User,
    Scissors,
    Check,
    ChevronsUpDown,
    X,
    Loader2,
    AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock } from "lucide-react";

import {
    Appointment,
    CreateAppointmentInput,
    CreateAppointmentSchema,
    ServiceLine
} from "@/core/domain/Appointment";
import { AppointmentService } from "@/core/services/AppointmentService";
import { LocalStorageAppointmentRepository } from "@/infrastructure/repositories/LocalStorageAppointmentRepository";
import { LocalStorageClientRepository } from "@/infrastructure/repositories/LocalStorageClientRepository";
import { LocalStorageServiceRepository } from "@/infrastructure/repositories/LocalStorageServiceRepository";
import { LocalStorageProfessionalRepository } from "@/infrastructure/repositories/LocalStorageProfessionalRepository";
import { Client } from "@/core/domain/Client";
import { Service } from "@/core/domain/Service";
import { Professional } from "@/core/domain/Professional";
import { toast } from "sonner";
import { formatName } from "@/core/formatters/name";

interface AppointmentFormProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Appointment;
    clientId?: string;
    defaultDate?: string;
    defaultTime?: string;
    onSuccess?: () => void;
}

export function AppointmentForm({ isOpen, onOpenChange, initialData, clientId, defaultDate, defaultTime, onSuccess }: AppointmentFormProps) {
    const [clients, setClients] = useState<Client[]>([]);
    const [availableServices, setAvailableServices] = useState<Service[]>([]);
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [isLoadingServices, setIsLoadingServices] = useState(true);

    const [clientSearch, setClientSearch] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clientPopoverOpen, setClientPopoverOpen] = useState(false);
    const [calendarPopoverOpen, setCalendarPopoverOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("appointment");
    const [endTime, setEndTime] = useState("10:00");

    const appointmentService = new AppointmentService(new LocalStorageAppointmentRepository());
    const clientRepo = new LocalStorageClientRepository();
    const serviceRepo = new LocalStorageServiceRepository();
    const professionalRepo = new LocalStorageProfessionalRepository();

    const form = useForm<CreateAppointmentInput>({
        resolver: zodResolver(CreateAppointmentSchema) as any,
        defaultValues: {
            clientId: clientId || "",
            professionalId: "",
            services: [],
            serviceLines: [],
            date: defaultDate || format(new Date(), 'yyyy-MM-dd'),
            startTime: defaultTime || "09:00",
            durationMinutes: 30,
            status: "PENDING",
            notes: ""
        },
    });

    // Load Clients
    useEffect(() => {
        const loadClients = async () => {
            try {
                const data = await clientRepo.getAll();
                setClients(data);
            } catch (error) {
                console.error(error);
            }
        };
        loadClients();
    }, []);

    // Load Services
    useEffect(() => {
        const loadServices = async () => {
            setIsLoadingServices(true);
            try {
                const data = await serviceRepo.getAll();
                setAvailableServices(data);
                console.log("Serviços carregados:", data.length);
            } catch (error) {
                console.error("Erro ao carregar serviços:", error);
                toast.error("Erro ao carregar lista de serviços");
            } finally {
                setIsLoadingServices(false);
            }
        };
        loadServices();
    }, []);

    // Load Professionals
    useEffect(() => {
        const loadProfessionals = async () => {
            try {
                const data = await professionalRepo.getAll();
                setProfessionals(data.filter(p => p.status === "ACTIVE"));
            } catch (error) {
                console.error("Erro ao carregar profissionais:", error);
            }
        };
        loadProfessionals();
    }, []);

    // Initialize/Reset Form
    useEffect(() => {
        if (isOpen && !isLoadingServices) {
            if (initialData) {
                const isBlocked = initialData.status === 'BLOCKED';
                setActiveTab(isBlocked ? 'block' : 'appointment');

                // Prepare serviceLines (migration logic if needed)
                let lines: ServiceLine[] = initialData.serviceLines || [];

                // If legacy data (no serviceLines but has services ids), migrate it
                if (lines.length === 0 && initialData.services && initialData.services.length > 0) {
                    lines = initialData.services.map(sId => {
                        const s = availableServices.find(as => as.id === sId);
                        // If service not found (deleted), try to preserve ID but snapshot 0 defaults
                        // Or we simply omit it? Better to keep it with warnings.
                        return {
                            id: crypto.randomUUID(),
                            serviceId: sId,
                            qty: 1,
                            priceSnapshot: s?.price || 0,
                            durationSnapshot: s?.duration || 30
                        };
                    });
                }

                form.reset({
                    clientId: initialData.clientId,
                    professionalId: initialData.professionalId,
                    services: initialData.services,
                    serviceLines: lines,
                    date: initialData.date,
                    startTime: initialData.startTime,
                    durationMinutes: initialData.durationMinutes,
                    status: initialData.status,
                    notes: initialData.notes || "",
                    recurrenceRule: (initialData as any).recurrenceRule
                });
                // Sync endTime
                const [sh, sm] = initialData.startTime.split(':').map(Number);
                const totalEnd = sh * 60 + sm + initialData.durationMinutes;
                setEndTime(`${Math.floor(totalEnd / 60).toString().padStart(2, '0')}:${(totalEnd % 60).toString().padStart(2, '0')}`);
            } else {
                // New Appointment Defaults
                const targetDate = defaultDate || format(new Date(), 'yyyy-MM-dd');
                const targetTime = defaultTime || "09:00";

                setActiveTab('appointment');

                form.reset({
                    clientId: clientId || "",
                    professionalId: "",
                    services: [],
                    serviceLines: [],
                    date: targetDate,
                    startTime: targetTime,
                    durationMinutes: 30,
                    status: "PENDING",
                    notes: ""
                });
                // Sync endTime
                const [sh, sm] = targetTime.split(':').map(Number);
                const totalEnd = sh * 60 + sm + 30;
                setEndTime(`${Math.floor(totalEnd / 60).toString().padStart(2, '0')}:${(totalEnd % 60).toString().padStart(2, '0')}`);
            }
        }
    }, [isOpen, initialData, clientId, defaultDate, defaultTime, availableServices, isLoadingServices]); // Removed 'form' from deps to avoid loop

    const onSubmit: SubmitHandler<CreateAppointmentInput> = async (data) => {
        setIsSubmitting(true);
        try {
            // Force status based on tab
            if (activeTab === 'block') {
                data.status = 'BLOCKED';
                data.clientId = undefined;
                data.services = [];
            }

            const payload = { ...data };

            if (initialData) {
                await appointmentService.update(initialData.id, payload);
                toast.success(activeTab === 'block' ? "Bloqueio atualizado!" : "Agendamento atualizado!");
            } else {
                await appointmentService.create(payload);
                toast.success(activeTab === 'block' ? "Bloqueio criado!" : "Agendamento criado!");
            }
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar agendamento");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Submit handler for block tab - bypasses form validation for client/services
    const handleBlockSubmit = async () => {
        const values = form.getValues();
        // Validate only required block fields
        if (!values.professionalId) {
            toast.error("Selecione um profissional");
            return;
        }
        if (!values.date) {
            toast.error("Selecione uma data");
            return;
        }
        if (!values.startTime) {
            toast.error("Defina a hora de início");
            return;
        }
        if (!values.durationMinutes || values.durationMinutes <= 0) {
            toast.error("Duração inválida. Verifique hora início e fim.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: CreateAppointmentInput = {
                ...values,
                status: 'BLOCKED',
                clientId: undefined,
                services: [],
                serviceLines: [],
            };

            if (initialData) {
                await appointmentService.update(initialData.id, payload);
                toast.success("Bloqueio atualizado!");
            } else {
                await appointmentService.create(payload);
                toast.success("Horário bloqueado!");
            }
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar bloqueio");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.phone?.includes(clientSearch) ||
        c.whatsapp?.includes(clientSearch)
    );

    const selectedClient = clients.find(c => c.id === form.watch("clientId"));
    const selectedServices = form.watch("services") || [];
    const totalDuration = form.watch("durationMinutes") || 0;

    // Watch serviceLines to auto-calc duration
    const watchedServiceLines = useWatch({ control: form.control, name: "serviceLines" });

    useEffect(() => {
        if (watchedServiceLines && watchedServiceLines.length > 0) {
            const total = watchedServiceLines.reduce((acc, line) => acc + (line.durationSnapshot * line.qty), 0);
            if (total > 0) {
                // Use shouldValidate: false to avoid triggering re-validation loops if not needed
                form.setValue("durationMinutes", total, { shouldValidate: true });
            }
        } else if (!initialData) {
            // Reset to 30 if no services and creating new
            // form.setValue("durationMinutes", 30);
        }
    }, [watchedServiceLines, form, initialData]);

    // Toggle Service Logic
    const toggleService = useCallback((serviceId: string) => {
        const currentIds = form.getValues("services") || [];
        const currentLines = form.getValues("serviceLines") || [];
        const service = availableServices.find(s => s.id === serviceId);

        // If clicking a service that's not in valid list (e.g. deleted but migrated legacy), we can't toggle it easily back ON if removed.
        // But for toggling ON:
        if (!service) {
            // Check if it's a legacy service already in the list?
            // If we are unselecting a legacy service that is not in availableServices, we just remove it.
        }

        const isSelected = currentIds.includes(serviceId);

        if (isSelected) {
            // Remove
            const newIds = currentIds.filter(id => id !== serviceId);
            const newLines = currentLines.filter(l => l.serviceId !== serviceId);
            form.setValue("services", newIds);
            form.setValue("serviceLines", newLines);
        } else {
            // Add
            if (!service) {
                toast.error("Serviço não encontrado no catálogo atual.");
                return;
            }
            const newIds = [...currentIds, serviceId];
            const newLine: ServiceLine = {
                id: crypto.randomUUID(),
                serviceId: service.id,
                qty: 1,
                priceSnapshot: service.price,
                durationSnapshot: service.duration,
            };
            const newLines = [...currentLines, newLine];
            form.setValue("services", newIds);
            form.setValue("serviceLines", newLines);
        }
    }, [form, availableServices]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-white/20 rounded-2xl p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
                    <DialogTitle className="text-xl font-bold font-heading">
                        {initialData ? (activeTab === 'block' ? "Editar Bloqueio" : "Editar Agendamento") : "Novo Agendamento"}
                    </DialogTitle>
                    <DialogDescription>
                        {activeTab === 'block' ? "Defina um período de indisponibilidade." : "Preencha os dados do atendimento."}
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(val) => {
                    setActiveTab(val);
                    if (val === 'block') {
                        form.setValue('status', 'BLOCKED');
                        form.clearErrors(['clientId', 'services']); // Clear errors from other tab
                    } else {
                        // Restore pending if switching back and was blocked
                        if (form.getValues('status') === 'BLOCKED') {
                            form.setValue('status', 'PENDING');
                        }
                    }
                }} className="w-full">
                    <div className="px-6 pt-4">
                        {/* Hide block tab when opened from client profile */}
                        {clientId ? (
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100/50">
                                <CalendarIcon className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold text-slate-700">Novo Agendamento</span>
                            </div>
                        ) : (
                            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-slate-100/50 p-1">
                                <TabsTrigger value="appointment" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                    Agendamento
                                </TabsTrigger>
                                <TabsTrigger value="block" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-rose-600">
                                    <Lock className="w-4 h-4 mr-2" />
                                    Bloqueio / Pessoal
                                </TabsTrigger>
                            </TabsList>
                        )}
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 py-4">
                            {/* Common Fields: Professional, Date, Time */}
                            <div className="space-y-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100/50">
                                {/* Profissional */}
                                <FormField
                                    control={form.control}
                                    name="professionalId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold flex items-center gap-2 text-xs uppercase tracking-wider">
                                                <Scissors className="h-3.5 w-3.5 text-purple-500" />
                                                Profissional
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-10 rounded-lg bg-white border-slate-200 text-sm">
                                                        <SelectValue placeholder="Selecione o profissional" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl">
                                                    {professionals.map(p => (
                                                        <SelectItem key={p.id} value={p.id} className="py-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-5 w-5 rounded-full flex items-center justify-center" style={{ backgroundColor: p.color + '20' }}>
                                                                    <span className="text-[10px] font-bold" style={{ color: p.color }}>
                                                                        {p.name.charAt(0)}
                                                                    </span>
                                                                </div>
                                                                {p.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-slate-700 font-semibold flex items-center gap-2 text-xs uppercase tracking-wider">
                                                    <CalendarIcon className="h-3.5 w-3.5 text-blue-500" />
                                                    Data
                                                </FormLabel>
                                                <Popover open={calendarPopoverOpen} onOpenChange={setCalendarPopoverOpen}>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    "h-10 rounded-lg bg-white border-slate-200 justify-start text-left font-normal text-sm",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(new Date(field.value + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR })
                                                                ) : (
                                                                    "Selecione"
                                                                )}
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                                                            onSelect={(date) => {
                                                                if (date) {
                                                                    field.onChange(format(date, 'yyyy-MM-dd'));
                                                                    setCalendarPopoverOpen(false);
                                                                }
                                                            }}
                                                            locale={ptBR}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="startTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold flex items-center gap-2 text-xs uppercase tracking-wider">
                                                    <Clock className="h-3.5 w-3.5 text-green-500" />
                                                    Início
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="time"
                                                        {...field}
                                                        className="h-10 rounded-lg bg-white border-slate-200 text-sm"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="durationMinutes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold flex items-center gap-2 text-xs uppercase tracking-wider">
                                                <Clock className="h-3.5 w-3.5 text-indigo-500" />
                                                Duração (min)
                                            </FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                        className="h-10 rounded-lg bg-white border-slate-200 w-full text-sm"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <TabsContent value="appointment" className="space-y-6 mt-0">
                                {/* Cliente */}
                                <FormField
                                    control={form.control}
                                    name="clientId"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                                                <User className="h-4 w-4 text-primary" />
                                                Cliente
                                            </FormLabel>
                                            <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            disabled={!!clientId}
                                                            className={cn(
                                                                "w-full justify-between h-12 rounded-xl bg-white/50 border-slate-200 hover:bg-white/80",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {selectedClient ? (
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                                        <span className="text-sm font-bold text-primary">
                                                                            {selectedClient.name.charAt(0).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                    <span className="font-medium">{formatName(selectedClient.name)}</span>
                                                                </div>
                                                            ) : (
                                                                "Selecione um cliente..."
                                                            )}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[400px] p-0 rounded-xl" align="start">
                                                    <Command>
                                                        <CommandInput
                                                            placeholder="Buscar cliente..."
                                                            value={clientSearch}
                                                            onValueChange={setClientSearch}
                                                        />
                                                        <CommandList>
                                                            <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                                                            <CommandGroup>
                                                                {filteredClients.map((client) => (
                                                                    <CommandItem
                                                                        key={client.id}
                                                                        value={client.name}
                                                                        onSelect={() => {
                                                                            form.setValue("clientId", client.id);
                                                                            setClientPopoverOpen(false);
                                                                        }}
                                                                        className="flex items-center gap-3 py-3"
                                                                    >
                                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                                            <span className="text-sm font-bold text-primary">
                                                                                {client.name.charAt(0).toUpperCase()}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <p className="font-medium">{formatName(client.name)}</p>
                                                                            <p className="text-xs text-muted-foreground">{client.phone}</p>
                                                                        </div>
                                                                        <Check
                                                                            className={cn(
                                                                                "h-4 w-4",
                                                                                client.id === field.value ? "opacity-100 text-primary" : "opacity-0"
                                                                            )}
                                                                        />
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Serviços */}
                                <FormField
                                    control={form.control}
                                    name="services"
                                    render={() => (
                                        <FormItem>
                                            <div className="flex items-center justify-between mb-3">
                                                <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                                                    <Scissors className="h-4 w-4 text-orange-500" />
                                                    Serviços
                                                </FormLabel>
                                                {totalDuration > 0 && (
                                                    <Badge variant="secondary" className="rounded-full px-3">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {totalDuration} min
                                                    </Badge>
                                                )}
                                            </div>

                                            {isLoadingServices ? (
                                                <div className="flex items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-100">
                                                    <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
                                                    <span className="ml-2 text-slate-500">Carregando serviços...</span>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        role="combobox"
                                                                        className={cn(
                                                                            "w-full justify-between h-auto min-h-12 rounded-xl bg-white/50 border-slate-200",
                                                                            selectedServices.length === 0 && "text-muted-foreground"
                                                                        )}
                                                                    >
                                                                        <div className="flex flex-wrap gap-1.5 flex-1">
                                                                            {selectedServices.length === 0 ? (
                                                                                <span>Selecione os serviços...</span>
                                                                            ) : (
                                                                                selectedServices.map((serviceId) => {
                                                                                    const service = availableServices.find(s => s.id === serviceId);
                                                                                    if (!service) return null;
                                                                                    return (
                                                                                        <Badge
                                                                                            key={serviceId}
                                                                                            variant="secondary"
                                                                                            className="rounded-md px-2 py-1 font-normal"
                                                                                        >
                                                                                            <span className="font-medium">{service.name}</span>
                                                                                            <span className="ml-1.5 text-xs opacity-70">
                                                                                                {service.duration}min • {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                                                                                            </span>
                                                                                            <span
                                                                                                role="button"
                                                                                                tabIndex={0}
                                                                                                className="ml-1.5 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                                                                                                onKeyDown={(e) => {
                                                                                                    if (e.key === "Enter") {
                                                                                                        e.preventDefault();
                                                                                                        toggleService(serviceId);
                                                                                                    }
                                                                                                }}
                                                                                                onMouseDown={(e) => {
                                                                                                    e.preventDefault();
                                                                                                    e.stopPropagation();
                                                                                                }}
                                                                                                onClick={(e) => {
                                                                                                    e.preventDefault();
                                                                                                    e.stopPropagation();
                                                                                                    toggleService(serviceId);
                                                                                                }}
                                                                                            >
                                                                                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                                                                            </span>
                                                                                        </Badge>
                                                                                    );
                                                                                })
                                                                            )}
                                                                        </div>
                                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-full p-0 rounded-xl" align="start">
                                                                    <Command>
                                                                        <CommandInput placeholder="Buscar serviço..." className="h-9" />
                                                                        <CommandEmpty>Nenhum serviço encontrado</CommandEmpty>
                                                                        <CommandGroup className="max-h-64 overflow-auto">
                                                                            {availableServices.map((service) => {
                                                                                const isSelected = selectedServices.includes(service.id);
                                                                                return (
                                                                                    <CommandItem
                                                                                        key={service.id}
                                                                                        value={service.name}
                                                                                        onSelect={() => toggleService(service.id)}
                                                                                        className="cursor-pointer"
                                                                                    >
                                                                                        <div
                                                                                            className={cn(
                                                                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                                                                isSelected
                                                                                                    ? "bg-primary text-primary-foreground"
                                                                                                    : "opacity-50 [&_svg]:invisible"
                                                                                            )}
                                                                                        >
                                                                                            <Check className="h-3 w-3" />
                                                                                        </div>
                                                                                        <div className="flex-1">
                                                                                            <div className="font-medium">{service.name}</div>
                                                                                            <div className="text-xs text-muted-foreground">
                                                                                                {service.duration} min • {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                                                                                            </div>
                                                                                        </div>
                                                                                    </CommandItem>
                                                                                );
                                                                            })}
                                                                        </CommandGroup>
                                                                    </Command>
                                                                </PopoverContent>
                                                            </Popover>
                                                        </div>
                                                    </FormControl>
                                                </div>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Status */}
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                                                <div className="h-4 w-4 rounded-full bg-gradient-to-r from-amber-400 to-green-400" />
                                                Status
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 rounded-xl bg-white/50 border-slate-200">
                                                        <SelectValue placeholder="Selecione o status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="PENDING">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                                            Pendente
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="CONFIRMED">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                                                            Confirmado
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="DONE">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                                            Finalizado
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="CANCELED">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                                                            Cancelado
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="NO_SHOW">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                                                            Não Compareceu
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold">Observações</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Adicione observações sobre o agendamento..."
                                                    className="min-h-[80px] rounded-xl bg-white/50 border-slate-200 resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            <TabsContent value="block" className="space-y-6">
                                <FormItem>
                                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm flex gap-3 items-start">
                                        <Lock className="w-5 h-5 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold">Modo de Bloqueio</p>
                                            <p className="opacity-90 mt-1">
                                                Use esta opção para bloquear horários pessoais, almoço ou folgas. O horário ficará indisponível na agenda.
                                            </p>
                                        </div>
                                    </div>
                                </FormItem>

                                {/* Hora Final Editável */}
                                <FormItem>
                                    <FormLabel className="text-slate-700 font-semibold flex items-center gap-2 text-xs uppercase tracking-wider">
                                        <Clock className="h-3.5 w-3.5 text-red-500" />
                                        Hora Final
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => {
                                                const newEndTime = e.target.value;
                                                setEndTime(newEndTime);
                                                // Calcular duração a partir de startTime e endTime
                                                const startVal = form.getValues('startTime');
                                                if (startVal && newEndTime) {
                                                    const [sh, sm] = startVal.split(':').map(Number);
                                                    const [eh, em] = newEndTime.split(':').map(Number);
                                                    const diff = (eh * 60 + em) - (sh * 60 + sm);
                                                    if (diff > 0) {
                                                        form.setValue('durationMinutes', diff);
                                                    }
                                                }
                                            }}
                                            className="h-10 rounded-lg bg-white border-slate-200 text-sm"
                                        />
                                    </FormControl>
                                </FormItem>

                                {/* Duração calculada (info) */}
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-500">Duração calculada</span>
                                        <span className="text-sm font-bold text-slate-700">
                                            {form.watch('durationMinutes')} min
                                        </span>
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold">Motivo do Bloqueio</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Ex: Almoço, Compromisso Pessoal, Médico..."
                                                    className="min-h-[80px] rounded-xl bg-white/50 border-slate-200 resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            {/* Botões de ação dentro do form */}
                            <div className="flex gap-3 w-full pt-4 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    className="flex-1 sm:flex-none rounded-xl"
                                >
                                    Cancelar
                                </Button>
                                {activeTab === 'block' ? (
                                    <Button
                                        type="button"
                                        onClick={handleBlockSubmit}
                                        disabled={isSubmitting}
                                        className="flex-1 sm:flex-none rounded-xl shadow-lg bg-rose-600 hover:bg-rose-700 text-white"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="h-4 w-4 mr-2" />
                                                {initialData ? "Atualizar Bloqueio" : "Bloquear Horário"}
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 sm:flex-none rounded-xl shadow-lg shadow-primary/20"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="h-4 w-4 mr-2" />
                                                {initialData ? "Atualizar" : "Agendar"}
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>

                        </form>
                    </Form>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
