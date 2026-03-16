"use client";

import { useState, useEffect } from "react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteUsageProductDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    productName: string;
    onConfirm: () => void;
}

export function DeleteUsageProductDialog({ isOpen, onOpenChange, productName, onConfirm }: DeleteUsageProductDialogProps) {
    const [open, setOpen] = useState(isOpen);
    useEffect(() => { setOpen(isOpen); }, [isOpen]);

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold text-slate-800">Excluir Produto de Consumo?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-600">
                        Você tem certeza que deseja excluir <span className="font-bold text-teal-700">{productName}</span>?
                        <br /><br />
                        <span className="text-teal-600 font-medium">Todo o histórico de consumo será perdido.</span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl border-slate-200 hover:bg-slate-50">Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-500/20">
                        Sim, excluir
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
