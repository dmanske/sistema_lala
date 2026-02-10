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

interface DeleteServiceDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    serviceName: string;
    serviceId: string;
    onConfirm: () => void;
}

export function DeleteServiceDialog({
    isOpen,
    onOpenChange,
    serviceName,
    onConfirm,
}: DeleteServiceDialogProps) {
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
                        Excluir Serviço?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-600">
                        Você tem certeza que deseja excluir o serviço <span className="font-bold text-purple-700">{serviceName}</span>?
                        <br /><br />
                        <span className="text-purple-600 font-medium">Esta ação não pode ser desfeita e todo o histórico será perdido.</span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl border-slate-200 hover:bg-slate-50">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-500/20"
                    >
                        Sim, excluir serviço
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
