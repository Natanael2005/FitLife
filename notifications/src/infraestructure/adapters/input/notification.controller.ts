import express from 'express';
import { NotificationService } from '../../../application/ports/input/notification.service';
import { createNotificationSchema, CreateNotificationDto } from '../../../shared/schemas/notification.schema';

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  async createNotification(req: express.Request, res: express.Response): Promise<void> {
    const result = createNotificationSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    const createNotificationDto: CreateNotificationDto = result.data;
    const notification = await this.notificationService.createNotification(
      createNotificationDto.userId,
      createNotificationDto.title,
      createNotificationDto.message,
      createNotificationDto.scheduledAt,
    );
    res.status(201).json(notification);
  }

  // Otros métodos del controlador
  // ...
  async sendNotifications(req: express.Request, res: express.Response): Promise<void> {
    await this.notificationService.sendNotifications();
    res.status(200).json({ message: 'Notifications sent' });
  }
}