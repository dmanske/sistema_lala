"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Package, Scissors, Droplets, AlertTriangle } from "lucide-react";
import { Appointment } from "@/core/domain/Appointment";
import { Service } from "@/core/domain/Service";
import { Product } from "@/core/domain/Product";
import { UsageProduct, UsageProductLog } from "@/core/domain/UsageProduct";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUsageProducts } from "@/hooks/useUsageProducts";

interface FinalizeAppointmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointment: Appointment | null;
    services: Service[];
    products: Product[];
    onFinalize: (data: {
        finalizedServices: Array<{ serviceId: string; name: string; price: number; professionalId: string }>;
        usedProducts: Array<{ productId: string; name: string; price: number; cost: number; quantity: number }>;
        usageProductsUsed?: Array<{ usageProductId: string; amountUsed: number; notes?: string; formulaChangeReason?: string }>;
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

    // Usage products (consumption control)
    const [usageItems, setUsageItems] = useState<Array<{
        usageProductId: string;
        amountUsed: number;
        notes: string;
    }>>([]);
    const [lastFormula, setLastFormula] = useState<UsageProductLog[] | null>(null);
    const [formulaChanged, setFormulaChanged] = useState(false);
    const [formulaChangeReason, setFormulaChangeReason] = useState("");
    const [formulaDiffs, setFormulaDiffs] = useState<string[]>([]);

    const { products: usageProducts, getLastFormulaForClient } = useUsageProducts();

    const [loading, setLoading] = useState(false);

    // Detect formula changes
    const detectFormulaChanges = useCallback((
        currentItems: Array<{ usageProductId: string; amountUsed: number }>,
        previousFormula: UsageProductLog[] | null
    ) => {
        if (!previousFormula || previousFormula.length === 0) {
            if (currentItems.length > 0) {
                setFormulaChanged(true);
                setFormulaDiffs(["🆕 Primeira fórmula registrada para esta cliente"]);
            } else {
                setFormulaChanged(false);
                setFormulaDiffs([]);
            }
            return;
        }

        const diffs: string[] = [];
        const prevMap = new Map(previousFormula.map(p => [p.usageProductId, p]));
        const currMap = new Map(currentItems.map(c => [c.usageProductId, c]));

        // Check for new or changed products
        for (const item of currentItems) {
            const prev = prevMap.get(item.usageProductId);
            const product = usageProducts.find(p => p.id === item.usageProductId);
            const name = product?.name || "Produto";
            if (!prev) {
                diffs.push(`🆕 Adicionado: ${name} (${item.amountUsed}${product?.measurementUnit || ''})`);
            } else if (prev.amountUsed !== item.amountUsed) {
                diffs.push(`📝 Alterado: ${name} — ${prev.amountUsed}${product?.measurementUnit || ''} → ${item.amountUsed}${product?.measurementUnit || ''}`);
            }
        }

        // Check for removed products
        for (const prev of previousFormula) {
            if (!currMap.has(prev.usageProductId)) {
                const product = usageProducts.find(p => p.id === prev.usageProductId);
                diffs.push(`❌ Removido: ${product?.name || prev.productName || "Produto"}`);
            }
        }

        setFormulaChanged(diffs.length > 0);
        setFormulaDiffs(diffs);
    }, [usageProducts]);

    // Initialize with appointment data
    useEffect(() => {
        if (appointment && open) {
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
            setUsageItems([]);
            setFormulaChanged(false);
            setFormulaChangeReason("");
            setFormulaDiffs([]);

            // Fetch last formula for client
            if (appointment.clientId) {
                getLastFormulaForClient(appointment.clientId).then(formula => {
                    setLastFormula(formula);
                });
            }
        }
    }, [appointment, services, open, getLastFormulaForClient]);

    // Re-check formula changes when usage items change
    useEffect(() => {
        if (open) {
            detectFormulaChanges(usageItems, lastFormula);
        }
    }, [usageItems, lastFormula, open, detectFormulaChanges]);

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

    // Usage product handlers
    const addUsageItem = () => {
        setUsageItems([...usageItems, { usageProductId: "", amountUsed: 0, notes: "" }]);
    };

    const removeUsageItem = (index: number) => {
        setUsageItems(usageItems.filter((_, i) => i !== index));
    };

    const updateUsageItem = (index: number, field: string, value: any) => {
        const updated = [...usageItems];
        updated[index] = { ...updated[index], [field]: value };
        setUsageItems(updated);
    };

    const handleSubmit = async () => {
        if (finalizedServices.length === 0) {
            alert("Adicione pelo menos um serviço realizado");
            return;
        }

        if (finalizedServices.some(s => !s.serviceId)) {
            alert("Selecione todos os serviços");
            return;
        }

        if (usedProducts.some(p => !p.productId)) {
            alert("Selecione todos os produtos");
            return;
        }

        // Validate usage items
        if (usageItems.some(u => !u.usageProductId)) {
            alert("Selecione todos os produtos de consumo");
            return;
        }
        if (usageItems.some(u => u.amountUsed <= 0)) {
            alert("Informe a quantidade utilizada para todos os produtos de consumo");
            return;
        }

        // If formula changed, require reason
        if (formulaChanged && usageItems.length > 0 && !formulaChangeReason.trim()) {
            alert("A fórmula foi alterada. Informe o motivo da alteração.");
            return;
        }

        setLoading(true);
        try {
            const usageData = usageItems.length > 0 ? usageItems.map(item => ({
                usageProductId: item.usageProductId,
                amountUsed: item.amountUsed,
                notes: item.notes || undefined,
                formulaChangeReason: formulaChanged ? formulaChangeReason : undefined,
            })) : undefined;

            await onFinalize({ finalizedServices, usedProducts, usageProductsUsed: usageData });
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

                    {/* Usage Products Section (Consumption Control) */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <Label className="text-base font-semibold flex items-center gap-2">
                                <Droplets className="h-4 w-4" />
                                Produtos de Consumo Utilizados
                            </Label>
                            <Button type="button" variant="outline" size="sm" onClick={addUsageItem}>
                                <Plus className="h-4 w-4 mr-1" />
                                Adicionar
                            </Button>
                        </div>

                        {usageItems.length === 0 && (
                            <p className="text-sm text-muted-foreground italic">
                                Nenhum produto de consumo adicionado (ex: coloração, oxidante).
                            </p>
                        )}

                        <div className="space-y-3">
                            {usageItems.map((item, index) => {
                                const selectedProduct = usageProducts.find(p => p.id === item.usageProductId);
                                return (
                                    <div key={index} className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <Label className="text-xs">Produto</Label>
                                            <Select
                                                value={item.usageProductId}
                                                onValueChange={(value) => updateUsageItem(index, "usageProductId", value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {usageProducts.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>
                                                            {p.name} ({p.contentAmount - p.currentConsumed}{p.measurementUnit} restante)
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-28">
                                            <Label className="text-xs">
                                                Qtd ({selectedProduct?.measurementUnit || 'g/ml'})
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                value={item.amountUsed || ""}
                                                onChange={(e) => updateUsageItem(index, "amountUsed", parseFloat(e.target.value) || 0)}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="w-36">
                                            <Label className="text-xs">Obs (opcional)</Label>
                                            <Input
                                                value={item.notes}
                                                onChange={(e) => updateUsageItem(index, "notes", e.target.value)}
                                                placeholder="Ex: raiz"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeUsageItem(index)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Formula change alert */}
                        {formulaChanged && usageItems.length > 0 && (
                            <div className="mt-4 space-y-3">
                                <Alert variant="destructive" className="border-amber-300 bg-amber-50 text-amber-900 [&>svg]:text-amber-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Fórmula alterada</AlertTitle>
                                    <AlertDescription>
                                        <div className="space-y-1 mt-1">
                                            {formulaDiffs.map((diff, i) => (
                                                <div key={i} className="text-sm">{diff}</div>
                                            ))}
                                        </div>
                                    </AlertDescription>
                                </Alert>
                                <div>
                                    <Label className="text-sm font-medium">
                                        Motivo da alteração <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        value={formulaChangeReason}
                                        onChange={(e) => setFormulaChangeReason(e.target.value)}
                                        placeholder="Ex: Cliente pediu para clarear mais, mudança de tom..."
                                        className="mt-1"
                                        rows={2}
                                    />
                                </div>
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
