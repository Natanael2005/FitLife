import { Notification } from '../../../domain/entities/notification';

export interface NotificationService {
  createNotification(userId: string, title: string, message: string, scheduledAt: Date): Promise<Notification>;
  getNotifications(): Promise<Notification[]>;
  getNotificationsByUserId(userId: string): Promise<Notification[]>;
  sendNotifications(): Promise<void>;
  deleteNotification(id: number): Promise<void>;
}