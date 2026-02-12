'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BankAccount, BankAccountType } from '@/core/domain/BankAccount'

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
}

export function BankAccountDialog({ open, onOpenChange, account, onSave }: BankAccountDialogProps) {
    const [loading, setLoading] = useState(false)
    const isEdit = !!account

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
        defaultValues: {
            name: account?.name || '',
            type: account?.type || 'BANK',
            initialBalance: account?.initialBalance || 0
        }
    })

    const selectedType = watch('type')

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
                                <SelectItem value="BANK">Banco</SelectItem>
                                <SelectItem value="CARD">Cartão</SelectItem>
                                <SelectItem value="WALLET">Carteira Digital</SelectItem>
                            </SelectContent>
                        </Select>
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
