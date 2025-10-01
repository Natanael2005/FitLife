import { Notification } from '../../../domain/entities/notification';

export interface NotificationRepository {
  create(notification: Notification): Promise<Notification>;
  findById(id: number): Promise<Notification | null>;
  findScheduled(): Promise<Notification[]>;
  update(notification: Notification): Promise<Notification>;
  findAll(): Promise<Notification[]>;
  delete(id: number): Promise<void>;
}