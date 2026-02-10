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

import {
    Appointment,
    CreateAppointmentInput,
    CreateAppointmentSchema,
    MOCK_PROFESSIONALS,
    ServiceLine
} from "@/core/domain/Appointment";
import { AppointmentService } from "@/core/services/AppointmentService";
import { LocalStorageAppointmentRepository } from "@/infrastructure/repositories/LocalStorageAppointmentRepository";
import { LocalStorageClientRepository } from "@/infrastructure/repositories/LocalStorageClientRepository";
import { LocalStorageServiceRepository } from "@/infrastructure/repositories/LocalStorageServiceRepository";
import { Client } from "@/core/domain/Client";
import { Service } from "@/core/domain/Service";
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
    const [isLoadingServices, setIsLoadingServices] = useState(true);

    const [clientSearch, setClientSearch] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clientPopoverOpen, setClientPopoverOpen] = useState(false);
    const [calendarPopoverOpen, setCalendarPopoverOpen] = useState(false);

    const appointmentService = new AppointmentService(new LocalStorageAppointmentRepository());
    const clientRepo = new LocalStorageClientRepository();
    const serviceRepo = new LocalStorageServiceRepository();

    const form = useForm<CreateAppointmentInput>({
        resolver: zodResolver(CreateAppointmentSchema),
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

    // Initialize/Reset Form
    useEffect(() => {
        if (isOpen && !isLoadingServices) {
            if (initialData) {
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
                    recurrenceRule: (initialData as any).recurrenceRule // Preserve if exists
                });
            } else {
                // New Appointment Defaults
                const targetDate = defaultDate || format(new Date(), 'yyyy-MM-dd');
                const targetTime = defaultTime || "09:00";

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
            }
        }
    }, [isOpen, initialData, clientId, defaultDate, defaultTime, availableServices, isLoadingServices, form]);

    const onSubmit: SubmitHandler<CreateAppointmentInput> = async (data) => {
        setIsSubmitting(true);
        try {
            // Ensure serviceLines are passed correctly
            const payload = {
                ...data,
                // Ensure manual overrides or simple syncing
                // data.serviceLines should be up to date from form state
            };

            if (initialData) {
                await appointmentService.update(initialData.id, payload);
                toast.success("Agendamento atualizado!");
            } else {
                await appointmentService.create(payload);
                toast.success("Agendamento criado!");
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
                        {initialData ? "Editar Agendamento" : "Novo Agendamento"}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData ? "Atualize os dados do agendamento." : "Preencha os dados para agendar."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 py-4">
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

                        {/* Profissional */}
                        <FormField
                            control={form.control}
                            name="professionalId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                                        <Scissors className="h-4 w-4 text-purple-500" />
                                        Profissional
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-12 rounded-xl bg-white/50 border-slate-200">
                                                <SelectValue placeholder="Selecione o profissional" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl">
                                            {MOCK_PROFESSIONALS.map(p => (
                                                <SelectItem key={p.id} value={p.id} className="py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center">
                                                            <span className="text-xs font-bold text-purple-600">
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

                        {/* Data e Horário */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4 text-blue-500" />
                                            Data
                                        </FormLabel>
                                        <Popover open={calendarPopoverOpen} onOpenChange={setCalendarPopoverOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "h-12 rounded-xl bg-white/50 border-slate-200 justify-start text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(new Date(field.value + 'T00:00:00'), "dd 'de' MMMM, yyyy", { locale: ptBR })
                                                        ) : (
                                                            "Selecione a data"
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
                                        <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-green-500" />
                                            Horário
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="time"
                                                {...field}
                                                className="h-12 rounded-xl bg-white/50 border-slate-200"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Serviços Real Database */}
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
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                            {availableServices.length === 0 && (
                                                <div className="col-span-2 text-center p-4 text-muted-foreground border-2 border-dashed rounded-xl">
                                                    Nenhum serviço cadastrado.
                                                </div>
                                            )}

                                            {availableServices.map((service) => {
                                                const isSelected = selectedServices.includes(service.id);
                                                return (
                                                    <div
                                                        key={service.id}
                                                        onClick={() => toggleService(service.id)}
                                                        className={cn(
                                                            "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none",
                                                            isSelected
                                                                ? "bg-primary/5 border-primary shadow-sm"
                                                                : "bg-white/50 border-slate-200 hover:border-primary/30 hover:bg-white/80"
                                                        )}
                                                    >
                                                        <div
                                                            className={cn(
                                                                "h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0",
                                                                isSelected
                                                                    ? "bg-primary border-primary text-white"
                                                                    : "border-slate-300 bg-white"
                                                            )}
                                                        >
                                                            {isSelected && <Check className="h-3.5 w-3.5" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-slate-800 truncate">{service.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {service.duration} min • {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* Legacy/Deleted Services Handling */}
                                            {initialData?.services?.map(sId => {
                                                if (availableServices.some(s => s.id === sId)) return null; // Already shown
                                                // If we are here, sId is in initialData but not in availableServices (Deleted?)
                                                const isSelected = selectedServices.includes(sId);
                                                if (!isSelected) return null; // If unselected, don't show ghost

                                                return (
                                                    <div
                                                        key={sId}
                                                        onClick={() => toggleService(sId)}
                                                        className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer bg-red-50 border-red-200 opacity-80"
                                                        title="Este serviço não existe mais no catálogo"
                                                    >
                                                        <div className="h-5 w-5 rounded-md border-2 border-red-400 bg-red-400 text-white flex items-center justify-center">
                                                            <Check className="h-3.5 w-3.5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1 text-red-700">
                                                                <AlertCircle className="h-3 w-3" />
                                                                <p className="font-semibold truncate text-sm">Serviço Indisponível</p>
                                                            </div>
                                                            <p className="text-xs text-red-500">
                                                                Mantido pelo histórico
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Duração (readonly, calculada automaticamente) */}
                        <FormField
                            control={form.control}
                            name="durationMinutes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-indigo-500" />
                                        Duração Total
                                    </FormLabel>
                                    <FormControl>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                className="h-12 rounded-xl bg-white/50 border-slate-200 w-24"
                                            />
                                            <span className="text-sm text-muted-foreground">minutos</span>
                                            <span className="text-xs text-muted-foreground ml-auto">
                                                (calculado automaticamente)
                                            </span>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Status do Agendamento */}
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

                        {/* Observações */}
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
                    </form>
                </Form>

                <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 sm:flex-none rounded-xl"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            onClick={form.handleSubmit(onSubmit)}
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
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
