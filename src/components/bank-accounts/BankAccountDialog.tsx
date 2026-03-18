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

import { BankLogos, BANK_PRESETS } from './BankLogos'
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

const TYPE_OPTIONS = [
    { id: 'BANK' as BankAccountType, label: 'Conta Bancária', icon: Building2, color: '#3B82F6' },
    { id: 'CARD' as BankAccountType, label: 'Cartão de Crédito', icon: CreditCard, color: '#EF4444' },
    { id: 'WALLET' as BankAccountType, label: 'Carteira / Dinheiro', icon: Wallet, color: '#10B981' },
]

export function BankAccountDialog({ open, onOpenChange, account, onSave }: BankAccountDialogProps) {
    const [loading, setLoading] = useState(false)
    const [headerImgFailed, setHeaderImgFailed] = useState(false)
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

    // Reset header img state when icon changes
    useEffect(() => {
        setHeaderImgFailed(false)
    }, [selectedIcon])

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
    const selectedPreset = BANK_PRESETS.find(p => p.id === selectedIcon)
    const headerHasImage = !!selectedPreset?.imageUrl && !headerImgFailed
    const typeLabel = TYPE_OPTIONS.find(t => t.id === selectedType)?.label ?? ''

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[700px] max-h-[90vh] h-full flex flex-col p-0 gap-0 overflow-hidden">

                {/* ── Header ── */}
                <DialogHeader className="shrink-0">
                    {/* Colored accent strip */}
                    <div
                        className="h-1 w-full transition-all duration-300"
                        style={{ background: `linear-gradient(90deg, ${selectedColor}, ${selectedColor}66)` }}
                    />

                    <div className="px-6 py-4 flex items-center gap-4">
                        {/* Large logo preview */}
                        <div
                            className="h-[52px] w-[52px] flex-shrink-0 flex items-center justify-center rounded-2xl transition-all duration-300"
                            style={{
                                backgroundColor: `${selectedColor}18`,
                                boxShadow: `0 4px 16px ${selectedColor}30`,
                            }}
                        >
                            {headerHasImage ? (
                                <img
                                    src={selectedPreset!.imageUrl}
                                    alt={selectedPreset!.name}
                                    className="w-8 h-8 object-contain"
                                    onError={() => setHeaderImgFailed(true)}
                                />
                            ) : (
                                <LogoComponent className="w-7 h-7" style={{ color: selectedColor }} />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-xl font-bold leading-tight">
                                {isEdit ? 'Editar Conta' : 'Nova Conta'}
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-0.5">{typeLabel}</p>
                        </div>

                        {/* Favorite toggle in header */}
                        <button
                            type="button"
                            onClick={() => setValue('isFavorite', !isFavorite)}
                            className={cn(
                                "p-2 rounded-full transition-all",
                                isFavorite
                                    ? "text-yellow-500 bg-yellow-100 hover:bg-yellow-200"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                            title={isFavorite ? 'Remover dos favoritos' : 'Marcar como favorita'}
                        >
                            <Star className={cn("w-4 h-4", isFavorite && "fill-current")} />
                        </button>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 w-full">
                    <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-2 pt-4 space-y-5">

                        {/* Tipo de Conta */}
                        <div className="grid grid-cols-3 gap-2.5">
                            {TYPE_OPTIONS.map(type => {
                                const Icon = type.icon
                                const isActive = selectedType === type.id
                                return (
                                    <div
                                        key={type.id}
                                        onClick={() => setValue('type', type.id)}
                                        className={cn(
                                            "cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center justify-center text-center transition-all",
                                            isActive
                                                ? "shadow-sm"
                                                : "border-border bg-card text-muted-foreground hover:bg-muted/40 hover:border-muted-foreground/30"
                                        )}
                                        style={isActive ? {
                                            borderColor: `${type.color}60`,
                                            backgroundColor: `${type.color}0D`,
                                            color: type.color,
                                        } : {}}
                                    >
                                        <Icon className="w-5 h-5 mb-1.5" />
                                        <span className="text-[11px] font-semibold leading-tight">{type.label}</span>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Left: Main Info */}
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name">
                                        Nome da Conta <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        {...register('name', { required: 'Nome é obrigatório' })}
                                        placeholder="Ex: Nubank Principal"
                                        className={errors.name ? 'border-destructive' : ''}
                                    />
                                    {errors.name && (
                                        <span className="text-xs text-destructive">{errors.name.message}</span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {!isEdit && (
                                        <div className="space-y-1.5">
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
                                        <div className="space-y-1.5">
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

                                {/* Cor */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                                        Cor da Conta
                                    </Label>
                                    <ColorPicker value={selectedColor} onChange={(color) => setValue('color', color)} />
                                </div>
                            </div>

                            {/* Right: Bank Selection */}
                            <div className="space-y-1.5">
                                <Label>Ícone / Banco</Label>
                                <div className="border rounded-xl p-2 bg-background">
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

                        {/* Optional Details */}
                        <div className="space-y-3 pt-1 border-t">
                            <Label className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                                Informações Adicionais (Opcional)
                            </Label>

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
                                className="resize-none h-14 text-sm"
                            />
                        </div>

                        {/* Hidden submit trigger */}
                        <button type="submit" className="hidden" id="submit-account-form" />
                    </form>
                </ScrollArea>

                <div className="px-6 py-4 border-t bg-background shrink-0 flex justify-end gap-2">
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
                        className="min-w-[130px]"
                        style={{ backgroundColor: selectedColor, borderColor: selectedColor }}
                    >
                        {loading ? 'Salvando...' : (isEdit ? 'Salvar Alterações' : 'Criar Conta')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
