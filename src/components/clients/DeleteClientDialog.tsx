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
import { LocalStorageClientRepository } from "@/infrastructure/repositories/LocalStorageClientRepository";

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

    const repo = new LocalStorageClientRepository();
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
                <DialogContent className="sm:max-w-md border-orange-500/50">
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
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button variant="ghost" onClick={() => handleOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button variant="default" onClick={handleInactivate} disabled={isDeleting} className="bg-orange-600 hover:bg-orange-700">
                            {isDeleting ? "Processando..." : "Inativar Cliente"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
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
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => handleOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirmDelete}
                        disabled={isDeleting}
                        className="gap-2"
                    >
                        {isDeleting ? (
                            "Verificando..."
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" />
                                Excluir Permanentemente
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
