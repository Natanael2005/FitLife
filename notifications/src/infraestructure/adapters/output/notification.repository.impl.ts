import { NotificationRepository } from '../../../application/ports/output/notification.repository';
import { Notification } from '../../../domain/entities/notification';
import { LessThanOrEqual, Repository } from 'typeorm';

export class NotificationRepositoryImpl implements NotificationRepository {
  constructor(private readonly notificationRepository: Repository<Notification>) {}

  async create(notification: Notification): Promise<Notification> {
    return this.notificationRepository.save(notification);
  }

  async findScheduled(): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: {
        status: 'scheduled',
        scheduledAt: LessThanOrEqual(new Date()),
      },
    });
  }

  async update(notification: Notification): Promise<Notification> {
    return this.notificationRepository.save(notification);
  }
}