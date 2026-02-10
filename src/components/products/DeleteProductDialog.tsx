import { useState, useEffect } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteProductDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    productName: string;
    productId: string;
    onConfirm: () => void;
}

export function DeleteProductDialog({
    isOpen,
    onOpenChange,
    productName,
    onConfirm,
}: DeleteProductDialogProps) {
    const [open, setOpen] = useState(isOpen);

    useEffect(() => {
        setOpen(isOpen);
    }, [isOpen]);

    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold text-slate-800">
                        Excluir Produto?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-600">
                        Você tem certeza que deseja excluir o produto <span className="font-bold text-slate-800">{productName}</span>?
                        <br /><br />
                        <span className="text-red-500 font-medium">Esta ação não pode ser desfeita e todo o histórico será perdido.</span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl border-slate-200 hover:bg-slate-50">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/20"
                    >
                        Sim, excluir produto
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
