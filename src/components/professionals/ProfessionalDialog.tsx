import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CreateProfessionalSchema, CreateProfessionalInput, Professional } from "@/core/domain/Professional";
import { Loader2 } from "lucide-react";

interface ProfessionalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    professional?: Professional;
    onSubmit: (data: CreateProfessionalInput) => Promise<void>;
}

const PRESET_COLORS = [
    { name: "Roxo", value: "#8b5cf6" },
    { name: "Rosa", value: "#ec4899" },
    { name: "Verde", value: "#10b981" },
    { name: "Azul", value: "#3b82f6" },
    { name: "Laranja", value: "#f97316" },
    { name: "Vermelho", value: "#ef4444" },
    { name: "Amarelo", value: "#eab308" },
    { name: "Ciano", value: "#06b6d4" },
];

export function ProfessionalDialog({
    open,
    onOpenChange,
    professional,
    onSubmit,
}: ProfessionalDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!professional;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<CreateProfessionalInput>({
        resolver: zodResolver(CreateProfessionalSchema),
        defaultValues: {
            name: "",
            phone: "",
            email: "",
            color: "#8b5cf6",
            status: "ACTIVE" as const,
            commission: 0,
        },
    });

    const selectedColor = watch("color") || "#8b5cf6";

    useEffect(() => {
        if (professional) {
            reset({
                name: professional.name,
                phone: professional.phone || "",
                email: professional.email || "",
                color: professional.color || "#8b5cf6",
                status: professional.status || "ACTIVE",
                commission: professional.commission || 0,
            });
        } else {
            reset({
                name: "",
                phone: "",
                email: "",
                color: "#8b5cf6",
                status: "ACTIVE" as const,
                commission: 0,
            });
        }
    }, [professional, reset]);

    const onSubmitForm = async (data: CreateProfessionalInput) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
            onOpenChange(false);
            reset();
        } catch (error) {
            console.error("Error submitting professional:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-slate-800">
                        {isEditing ? "Editar Profissional" : "Novo Profissional"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                        {isEditing
                            ? "Atualize as informações do profissional."
                            : "Adicione um novo profissional à equipe."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome *</Label>
                        <Input
                            id="name"
                            {...register("name")}
                            placeholder="Ex: Maria Silva"
                            className="rounded-xl"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                                id="phone"
                                {...register("phone")}
                                placeholder="(00) 00000-0000"
                                className="rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="commission">Comissão (%)</Label>
                            <Input
                                id="commission"
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                {...register("commission", { valueAsNumber: true })}
                                placeholder="0"
                                className="rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            {...register("email")}
                            placeholder="maria@exemplo.com"
                            className="rounded-xl"
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="color">Cor de Identificação</Label>
                        <div className="flex gap-2">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setValue("color", color.value)}
                                    className={`h-10 w-10 rounded-full border-2 transition-all ${selectedColor === color.value
                                        ? "border-slate-800 scale-110"
                                        : "border-slate-200 hover:scale-105"
                                        }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={watch("status")}
                            onValueChange={(value: "ACTIVE" | "INACTIVE") => setValue("status", value)}
                        >
                            <SelectTrigger className="rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACTIVE">Ativo</SelectItem>
                                <SelectItem value="INACTIVE">Inativo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-500/20"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : isEditing ? (
                                "Atualizar"
                            ) : (
                                "Criar Profissional"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
