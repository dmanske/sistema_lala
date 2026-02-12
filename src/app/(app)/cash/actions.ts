'use server'

import { getCashMovementRepository } from '@/infrastructure/repositories/factory'
import { CreateCashMovement, CreateCashMovementInput } from '@/core/usecases/cash/CreateCashMovement'
import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
// ...

export async function createCashMovementAction(data: CreateCashMovementInput) {
    const supabase = await createClient()
    const repo = getCashMovementRepository(supabase)
    const useCase = new CreateCashMovement(repo)

    try {
        await useCase.execute({
            type: data.type,
            amount: Number(data.amount),
            method: data.method,
            description: data.description,
            occurredAt: data.occurredAt ? new Date(data.occurredAt) : new Date(),
            createdBy: data.createdBy // Ensure auth context if needed or handle in repo
        })
        revalidatePath('/cash')
        return { success: true }
    } catch (error) {
        console.error('Failed to create cash movement:', error)
        return { success: false, error: 'Falha ao criar movimentação' }
    }
}
