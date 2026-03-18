"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    ArrowLeft, Calendar, Package, ShoppingBag, Truck, Loader2, CreditCard, Plus, Trash2, Edit, MoreVertical
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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

import { Purchase, calculatePaymentSummary } from "@/core/domain/Purchase";
import { Supplier } from "@/core/domain/Supplier";
import { Product } from "@/core/domain/Product";
import { BankAccount } from "@/core/domain/BankAccount";
import { getPurchaseRepository, getSupplierRepository, getProductRepository, getBankAccountRepository } from "@/infrastructure/repositories/factory";
import { formatPhone } from "@/core/formatters/phone";
import { formatDate } from "@/lib/utils/dateFormatters";
import { RegisterPurchasePaymentDialog } from "@/components/purchases/RegisterPurchasePaymentDialog";
import { toast } from "sonner";

export default function PurchaseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [purchase, setPurchase] = useState<Purchase | null>(null);
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [products, setProducts] = useState<Map<string, string>>(new Map());
    const [bankAccounts, setBankAccounts] = useState<Map<string, string>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const purchaseRepo = getPurchaseRepository();
    const supplierRepo = getSupplierRepository();
    const productRepo = getProductRepository();
    const bankAccountRepo = getBankAccountRepository();

    const loadPurchase = async () => {
        if (!params.id) return;
        try {
            const p = await purchaseRepo.getById(params.id as string);
            if (!p) {
                router.push("/purchases");
                return;
            }
            setPurchase(p);

            const [s, prodList, accountList] = await Promise.all([
                supplierRepo.getById(p.supplierId),
                productRepo.getAll(),
                bankAccountRepo.list()
            ]);

            if (s) setSupplier(s);

            const prodMap = new Map<string, string>();
            prodList.forEach(prod => prodMap.set(prod.id, prod.name));
            setProducts(prodMap);

            const accountMap = new Map<string, string>();
            accountList.forEach(acc => accountMap.set(acc.id, acc.name));
            setBankAccounts(accountMap);

        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPurchase();
    }, [params.id]);

    const handlePaymentSuccess = () => {
        loadPurchase(); // Reload to get updated payments
    };

    const handleDelete = async () => {
        if (!purchase) return;

        setIsDeleting(true);
        try {
            await purchaseRepo.delete(purchase.id);
            toast.success("Compra excluída com sucesso!");
            router.push("/purchases");
            router.refresh();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Erro ao excluir compra");
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    const canEdit = purchase && (!purchase.payments || purchase.payments.length === 0);

    if (isLoading) return (
        <div className="space-y-6 pb-10 animate-pulse">
            <div className="flex items-center gap-4">
                <div className="h-9 w-9 rounded-full bg-slate-100" />
                <div className="space-y-2">
                    <div className="h-6 w-48 bg-slate-100 rounded-lg" />
                    <div className="h-4 w-32 bg-slate-100 rounded" />
                </div>
            </div>
            <div className="h-24 rounded-2xl bg-slate-100" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 h-64 rounded-2xl bg-slate-100" />
                <div className="h-48 rounded-2xl bg-slate-100" />
            </div>
        </div>
    );
    if (!purchase) return null;

    const paymentSummary = calculatePaymentSummary(purchase);
    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const getStatusBadge = (status: string) => {
        const variants = {
            PENDING: { label: 'Pendente', className: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-50' },
            PARTIAL: { label: 'Parcial', className: 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-50' },
            PAID: { label: 'Pago', className: 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-50' },
        };
        const variant = variants[status as keyof typeof variants] || variants.PENDING;
        return <Badge variant="secondary" className={variant.className}>{variant.label}</Badge>;
    };

    const getMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            CASH: 'Dinheiro',
            PIX: 'PIX',
            CARD: 'Cartão',
            TRANSFER: 'Transferência',
            WALLET: 'Carteira Digital',
        };
        return labels[method] || method;
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                            <Package className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight font-heading">
                                    Entrada de Estoque
                                </h1>
                                {getStatusBadge(purchase.paymentStatus)}
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                <Calendar className="h-3.5 w-3.5" /> {formatDate(purchase.date)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {paymentSummary.remaining > 0 && (
                        <Button onClick={() => setPaymentDialogOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Registrar Pagamento
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => router.push(`/purchases/${purchase.id}/edit`)}
                                disabled={!canEdit}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar Compra
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setDeleteDialogOpen(true)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir Compra
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Payment Summary Card */}
            {purchase.paymentStatus !== 'PAID' && (
                <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5">
                    <div className="grid grid-cols-3 gap-4 divide-x divide-amber-200">
                        <div className="pr-4">
                            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Total</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(paymentSummary.total)}</p>
                        </div>
                        <div className="px-4">
                            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Pago</p>
                            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(paymentSummary.paid)}</p>
                        </div>
                        <div className="pl-4">
                            <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">Restante</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(paymentSummary.remaining)}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Details */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-white/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-purple-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-heading">
                                <ShoppingBag className="h-5 w-5 text-primary" /> Itens da Compra
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl border border-white/10 overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-white/5 border-white/10 hover:bg-white/5">
                                            <TableHead>Produto</TableHead>
                                            <TableHead className="text-center">Qtd.</TableHead>
                                            <TableHead className="text-right">Custo Unit.</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {purchase.items?.map((item, index) => (
                                            <TableRow key={index} className="hover:bg-white/5 border-white/10">
                                                <TableCell className="font-medium text-slate-700">
                                                    {products.get(item.productId) || "Produto removido"}
                                                </TableCell>
                                                <TableCell className="text-center">{item.quantity}</TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(item.unitCost)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(item.quantity * item.unitCost)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex justify-end pt-6">
                                <div className="text-right bg-primary/5 p-4 rounded-xl border border-primary/10 min-w-[200px]">
                                    <p className="text-sm text-muted-foreground mb-1">Total</p>
                                    <p className="text-3xl font-bold text-primary font-heading">
                                        {formatCurrency(purchase.total)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment History */}
                    {purchase.payments && purchase.payments.length > 0 && (
                        <Card className="border-white/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-purple-500/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-heading">
                                    <CreditCard className="h-5 w-5 text-green-500" /> Histórico de Pagamentos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {purchase.payments.map((payment) => (
                                        <div key={payment.id} className="flex items-center justify-between p-4 bg-white/40 rounded-lg border border-white/20">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">{getMethodLabel(payment.method)}</Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        {format(new Date(payment.paidAt), "dd/MM/yyyy 'às' HH:mm")}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Conta: {bankAccounts.get(payment.bankAccountId) || 'Desconhecida'}
                                                </p>
                                                {payment.notes && (
                                                    <p className="text-xs text-slate-600 mt-1">{payment.notes}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-green-600">
                                                    {formatCurrency(payment.amount)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {purchase.notes && (
                        <Card className="border-white/20 bg-card/40 backdrop-blur-xl shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Observações</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{purchase.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Supplier Info */}
                <div className="md:col-span-1">
                    <Card className="border-white/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-purple-500/5 h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-heading text-lg">
                                <Truck className="h-5 w-5 text-muted-foreground" /> Fornecedor
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {supplier ? (
                                <div className="space-y-4">
                                    <div>
                                        <p className="font-bold text-lg text-slate-800">{supplier.name}</p>
                                        <Badge variant={supplier.status === 'ACTIVE' ? 'outline' : 'secondary'} className="mt-2 text-xs">
                                            {supplier.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </div>
                                    <Separator className="bg-white/10" />
                                    <div className="space-y-2 text-sm text-slate-600">
                                        {supplier.phone && <p>Tel: {formatPhone(supplier.phone)}</p>}
                                        {supplier.email && <p>Email: {supplier.email}</p>}
                                        {supplier.cnpj && <p>CNPJ: {supplier.cnpj}</p>}
                                    </div>
                                    <Button variant="outline" className="w-full bg-white/40 border-white/20" onClick={() => router.push(`/suppliers/${supplier.id}`)}>
                                        Ver Perfil
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic">Fornecedor não encontrado ou removido.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <RegisterPurchasePaymentDialog
                isOpen={paymentDialogOpen}
                onOpenChange={setPaymentDialogOpen}
                purchaseId={purchase.id}
                remainingAmount={paymentSummary.remaining}
                onSuccess={handlePaymentSuccess}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir esta compra? Esta ação:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Reverterá as movimentações de estoque</li>
                                <li>Reverterá os pagamentos registrados</li>
                                <li>Não poderá ser desfeita</li>
                            </ul>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
