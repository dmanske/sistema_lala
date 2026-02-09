import { z } from 'zod';

export const CreditMovementTypeSchema = z.enum(['CREDIT', 'DEBIT']);
export type CreditMovementType = z.infer<typeof CreditMovementTypeSchema>;

export const CreditOriginSchema = z.enum(['CASH', 'PIX', 'CARD', 'WALLET']);
export type CreditOrigin = z.infer<typeof CreditOriginSchema>;

export const CreditMovementSchema = z.object({
    id: z.string(),
    clientId: z.string(),
    type: CreditMovementTypeSchema, // Currently only CREDIT is used for manual add
    amount: z.number().positive('Value must be positive'),
    origin: CreditOriginSchema,
    note: z.string().optional(),
    createdAt: z.string(), // ISO format
});

export type CreditMovement = z.infer<typeof CreditMovementSchema>;

export const CreateCreditMovementSchema = CreditMovementSchema.omit({
    id: true,
    createdAt: true,
    type: true // infered by action usually, but we can keep it flexible or fixed
});

export type CreateCreditMovementInput = z.infer<typeof CreateCreditMovementSchema>;
