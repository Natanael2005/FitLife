import { z } from 'zod';

export const createUserProfileSchema = z.object({
  uid: z.string().uuid(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  gender: z.string().min(1).max(10),
  profileCompleted: z.boolean(),
  enableRecordatorios: z.boolean(),
  notificationToken: z.string().uuid().optional().nullable(),
})

export type CreateUserProfileDto = z.infer<typeof createUserProfileSchema>;

export const getUserProfileSchema = z.object({
  uid: z.string().uuid(),
})

export type GetUserProfileDto = z.infer<typeof getUserProfileSchema>;

export const updateUserProfileSchema = z.object({
  uid: z.string().uuid(),
  firstName: z.string().min(1).max(50).optional().nullable(),
  lastName: z.string().min(1).max(50).optional().nullable(),
  gender: z.string().min(1).max(10).optional().nullable(),
  profileCompleted: z.boolean().optional().nullable(),
  enableRecordatorios: z.boolean().optional().nullable(),
  notificationToken: z.string().uuid().optional().nullable(),
})

export type UpdateUserProfileDto = z.infer<typeof updateUserProfileSchema>;

export const deleteUserProfileSchema = z.object({
  uid: z.string().uuid(),
})

export type DeleteUserProfileDto = z.infer<typeof deleteUserProfileSchema>;
