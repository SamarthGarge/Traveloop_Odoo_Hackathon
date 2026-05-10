import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  photo_url: z.string().url().nullable().optional(),
  language: z.string().max(10).optional(),
  saved_destinations: z.array(z.string().uuid()).optional(),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters').max(72),
});
