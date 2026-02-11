"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, Trash2, Ban } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClientService, BusinessError } from "@/core/services/ClientService";
import { getClientRepository } from "@/infrastructure/repositories/factory";

interface DeleteClientDialogProps {
    clientId: string;
    clientName: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function DeleteClientDialog({
    clientId,
    clientName,
    isOpen,
    onOpenChange,
    onSuccess,
}: DeleteClientDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [blockedConfig, setBlockedConfig] = useState<{ isBlocked: boolean; message: string }>({
        isBlocked: false,
        message: "",
    });

    const repo = getClientRepository();
    const service = new ClientService(repo);
    const router = useRouter();

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // Reset state when closing
            setBlockedConfig({ isBlocked: false, message: "" });
        }
        onOpenChange(open);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            await service.delete(clientId);
            toast.success("Cliente removido com sucesso.");
            onOpenChange(false);
            onSuccess?.();
            router.refresh();
            if (window.location.pathname.includes(clientId)) {
                router.push('/clients');
            }
        } catch (error) {
            if (error instanceof BusinessError) {
                setBlockedConfig({
                    isBlocked: true,
                    message: error.message,
                });
            } else {
                toast.error("Erro ao deletar cliente.");
                console.error(error);
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const handleInactivate = async () => {
        setIsDeleting(true);
        try {
            await service.update(clientId, { status: "INACTIVE" });
            toast.success("Cliente inativado com sucesso.");
            onOpenChange(false);
            onSuccess?.();
            router.refresh();
        } catch (error) {
            toast.error("Erro ao inativar cliente.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (blockedConfig.isBlocked) {
        return (
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-md border-orange-200 bg-white/60 backdrop-blur-2xl rounded-2xl">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-orange-600 mb-2">
                            <Ban className="h-6 w-6" />
                            <DialogTitle>Ação Bloqueada</DialogTitle>
                        </div>
                        <DialogDescription className="pt-2 text-base">
                            {blockedConfig.message}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-orange-50 p-4 rounded-md text-sm text-orange-800 border border-orange-100 mt-2">
                        Este cliente possui histórico financeiro ou agendamentos. Por segurança e integridade dos dados, a exclusão não é permitida.
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4 pt-2">
                        <Button variant="ghost" onClick={() => handleOpenChange(false)} className="h-11 rounded-xl order-2 sm:order-1">
                            Voltar
                        </Button>
                        <Button variant="default" onClick={handleInactivate} disabled={isDeleting} className="bg-orange-600 hover:bg-orange-700 h-11 rounded-xl order-1 sm:order-2">
                            {isDeleting ? "Processando..." : "Inativar em vez de excluir"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md border-white/20 bg-white/60 backdrop-blur-2xl rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Confirmar Exclusão
                    </DialogTitle>
                    <DialogDescription>
                        Tem certeza que deseja excluir o cliente <strong>{clientName}</strong>?
                        <br />
                        Esta ação não poderá ser desfeita se não houver histórico.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button variant="ghost" onClick={() => handleOpenChange(false)} className="h-11 rounded-xl order-2 sm:order-1">
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirmDelete}
                        disabled={isDeleting}
                        className="gap-2 h-11 rounded-xl order-1 sm:order-2"
                    >
                        {isDeleting ? (
                            "Verificando..."
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" />
                                Confirmar Exclusão
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
