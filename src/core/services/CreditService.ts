import { CreateCreditMovementInput, CreditMovement } from "@/core/domain/Credit";
import { CreditRepository } from "@/core/repositories/CreditRepository";
import { ClientRepository } from "@/core/repositories/ClientRepository";

export class CreditService {
    constructor(
        private creditRepo: CreditRepository,
        private clientRepo: ClientRepository
    ) { }

    async addCredit(clientId: string, input: CreateCreditMovementInput): Promise<CreditMovement> {
        const movement: CreditMovement = {
            id: crypto.randomUUID(),
            clientId,
            type: 'CREDIT',
            amount: input.amount,
            origin: input.origin,
            note: input.note,
            createdAt: new Date().toISOString(),
        };

        return this.creditRepo.create(movement);
    }

    async getHistory(clientId: string): Promise<CreditMovement[]> {
        return this.creditRepo.getByClientId(clientId);
    }
}
