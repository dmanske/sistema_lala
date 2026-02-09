import { z } from 'zod';

export const ClientStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'ATTENTION']);
export type ClientStatus = z.infer<typeof ClientStatusSchema>;

export const ClientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  birthDate: z.string().min(1, 'Birth date is required'), // ISO format YYYY-MM-DD
  phone: z.string().min(1, 'Phone is required'),
  whatsapp: z.string().min(1, 'WhatsApp is required'),
  city: z.string().min(1, 'City is required'), // Required in form, hidden in list
  notes: z.string().optional(),
  photoUrl: z.string().optional(),
  status: ClientStatusSchema.default('ACTIVE'),
  createdAt: z.string(), // ISO format
  creditBalance: z.number().default(0), // Read-only
  hasHistory: z.boolean().default(false), // Mock flag for delete constraint
});

export type Client = z.infer<typeof ClientSchema>;

export const CreateClientSchema = ClientSchema.omit({ 
  id: true, 
  createdAt: true, 
  creditBalance: true, 
  hasHistory: true 
});

export type CreateClientInput = z.infer<typeof CreateClientSchema>;
