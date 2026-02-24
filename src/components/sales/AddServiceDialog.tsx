
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Scissors } from "lucide-react"
import { cn } from "@/lib/utils"
import { useServices } from "@/hooks/useServices"
import { Service } from "@/core/domain/Service"
import { toast } from "sonner"

interface AddServiceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAdd: (service: Service, qty: number, price: number) => void
}

export function AddServiceDialog({ open, onOpenChange, onAdd }: AddServiceDialogProps) {
    const { services } = useServices()
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [qty, setQty] = useState(1)
    const [price, setPrice] = useState(0)
    const [comboboxOpen, setComboboxOpen] = useState(false)

    const handleSelect = (service: Service) => {
        setSelectedService(service)
        setPrice(service.price ?? 0)
        setComboboxOpen(false)
    }

    const handleSubmit = () => {
        if (!selectedService) {
            toast.error("Selecione um serviço")
            return
        }
        if (qty <= 0) {
            toast.error("Quantidade inválida")
            return
        }
        if (price < 0) {
            toast.error("Preço inválido")
            return
        }
        onAdd(selectedService, qty, price)
        onOpenChange(false)
        // Reset
        setSelectedService(null)
        setQty(1)
        setPrice(0)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Serviço</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Busque e adicione serviços ao atendimento.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Service Select */}
                    <div className="flex flex-col gap-2">
                        <Label>Serviço</Label>
                        <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={comboboxOpen}
                                    className="w-full justify-between"
                                >
                                    {selectedService ? selectedService.name : "Selecione um serviço..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0">
                                <Command>
                                    <CommandInput placeholder="Buscar serviço..." />
                                    <CommandList>
                                        <CommandEmpty>Nenhum serviço encontrado.</CommandEmpty>
                                        <CommandGroup>
                                            {services.map((service) => (
                                                <CommandItem
                                                    key={service.id}
                                                    value={service.name}
                                                    onSelect={() => handleSelect(service)}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedService?.id === service.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex items-center justify-between w-full">
                                                        <span>{service.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500">
                                                                {service.duration}min
                                                            </span>
                                                            <span className="text-xs font-medium text-gray-700">
                                                                R$ {service.price?.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Service Info Card */}
                    {selectedService && (
                        <div className="p-3 rounded-lg border bg-purple-50 border-purple-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Scissors className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm font-medium">Duração:</span>
                                </div>
                                <span className="text-sm font-bold text-purple-600">
                                    {selectedService.duration} minutos
                                </span>
                            </div>
                            <div className="mt-2 text-xs text-gray-600">
                                Valor padrão: <span className="font-medium">R$ {selectedService.price?.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label>Quantidade</Label>
                            <Input
                                type="number"
                                min={1}
                                value={qty}
                                onChange={(e) => setQty(Number(e.target.value))}
                                disabled={!selectedService}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Valor Unit. (R$)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                disabled={!selectedService}
                            />
                        </div>
                    </div>
                    {/* Subtotal preview */}
                    {selectedService && (
                        <div className="text-right text-sm text-muted-foreground">
                            Subtotal: R$ {(qty * price).toFixed(2)}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button 
                        onClick={handleSubmit}
                        disabled={!selectedService}
                    >
                        Confirmar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
