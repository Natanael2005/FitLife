import { Reminder } from "../../../domain/entities/reminder";

export interface ReminderService {
    createReminder(userId: string, title: string, reminderTime: Date, message?: string | null): Promise<Reminder>;
    sendRemindersToNotificationService(): Promise<void>; // Básicamente, sirve para cargar los recordatorios que están programados para ser enviados, y enviarlos al servicio de notificaciones, quien se encargará de enviarlos en su fecha y hora.
    findReminderById(id: number): Promise<Reminder | null>;
    findReminderByUserId(userId: string): Promise<Reminder[]>;
    findAllReminders(): Promise<Reminder[]>;
    updateReminder(reminder: Reminder): Promise<Reminder>;
    deleteReminder(id: number): Promise<void>;
}