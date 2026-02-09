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

        // 1. Save movement
        await this.creditRepo.create(movement);

        // 2. Update Client Balance
        const client = await this.clientRepo.getById(clientId);
        if (client) {
            await this.clientRepo.update(clientId, {
                creditBalance: (client.creditBalance || 0) + input.amount
            });
        }

        return movement;
    }

    async getHistory(clientId: string): Promise<CreditMovement[]> {
        return this.creditRepo.getByClientId(clientId);
    }
}
