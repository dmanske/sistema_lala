import { CreatePurchaseInput, Purchase } from "@/core/domain/Purchase";
import { PurchaseRepository } from "@/core/repositories/PurchaseRepository";
import { IAccountPayableRepository } from "@/core/repositories/AccountPayableRepository";

interface InstallmentData {
    number: number;
    total: number;
    value: number;
    dueDate: string;
}

export class CreatePurchaseWithInstallments {
    constructor(
        private purchaseRepo: PurchaseRepository,
        private accountPayableRepo: IAccountPayableRepository
    ) { }

    async execute(input: CreatePurchaseInput & {
        paymentType?: string;
        installmentsCount?: number;
        firstDueDate?: string;
        installmentInterval?: number;
    }): Promise<Purchase> {
        // 1. Create Purchase Record (RPC function already creates stock movements)
        const purchase = await this.purchaseRepo.create(input);

        // 2. Create Accounts Payable if not paid immediately
        if (input.paymentType !== 'IMMEDIATE' && input.firstDueDate) {
            const installments = this.calculateInstallments(
                purchase.total,
                input.installmentsCount || 1,
                input.firstDueDate,
                input.installmentInterval || 30
            );

            // Create description based on payment type
            const baseDescription = installments.length > 1
                ? 'Compra parcelada'
                : 'Compra à vista';

            // Add notes if available
            const descriptionSuffix = input.notes 
                ? ` - ${input.notes.slice(0, 60)}${input.notes.length > 60 ? '...' : ''}`
                : '';

            for (const installment of installments) {
                const description = installments.length > 1
                    ? `${baseDescription} - Parcela ${installment.number}/${installment.total}${descriptionSuffix}`
                    : `${baseDescription}${descriptionSuffix}`;

                await this.accountPayableRepo.create({
                    supplierId: purchase.supplierId,
                    amount: installment.value,
                    dueDate: installment.dueDate,
                    description,
                    status: 'PENDING',
                    purchaseId: purchase.id,
                    installmentNumber: installment.number,
                    totalInstallments: installment.total,
                    costCenterId: input.costCenterId,
                    projectId: input.projectId,
                });
            }
        }

        return purchase;
    }

    private calculateInstallments(
        total: number,
        count: number,
        firstDueDate: string,
        intervalDays: number
    ): InstallmentData[] {
        const installments: InstallmentData[] = [];
        const baseValue = Math.floor((total / count) * 100) / 100;
        const remainder = total - (baseValue * count);

        for (let i = 0; i < count; i++) {
            const dueDate = new Date(firstDueDate);
            dueDate.setDate(dueDate.getDate() + (i * intervalDays));
            
            const value = i === count - 1 ? baseValue + remainder : baseValue;
            
            installments.push({
                number: i + 1,
                total: count,
                value,
                dueDate: dueDate.toISOString().split('T')[0],
            });
        }

        return installments;
    }
}
