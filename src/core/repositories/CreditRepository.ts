import { CreditMovement } from "@/core/domain/Credit";

export interface CreditRepository {
    create(data: CreditMovement): Promise<CreditMovement>;
    getByClientId(clientId: string): Promise<CreditMovement[]>;
}
