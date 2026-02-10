
import { z } from 'zod';

export const stockMovementSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string(),
    productId: z.string(),
    type: z.enum(['in', 'out']),
    qty: z.number().positive(), // Always positive here, interpretation depends on type
    reason: z.enum(['sale', 'refund', 'adjust', 'initial']),
    referenceType: z.enum(['sale']).optional(),
    referenceId: z.string().optional(),
    createdAt: z.string().datetime(),
    createdBy: z.string(),
});
