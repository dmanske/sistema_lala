'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BankAccount, BankAccountType } from '@/core/domain/BankAccount'
import { ColorPicker } from './ColorPicker'
import { LogoPicker } from './LogoPicker'
import { Star, Building2, CreditCard, Wallet } from 'lucide-react'

import { BankLogos } from './BankLogos'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'


interface BankAccountDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    account?: BankAccount | null
    onSave: (data: FormData) => Promise<void>
}

interface FormData {
    name: string
    type: BankAccountType
    initialBalance?: number
    color: string
    icon: string
    description?: string
    creditLimit?: number
    bankName?: string
    agency?: string
    accountNumber?: string
    isFavorite: boolean
}

export function BankAccountDialog({ open, onOpenChange, account, onSave }: BankAccountDialogProps) {
    const [loading, setLoading] = useState(false)
    const isEdit = !!account

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
        defaultValues: {
            name: '',
            type: 'BANK',
            initialBalance: 0,
            color: '#3B82F6',
            icon: 'generic-bank',
            description: '',
            isFavorite: false
        }
    })

    const selectedType = watch('type')
    const selectedColor = watch('color')
    const selectedIcon = watch('icon')
    const isFavorite = watch('isFavorite')

    // Reset form when account changes
    useEffect(() => {
        if (open) {
            if (account) {
                reset({
                    name: account.name,
                    type: account.type,
                    initialBalance: account.initialBalance,
                    color: account.color,
                    icon: account.icon,
                    description: account.description || '',
                    creditLimit: account.creditLimit,
                    bankName: account.bankName || '',
                    agency: account.agency || '',
                    accountNumber: account.accountNumber || '',
                    isFavorite: account.isFavorite
                })
            } else {
                reset({
                    name: '',
                    type: 'BANK',
                    initialBalance: 0,
                    color: '#3B82F6',
                    icon: 'generic-bank',
                    description: '',
                    creditLimit: undefined,
                    bankName: '',
                    agency: '',
                    accountNumber: '',
                    isFavorite: false
                })
            }
        }
    }, [account, open, reset])

    // Update default icon/color when type changes only if creating
    useEffect(() => {
        if (!isEdit && open) {
            switch (selectedType) {
                case 'BANK':
                    if (selectedIcon === 'generic-card' || selectedIcon === 'generic-wallet') {
                        setValue('icon', 'generic-bank')
                        setValue('color', '#3B82F6')
                    }
                    break
                case 'CARD':
                    if (selectedIcon === 'generic-bank' || selectedIcon === 'generic-wallet') {
                        setValue('icon', 'generic-card')
                        setValue('color', '#EF4444')
                    }
                    break
                case 'WALLET':
                    if (selectedIcon === 'generic-bank' || selectedIcon === 'generic-card') {
                        setValue('icon', 'generic-wallet')
                        setValue('color', '#10B981')
                    }
                    break
            }
        }
    }, [selectedType, isEdit, setValue, open, selectedIcon])

    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true)
            await onSave(data)
            onOpenChange(false)
        } catch (error) {
            console.error('Error saving account:', error)
        } finally {
            setLoading(false)
        }
    }

    const LogoComponent = BankLogos[selectedIcon] || BankLogos['generic-bank']

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[700px] max-h-[85vh] h-full flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-4 border-b shrink-0 bg-background z-10">
                    <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                        <div
                            className="h-8 w-8 flex items-center justify-center rounded-md transition-all shadow-sm"
                            style={{ backgroundColor: `${selectedColor}15`, color: selectedColor }}
                        >
                            <LogoComponent className="h-5 w-5" />
                        </div>
                        {isEdit ? 'Editar Conta' : 'Nova Conta'}
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 w-full">
                    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">

                        {/* Tipo de Conta */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'BANK', label: 'Conta Bancária', icon: <Building2 className="w-5 h-5 mb-1" /> },
                                { id: 'CARD', label: 'Cartão de Crédito', icon: <CreditCard className="w-5 h-5 mb-1" /> },
                                { id: 'WALLET', label: 'Carteira / Dinheiro', icon: <Wallet className="w-5 h-5 mb-1" /> },
                            ].map(type => (
                                <div
                                    key={type.id}
                                    onClick={() => setValue('type', type.id as BankAccountType)}
                                    className={cn(
                                        "cursor-pointer rounded-xl border p-3 flex flex-col items-center justify-center text-center transition-all hover:bg-muted/50 hover:border-primary/50",
                                        selectedType === type.id
                                            ? "border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary/20"
                                            : "border-border bg-card text-muted-foreground"
                                    )}
                                >
                                    {type.icon}
                                    <span className="text-[11px] font-medium leading-tight">{type.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left: Main Info */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome da Conta <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="name"
                                        {...register('name', { required: 'Nome é obrigatório' })}
                                        placeholder="Ex: Nubank Principal"
                                        className={errors.name ? 'border-destructive' : ''}
                                    />
                                    {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {!isEdit && (
                                        <div className="space-y-2">
                                            <Label htmlFor="initialBalance">Saldo Inicial</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">R$</span>
                                                <Input
                                                    id="initialBalance"
                                                    type="number"
                                                    step="0.01"
                                                    className="pl-8"
                                                    {...register('initialBalance', { valueAsNumber: true })}
                                                    placeholder="0,00"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {selectedType === 'CARD' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="creditLimit">Limite Total</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">R$</span>
                                                <Input
                                                    id="creditLimit"
                                                    type="number"
                                                    step="0.01"
                                                    className="pl-8"
                                                    {...register('creditLimit', { valueAsNumber: true })}
                                                    placeholder="0,00"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 rounded-lg border bg-muted/20 space-y-3">
                                    <Label className="text-xs font-semibold uppercase text-muted-foreground">Personalização</Label>
                                    <div className="flex items-center justify-between gap-4">
                                        <ColorPicker value={selectedColor} onChange={(color) => setValue('color', color)} />

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                "h-8 text-xs font-medium transition-colors",
                                                isFavorite ? "text-yellow-600 bg-yellow-100 hover:bg-yellow-200 hover:text-yellow-700" : "text-muted-foreground hover:text-foreground"
                                            )}
                                            onClick={() => setValue('isFavorite', !isFavorite)}
                                        >
                                            <Star className={cn("w-3.5 h-3.5 mr-1.5", isFavorite && "fill-current")} />
                                            {isFavorite ? 'Favorita' : 'Marcar como Favorita'}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Bank Selection */}
                            <div className="space-y-3">
                                <Label>Selecione o Ícone/Banco</Label>
                                <div className="border rounded-lg p-1 bg-background">
                                    <LogoPicker
                                        value={selectedIcon}
                                        onChange={(icon, color) => {
                                            setValue('icon', icon)
                                            if (color) setValue('color', color)
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Optional Details (Collapsible or just standard) */}
                        <div className="space-y-3 pt-2 border-t">
                            <Label className="text-xs text-muted-foreground uppercase font-medium">Informações Adicionais (Opcional)</Label>

                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    {...register('bankName')}
                                    placeholder="Nome do Banco"
                                    className="h-8 text-sm"
                                />
                                <div className="flex gap-2">
                                    <Input
                                        {...register('agency')}
                                        placeholder="Agência"
                                        className="h-8 text-sm"
                                    />
                                    <Input
                                        {...register('accountNumber')}
                                        placeholder="Conta"
                                        className="h-8 text-sm"
                                    />
                                </div>
                            </div>

                            <Textarea
                                {...register('description')}
                                placeholder="Observações..."
                                rows={2}
                                className="resize-none h-16 text-sm"
                            />
                        </div>

                        {/* Submit Button (Hidden, triggered by footer) */}
                        <button type="submit" className="hidden" id="submit-account-form" />
                    </form>
                </ScrollArea>

                <div className="p-4 border-t bg-background shrink-0 flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => document.getElementById('submit-account-form')?.click()}
                        disabled={loading}
                        className="min-w-[120px]"
                    >
                        {loading ? 'Salvando...' : (isEdit ? 'Salvar Alterações' : 'Criar Conta')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
