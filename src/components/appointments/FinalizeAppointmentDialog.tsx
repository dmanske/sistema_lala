"use client";

import { useEffect, useState, useMemo } from "react";
import { Loader2, Plus, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { Appointment } from "@/core/domain/Appointment";
import { useProducts } from "@/hooks/useProducts";
import { useServices } from "@/hooks/useServices";
import { FinalizationService } from "@/core/services/FinalizationService";
import { LocalStorageAppointmentRepository } from "@/infrastructure/repositories/LocalStorageAppointmentRepository";
import { LocalStorageProductRepository } from "@/infrastructure/repositories/LocalStorageProductRepository";

interface FinalizeAppointmentDialogProps {
    appointment: Appointment;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function FinalizeAppointmentDialog({ appointment, open, onOpenChange, onSuccess }: FinalizeAppointmentDialogProps) {
    const { products } = useProducts();
    const { services: availableServices } = useServices();

    // Local State for Finalization
    const [selectedServices, setSelectedServices] = useState<any[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);

    // Initial Load Logic
    useEffect(() => {
        if (open && appointment) {
            // Pre-fill existing services from appointment
            // Wait, appointment.services is ID[], need to get details
            // But since availableServices loads async, we might not have them immediately if not cached.
            // Simplified: If availableServices loaded, map.

            const initialServices = appointment.services.map(sId => {
                const s = availableServices.find(as => as.id === sId);
                return {
                    serviceId: sId,
                    name: s?.name || "Serviço Removido",
                    price: s?.price || 0,
                    professionalId: appointment.professionalId // Default to appointment professional
                };
            });
            setSelectedServices(initialServices);
            setSelectedProducts([]);
        }
    }, [open, appointment, availableServices]);

    // Format Helpers
    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    // Totals
    const totalServices = useMemo(() => selectedServices.reduce((acc, s) => acc + s.price, 0), [selectedServices]);
    const totalProducts = useMemo(() => selectedProducts.reduce((acc, p) => acc + (p.price * p.quantity), 0), [selectedProducts]);
    const grandTotal = totalServices + totalProducts;

    // Actions
    const handleAddProduct = (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        // Check if already added
        const existing = selectedProducts.find(p => p.productId === productId);
        if (existing) {
            // Increment
            setSelectedProducts(prev => prev.map(p => p.productId === productId ? { ...p, quantity: p.quantity + 1 } : p));
        } else {
            // Add new
            setSelectedProducts(prev => [...prev, {
                productId: product.id,
                name: product.name,
                price: product.price,
                cost: product.cost,
                quantity: 1
            }]);
        }
    };

    const handleRemoveProduct = (productId: string) => {
        setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
    };

    const handleUpdateProductIdx = (idx: number, field: string, value: any) => {
        const newProducts = [...selectedProducts];
        newProducts[idx] = { ...newProducts[idx], [field]: value };
        setSelectedProducts(newProducts);
    };

    const handleServicePriceChange = (idx: number, cancelVal: string) => { // cancelVal is string from input
        const val = parseFloat(cancelVal);
        const newServices = [...selectedServices];
        newServices[idx] = { ...newServices[idx], price: isNaN(val) ? 0 : val };
        setSelectedServices(newServices);
    };

    const handleFinalize = async () => {
        setSubmitting(true);
        try {
            const service = new FinalizationService(
                new LocalStorageAppointmentRepository(),
                new LocalStorageProductRepository()
            );

            await service.finalize(appointment.id, {
                services: selectedServices,
                products: selectedProducts
            });

            toast.success("Atendimento finalizado com sucesso!");
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Erro ao finalizar atendimento");
        } finally {
            setSubmitting(false);
        }
    };

    const [productComboOpen, setProductComboOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Finalizar Atendimento</DialogTitle>
                    <DialogDescription>
                        Confirme os serviços realizados e adicione produtos utilizados/vendidos.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* SERVIÇOS */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-lg">1. Serviços Realizados</h3>
                            {/* Could add button to add extra service here if needed */}
                        </div>
                        <div className="border rounded-md divide-y">
                            {selectedServices.map((service, idx) => (
                                <div key={idx} className="p-3 grid grid-cols-[1fr_120px] gap-4 items-center">
                                    <span className="font-medium">{service.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground mr-1">R$</span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={service.price}
                                            onChange={(e) => handleServicePriceChange(idx, e.target.value)}
                                            className="h-8 text-right font-bold w-24"
                                        />
                                    </div>
                                </div>
                            ))}
                            {selectedServices.length === 0 && (
                                <div className="p-4 text-center text-muted-foreground text-sm">Nenhum serviço selecionado.</div>
                            )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                            Subtotal Serviços: <span className="font-bold text-foreground">{formatCurrency(totalServices)}</span>
                        </div>
                    </div>

                    {/* PRODUTOS */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-lg">2. Produtos (Consumo/Venda)</h3>

                            <Popover open={productComboOpen} onOpenChange={setProductComboOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-[200px] justify-between">
                                        Adicionar Produto...
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0" align="end">
                                    <Command>
                                        <CommandInput placeholder="Buscar produto..." />
                                        <CommandList>
                                            <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                                            <CommandGroup>
                                                {products.map((product) => (
                                                    <CommandItem
                                                        key={product.id}
                                                        value={product.name}
                                                        onSelect={() => {
                                                            handleAddProduct(product.id);
                                                            setProductComboOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedProducts.some(p => p.productId === product.id) ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {product.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="border rounded-md divide-y">
                            {selectedProducts.map((product, idx) => (
                                <div key={product.productId} className="p-3 grid grid-cols-[1fr_80px_100px_40px] gap-4 items-center">
                                    <span className="font-medium text-sm">{product.name}</span>

                                    <div className="flex items-center gap-1">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={product.quantity}
                                            onChange={(e) => handleUpdateProductIdx(idx, 'quantity', parseInt(e.target.value) || 1)}
                                            className="h-8 w-16 text-center"
                                        />
                                        <span className="text-xs text-muted-foreground">und</span>
                                    </div>

                                    <div className="text-right font-medium text-sm">
                                        {formatCurrency(product.price * product.quantity)}
                                    </div>

                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleRemoveProduct(product.productId)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {selectedProducts.length === 0 && (
                                <div className="p-4 text-center text-muted-foreground text-sm">Nenhum produto adicionado.</div>
                            )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                            Subtotal Produtos: <span className="font-bold text-foreground">{formatCurrency(totalProducts)}</span>
                        </div>
                    </div>

                    {/* TOTAL */}
                    <div className="bg-primary/5 rounded-lg p-6 flex justify-between items-center border border-primary/20">
                        <span className="text-lg font-semibold text-primary">Total Final</span>
                        <span className="text-3xl font-bold text-primary">{formatCurrency(grandTotal)}</span>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleFinalize} disabled={submitting || grandTotal <= 0} className="bg-green-600 hover:bg-green-700 text-white font-bold px-8">
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        FINALIZAR E RECEBER
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
