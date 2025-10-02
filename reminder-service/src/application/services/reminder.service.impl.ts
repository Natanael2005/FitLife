import { ReminderService } from "../ports/input/reminder.service";
import { ReminderRepository } from "../ports/output/reminder.repository";
import { Reminder } from "../../domain/entities/reminder";

export class ReminderServiceImpl implements ReminderService {
    constructor(private readonly reminderRepository: ReminderRepository) { }

    async createReminder(userId: string, title: string, reminderTime: Date, message?: string | null): Promise<Reminder> {
        const reminder = new Reminder();
        reminder.userId = userId;
        reminder.title = title;
        reminder.reminderTime = reminderTime;
        reminder.message = message ?? null;
        return this.reminderRepository.create(reminder);
    }

    async sendRemindersToNotificationService(): Promise<void> {
        // Aquí se implementaría la lógica para cargar los recordatorios programados y enviarlos al servicio de notificaciones.
        // Esta lógica puede incluir la comunicación con otro servicio a través de HTTP, gRPC, etc.
        // Por simplicidad, esta implementación está omitida.
    }
    async findReminderById(id: number): Promise<Reminder | null> {
        return this.reminderRepository.findById(id);
    }
    async findReminderByUserId(userId: string): Promise<Reminder[]> {
        return this.reminderRepository.findByUserId(userId);
    }
    async findAllReminders(): Promise<Reminder[]> {
        return this.reminderRepository.findAll();
    }
    async updateReminder(reminder: Reminder): Promise<Reminder> {
        return this.reminderRepository.update(reminder);
    }
    async deleteReminder(id: number): Promise<void> {
        const reminder = await this.reminderRepository.findById(id);
        if (reminder) {
            await this.reminderRepository.delete(id);
        }
    }
}