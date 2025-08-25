import { z } from 'zod';

export const recordSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

export type RecordFormData = z.infer<typeof recordSchema>;