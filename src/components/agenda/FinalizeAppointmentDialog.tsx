"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Package, Scissors } from "lucide-react";
import { Appointment } from "@/core/domain/Appointment";
import { Service } from "@/core/domain/Service";
import { Product } from "@/core/domain/Product";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FinalizeAppointmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointment: Appointment | null;
    services: Service[];
    products: Product[];
    onFinalize: (data: {
        finalizedServices: Array<{ serviceId: string; name: string; price: number; professionalId: string }>;
        usedProducts: Array<{ productId: string; name: string; price: number; cost: number; quantity: number }>;
    }) => Promise<void>;
}

export function FinalizeAppointmentDialog({
    open,
    onOpenChange,
    appointment,
    services,
    products,
    onFinalize
}: FinalizeAppointmentDialogProps) {
    const [finalizedServices, setFinalizedServices] = useState<Array<{
        serviceId: string;
        name: string;
        price: number;
        professionalId: string;
    }>>([]);

    const [usedProducts, setUsedProducts] = useState<Array<{
        productId: string;
        name: string;
        price: number;
        cost: number;
        quantity: number;
    }>>([]);

    const [loading, setLoading] = useState(false);

    // Initialize with appointment data
    useEffect(() => {
        if (appointment && open) {
            // Pre-fill services from appointment
            const initialServices = appointment.serviceLines?.map(line => {
                const service = services.find(s => s.id === line.serviceId);
                return {
                    serviceId: line.serviceId,
                    name: service?.name || "Serviço",
                    price: line.priceOverride || line.priceSnapshot,
                    professionalId: appointment.professionalId
                };
            }) || [];
            
            setFinalizedServices(initialServices);
            setUsedProducts([]);
        }
    }, [appointment, services, open]);

    const addService = () => {
        setFinalizedServices([...finalizedServices, {
            serviceId: "",
            name: "",
            price: 0,
            professionalId: appointment?.professionalId || ""
        }]);
    };

    const removeService = (index: number) => {
        setFinalizedServices(finalizedServices.filter((_, i) => i !== index));
    };

    const updateService = (index: number, field: string, value: any) => {
        const updated = [...finalizedServices];
        if (field === "serviceId") {
            const service = services.find(s => s.id === value);
            if (service) {
                updated[index] = {
                    ...updated[index],
                    serviceId: value,
                    name: service.name,
                    price: service.price
                };
            }
        } else {
            updated[index] = { ...updated[index], [field]: value };
        }
        setFinalizedServices(updated);
    };

    const addProduct = () => {
        setUsedProducts([...usedProducts, {
            productId: "",
            name: "",
            price: 0,
            cost: 0,
            quantity: 1
        }]);
    };

    const removeProduct = (index: number) => {
        setUsedProducts(usedProducts.filter((_, i) => i !== index));
    };

    const updateProduct = (index: number, field: string, value: any) => {
        const updated = [...usedProducts];
        if (field === "productId") {
            const product = products.find(p => p.id === value);
            if (product) {
                updated[index] = {
                    ...updated[index],
                    productId: value,
                    name: product.name,
                    price: product.price,
                    cost: product.cost
                };
            }
        } else {
            updated[index] = { ...updated[index], [field]: value };
        }
        setUsedProducts(updated);
    };

    const handleSubmit = async () => {
        if (finalizedServices.length === 0) {
            alert("Adicione pelo menos um serviço realizado");
            return;
        }

        // Validate all services are selected
        if (finalizedServices.some(s => !s.serviceId)) {
            alert("Selecione todos os serviços");
            return;
        }

        // Validate all products are selected
        if (usedProducts.some(p => !p.productId)) {
            alert("Selecione todos os produtos");
            return;
        }

        setLoading(true);
        try {
            await onFinalize({ finalizedServices, usedProducts });
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : "Erro ao finalizar agendamento");
        } finally {
            setLoading(false);
        }
    };

    const totalServices = finalizedServices.reduce((sum, s) => sum + s.price, 0);
    const totalProducts = usedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const total = totalServices + totalProducts;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Finalizar Atendimento</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Services Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <Label className="text-base font-semibold flex items-center gap-2">
                                <Scissors className="h-4 w-4" />
                                Serviços Realizados
                            </Label>
                            <Button type="button" variant="outline" size="sm" onClick={addService}>
                                <Plus className="h-4 w-4 mr-1" />
                                Adicionar
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {finalizedServices.map((service, index) => (
                                <div key={index} className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <Label className="text-xs">Serviço</Label>
                                        <Select
                                            value={service.serviceId}
                                            onValueChange={(value) => updateService(index, "serviceId", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {services.map(s => (
                                                    <SelectItem key={s.id} value={s.id}>
                                                        {s.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-32">
                                        <Label className="text-xs">Valor</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={service.price}
                                            onChange={(e) => updateService(index, "price", parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeService(index)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-2 text-right text-sm font-semibold">
                            Subtotal Serviços: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalServices)}
                        </div>
                    </div>

                    <Separator />

                    {/* Products Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <Label className="text-base font-semibold flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Produtos Utilizados
                            </Label>
                            <Button type="button" variant="outline" size="sm" onClick={addProduct}>
                                <Plus className="h-4 w-4 mr-1" />
                                Adicionar
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {usedProducts.map((product, index) => (
                                <div key={index} className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <Label className="text-xs">Produto</Label>
                                        <Select
                                            value={product.productId}
                                            onValueChange={(value) => updateProduct(index, "productId", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.name} (Estoque: {p.currentStock})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-20">
                                        <Label className="text-xs">Qtd</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={product.quantity}
                                            onChange={(e) => updateProduct(index, "quantity", parseInt(e.target.value) || 1)}
                                        />
                                    </div>
                                    <div className="w-32">
                                        <Label className="text-xs">Preço Unit.</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={product.price}
                                            onChange={(e) => updateProduct(index, "price", parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeProduct(index)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {usedProducts.length > 0 && (
                            <div className="mt-2 text-right text-sm font-semibold">
                                Subtotal Produtos: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalProducts)}
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Total */}
                    <div className="bg-primary/5 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold">Total do Atendimento</span>
                            <span className="text-2xl font-bold text-primary">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                            </span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Finalizando..." : "Finalizar Atendimento"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
