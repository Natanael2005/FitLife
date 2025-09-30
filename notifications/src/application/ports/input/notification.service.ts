import { Notification } from '../../../domain/entities/notification';

export interface NotificationService {
  createNotification(userId: number, title: string, message: string, scheduledAt: Date): Promise<Notification>;
  sendNotifications(): Promise<void>;
}