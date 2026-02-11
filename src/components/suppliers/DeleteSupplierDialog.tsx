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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DeleteSupplier } from "@/core/usecases/suppliers/DeleteSupplier";
import { getSupplierRepository, getPurchaseRepository } from "@/infrastructure/repositories/factory";

interface DeleteSupplierDialogProps {
    supplierId: string;
    supplierName: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function DeleteSupplierDialog({
    supplierId,
    supplierName,
    isOpen,
    onOpenChange,
    onSuccess,
}: DeleteSupplierDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [blockedConfig, setBlockedConfig] = useState<{ isBlocked: boolean; message: string }>({
        isBlocked: false,
        message: "",
    });

    const supplierRepo = getSupplierRepository();
    const purchaseRepo = getPurchaseRepository();
    const deleteUseCase = new DeleteSupplier(supplierRepo, purchaseRepo);

    const router = useRouter();

    const handleOpenChange = (open: boolean) => {
        if (!open) setBlockedConfig({ isBlocked: false, message: "" });
        onOpenChange(open);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteUseCase.execute(supplierId);
            toast.success("Fornecedor removido com sucesso.");
            onOpenChange(false);
            onSuccess?.();
            router.refresh();
            if (window.location.pathname.includes(supplierId)) {
                router.push('/suppliers');
            }
        } catch (error: any) {
            if (error.message.includes("Não é possível excluir")) {
                setBlockedConfig({
                    isBlocked: true,
                    message: error.message,
                });
            } else {
                toast.error(error.message || "Erro ao deletar fornecedor.");
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const handleInactivate = async () => {
        setIsDeleting(true);
        try {
            await supplierRepo.update(supplierId, { status: "INACTIVE" });
            toast.success("Fornecedor inativado com sucesso.");
            onOpenChange(false);
            onSuccess?.();
            router.refresh();
        } catch (error) {
            toast.error("Erro ao inativar fornecedor.");
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
                        Este fornecedor possui histórico de compras. Para manter a integridade fiscal/estoque, a exclusão não é permitida.
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4 pt-2">
                        <Button variant="ghost" onClick={() => handleOpenChange(false)} className="h-11 rounded-xl order-2 sm:order-1">
                            Voltar
                        </Button>
                        <Button variant="default" onClick={handleInactivate} disabled={isDeleting} className="bg-orange-600 hover:bg-orange-700 h-11 rounded-xl order-1 sm:order-2">
                            {isDeleting ? "Processando..." : "Inativar Fornecedor"}
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
                        Tem certeza que deseja excluir o fornecedor <strong>{supplierName}</strong>?
                        <br />
                        Esta ação removerá o cadastro se não houver vínculos.
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
                        {isDeleting ? "Verificando..." : (
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
