import { z } from 'zod';

export const createNotificationSchema = z.object({
  userId: z.number(),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  scheduledAt: z.date(),
});

export type CreateNotificationDto = z.infer<typeof createNotificationSchema>;