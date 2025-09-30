import { Notification } from '../../../domain/entities/notification';

export interface NotificationRepository {
  create(notification: Notification): Promise<Notification>;
  findScheduled(): Promise<Notification[]>;
  update(notification: Notification): Promise<Notification>;
}