import { NotificationService } from '../ports/input/notification.service';
import { NotificationRepository } from '../ports/output/notification.repository';
import { Notification } from '../../domain/entities/notification';

export class NotificationServiceImpl implements NotificationService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async createNotification(userId: number, title: string, message: string, scheduledAt: Date): Promise<Notification> {
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
}