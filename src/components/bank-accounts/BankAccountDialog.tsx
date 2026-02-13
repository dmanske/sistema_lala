'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BankAccount, BankAccountType } from '@/core/domain/BankAccount'
import { ColorPicker } from './ColorPicker'
import { IconPicker } from './IconPicker'
import { Star } from 'lucide-react'

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
            name: account?.name || '',
            type: account?.type || 'BANK',
            initialBalance: account?.initialBalance || 0,
            color: account?.color || '#3B82F6',
            icon: account?.icon || '🏦',
            description: account?.description || '',
            creditLimit: account?.creditLimit,
            bankName: account?.bankName || '',
            agency: account?.agency || '',
            accountNumber: account?.accountNumber || '',
            isFavorite: account?.isFavorite || false
        }
    })

    const selectedType = watch('type')
    const selectedColor = watch('color')
    const selectedIcon = watch('icon')
    const isFavorite = watch('isFavorite')

    // Reset form when account changes
    useEffect(() => {
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
                icon: '🏦',
                description: '',
                creditLimit: undefined,
                bankName: '',
                agency: '',
                accountNumber: '',
                isFavorite: false
            })
        }
    }, [account, reset])

    // Update icon and color when type changes
    useEffect(() => {
        if (!isEdit) {
            switch (selectedType) {
                case 'BANK':
                    setValue('icon', '🏦')
                    setValue('color', '#3B82F6')
                    break
                case 'CARD':
                    setValue('icon', '💳')
                    setValue('color', '#EF4444')
                    break
                case 'WALLET':
                    setValue('icon', '💰')
                    setValue('color', '#10B981')
                    break
            }
        }
    }, [selectedType, isEdit, setValue])

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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'Editar Conta' : 'Nova Conta Bancária'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Preview da Conta */}
                    <div className="p-4 rounded-lg border-2 flex items-center gap-3" style={{ borderColor: selectedColor, backgroundColor: `${selectedColor}10` }}>
                        <div className="text-4xl">{selectedIcon}</div>
                        <div className="flex-1">
                            <p className="font-semibold">{watch('name') || 'Nome da Conta'}</p>
                            <p className="text-sm text-muted-foreground">
                                {selectedType === 'BANK' ? 'Banco' : selectedType === 'CARD' ? 'Cartão' : 'Carteira Digital'}
                            </p>
                        </div>
                        {isFavorite && <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Nome da Conta *</Label>
                        <Input
                            id="name"
                            {...register('name', {
                                required: 'Nome é obrigatório',
                                maxLength: { value: 100, message: 'Máximo 100 caracteres' },
                                validate: (value) => value.trim().length > 0 || 'Nome não pode ser vazio'
                            })}
                            placeholder="Ex: Banco Inter, Nubank, Caixa Físico"
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo *</Label>
                            <Select
                                value={selectedType}
                                onValueChange={(value) => setValue('type', value as BankAccountType)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BANK">🏦 Banco</SelectItem>
                                    <SelectItem value="CARD">💳 Cartão</SelectItem>
                                    <SelectItem value="WALLET">💰 Carteira Digital</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>
                                <button
                                    type="button"
                                    onClick={() => setValue('isFavorite', !isFavorite)}
                                    className="flex items-center gap-2 hover:opacity-80"
                                >
                                    <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                    Conta Favorita
                                </button>
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                {isFavorite ? 'Esta é sua conta principal' : 'Marcar como conta principal'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Ícone</Label>
                        <IconPicker value={selectedIcon} onChange={(icon) => setValue('icon', icon)} />
                    </div>

                    <div className="space-y-2">
                        <Label>Cor</Label>
                        <ColorPicker value={selectedColor} onChange={(color) => setValue('color', color)} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição/Observações</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Informações adicionais sobre esta conta..."
                            rows={2}
                        />
                    </div>

                    {!isEdit && (
                        <div className="space-y-2">
                            <Label htmlFor="initialBalance">Saldo Inicial</Label>
                            <Input
                                id="initialBalance"
                                type="number"
                                step="0.01"
                                {...register('initialBalance', {
                                    valueAsNumber: true
                                })}
                                placeholder="0.00"
                            />
                            <p className="text-xs text-muted-foreground">
                                Deixe 0 se estiver começando do zero
                            </p>
                        </div>
                    )}

                    {selectedType === 'CARD' && (
                        <div className="space-y-2">
                            <Label htmlFor="creditLimit">Limite de Crédito</Label>
                            <Input
                                id="creditLimit"
                                type="number"
                                step="0.01"
                                {...register('creditLimit', {
                                    valueAsNumber: true
                                })}
                                placeholder="0.00"
                            />
                            <p className="text-xs text-muted-foreground">
                                Limite disponível no cartão
                            </p>
                        </div>
                    )}

                    <div className="border-t pt-4">
                        <p className="text-sm font-medium mb-3">Dados Bancários (Opcional)</p>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="bankName">Banco/Instituição</Label>
                                <Input
                                    id="bankName"
                                    {...register('bankName')}
                                    placeholder="Ex: Banco Inter, Nubank"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="agency">Agência</Label>
                                    <Input
                                        id="agency"
                                        {...register('agency')}
                                        placeholder="0001"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="accountNumber">Conta</Label>
                                    <Input
                                        id="accountNumber"
                                        {...register('accountNumber')}
                                        placeholder="12345-6"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
