import { NotificationService } from '../ports/input/notification.service';
import { NotificationRepository } from '../ports/output/notification.repository';
import { Notification } from '../../domain/entities/notification';

export class NotificationServiceImpl implements NotificationService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async createNotification(userId: string, title: string, message: string, scheduledAt: Date): Promise<Notification> {
    const notification = new Notification();
    notification.userId = userId;
    notification.title = title;
    notification.message = message;
    notification.createdAt = new Date();
    notification.scheduledAt = scheduledAt;
    notification.status = 'scheduled';
    return this.notificationRepository.create(notification);
  }

  async sendNotifications(): Promise<void> {
    const scheduledNotifications = await this.notificationRepository.findScheduled();
    for (const notification of scheduledNotifications) {
      // Lógica para enviar la notificación
      // ...
      notification.sentAt = new Date();
      notification.status = 'sent';
      await this.notificationRepository.update(notification);
    }
  }

  async getNotifications(): Promise<Notification[]> {
    // Implementación para obtener todas las notificaciones
    return this.notificationRepository.findAll();
  }

  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    // Implementación para obtener notificaciones por userId
    const allNotifications = await this.notificationRepository.findAll();
    return allNotifications.filter(notification => notification.userId === userId);
  }

  async deleteNotification(id: number): Promise<void> {
    await this.notificationRepository.delete(id);
  }
}