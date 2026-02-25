import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface PaymentStatusBadgeProps {
    status: "PENDING" | "PARTIAL" | "PAID";
    totalAmount: number;
    paidAmount: number;
    showTooltip?: boolean;
}

export function PaymentStatusBadge({
    status,
    totalAmount,
    paidAmount,
    showTooltip = true,
}: PaymentStatusBadgeProps) {
    const remainingAmount = totalAmount - paidAmount;
    const paidPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

    const statusConfig = {
        PENDING: {
            label: "Pendente",
            className: "bg-yellow-50 text-yellow-700 border-yellow-200",
            icon: Clock,
            iconColor: "text-yellow-600",
        },
        PARTIAL: {
            label: "Parcial",
            className: "bg-blue-50 text-blue-700 border-blue-200",
            icon: AlertCircle,
            iconColor: "text-blue-600",
        },
        PAID: {
            label: "Pago",
            className: "bg-green-50 text-green-700 border-green-200",
            icon: CheckCircle2,
            iconColor: "text-green-600",
        },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    const badge = (
        <Badge
            variant="secondary"
            className={`text-xs border ${config.className} flex items-center gap-1`}
        >
            <Icon className={`h-3 w-3 ${config.iconColor}`} />
            {config.label}
        </Badge>
    );

    if (!showTooltip) {
        return badge;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{badge}</TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    <div className="space-y-2">
                        <div className="flex justify-between gap-4">
                            <span className="text-xs text-muted-foreground">Total:</span>
                            <span className="text-xs font-semibold">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(totalAmount)}
                            </span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-xs text-muted-foreground">Pago:</span>
                            <span className="text-xs font-semibold text-green-600">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(paidAmount)}
                            </span>
                        </div>
                        {status !== "PAID" && (
                            <div className="flex justify-between gap-4">
                                <span className="text-xs text-muted-foreground">Restante:</span>
                                <span className="text-xs font-semibold text-red-600">
                                    {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    }).format(remainingAmount)}
                                </span>
                            </div>
                        )}
                        <div className="pt-2 border-t">
                            <div className="flex justify-between gap-4 mb-1">
                                <span className="text-xs text-muted-foreground">Progresso:</span>
                                <span className="text-xs font-semibold">
                                    {paidPercentage.toFixed(0)}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5">
                                <div
                                    className={`h-1.5 rounded-full transition-all ${
                                        status === "PAID"
                                            ? "bg-green-500"
                                            : status === "PARTIAL"
                                            ? "bg-blue-500"
                                            : "bg-yellow-500"
                                    }`}
                                    style={{ width: `${paidPercentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
