"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Calendar as CalendarIcon,
    Clock,
    User,
    Scissors,
    Check,
    ChevronsUpDown,
    X,
    Loader2
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
    MOCK_SERVICES
} from "@/core/domain/Appointment";
import { AppointmentService } from "@/core/services/AppointmentService";
import { LocalStorageAppointmentRepository } from "@/infrastructure/repositories/LocalStorageAppointmentRepository";
import { LocalStorageClientRepository } from "@/infrastructure/repositories/LocalStorageClientRepository";
import { Client } from "@/core/domain/Client";
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
    const [isSearchingClients, setIsSearchingClients] = useState(false);
    const [clientSearch, setClientSearch] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clientPopoverOpen, setClientPopoverOpen] = useState(false);
    const [calendarPopoverOpen, setCalendarPopoverOpen] = useState(false);

    // Ref para evitar loops no cálculo de duração
    const lastServicesRef = useRef<string[]>([]);

    const appointmentService = new AppointmentService(new LocalStorageAppointmentRepository());
    const clientRepo = new LocalStorageClientRepository();

    const form = useForm<any>({
        resolver: zodResolver(CreateAppointmentSchema),
        defaultValues: {
            clientId: clientId || "",
            professionalId: "",
            services: [],
            date: defaultDate || format(new Date(), 'yyyy-MM-dd'),
            startTime: defaultTime || "09:00",
            durationMinutes: 30,
            status: "PENDING",
            notes: ""
        },
    });

    // Resetar form quando abrir com novos defaults
    useEffect(() => {
        if (isOpen && !initialData) {
            const targetDate = defaultDate || format(new Date(), 'yyyy-MM-dd');
            const targetTime = defaultTime || "09:00";

            form.reset({
                clientId: clientId || "",
                professionalId: "",
                services: [],
                date: targetDate,
                startTime: targetTime,
                durationMinutes: 30,
                status: "PENDING",
                notes: ""
            });

            // Forçar atualização dos campos específicos para garantir UI
            form.setValue("date", targetDate);
            form.setValue("startTime", targetTime);

        } else if (isOpen && initialData) {
            form.reset(initialData);
        }
    }, [isOpen, defaultDate, defaultTime, initialData, form, clientId]);

    // Watch services para calcular duração automaticamente...

    // Watch services para calcular duração automaticamente
    const watchedServices = useWatch({
        control: form.control,
        name: "services",
        defaultValue: []
    });

    // Calcular duração automaticamente quando serviços mudam
    useEffect(() => {
        if (initialData) return; // Não recalcular para edição

        const currentServices = watchedServices || [];
        const prevServices = lastServicesRef.current;

        // Verificar se realmente mudou
        const hasChanged =
            currentServices.length !== prevServices.length ||
            currentServices.some((s: string, i: number) => s !== prevServices[i]);

        if (hasChanged && currentServices.length > 0) {
            const totalDuration = currentServices.reduce((acc: number, serviceId: string) => {
                const service = MOCK_SERVICES.find(s => s.id === serviceId);
                return acc + (service?.duration || 0);
            }, 0);

            if (totalDuration > 0) {
                form.setValue("durationMinutes", totalDuration, { shouldValidate: false });
            }

            lastServicesRef.current = [...currentServices];
        }
    }, [watchedServices, initialData, form]);

    // Carregar clientes
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

    // Reset form quando abrir/fechar
    useEffect(() => {
        if (isOpen) {
            lastServicesRef.current = [];

            if (initialData) {
                form.reset({
                    clientId: initialData.clientId,
                    professionalId: initialData.professionalId,
                    services: initialData.services,
                    date: initialData.date,
                    startTime: initialData.startTime,
                    durationMinutes: initialData.durationMinutes,
                    status: initialData.status,
                    notes: initialData.notes || ""
                });
                lastServicesRef.current = [...initialData.services];
            } else {
                // Usar defaultDate e defaultTime do slot clicado, ou valores padrão
                const targetDate = defaultDate || format(new Date(), 'yyyy-MM-dd');
                const targetTime = defaultTime || "09:00";

                form.reset({
                    clientId: clientId || "",
                    professionalId: "",
                    services: [],
                    date: targetDate,
                    startTime: targetTime,
                    durationMinutes: 30,
                    status: "PENDING",
                    notes: ""
                });
            }
        }
    }, [isOpen, initialData, clientId, form, defaultDate, defaultTime]);

    const onSubmit = async (data: CreateAppointmentInput) => {
        setIsSubmitting(true);
        try {
            if (initialData) {
                await appointmentService.update(initialData.id, data);
                toast.success("Agendamento atualizado!");
            } else {
                await appointmentService.create(data);
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

    // Toggle serviço
    const toggleService = useCallback((serviceId: string) => {
        const current = form.getValues("services") || [];
        const isSelected = current.includes(serviceId);
        const newServices = isSelected
            ? current.filter((id: string) => id !== serviceId)
            : [...current, serviceId];
        form.setValue("services", newServices, { shouldValidate: true });
    }, [form]);

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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                        {selectedServices.length > 0 && (
                                            <Badge variant="secondary" className="rounded-full px-3">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {totalDuration} min
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2">
                                        {MOCK_SERVICES.map((service) => {
                                            const isSelected = selectedServices.includes(service.id);
                                            return (
                                                <div
                                                    key={service.id}
                                                    onClick={() => toggleService(service.id)}
                                                    className={cn(
                                                        "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
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
                                    </div>
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
                                                (calculado automaticamente pelos serviços)
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
