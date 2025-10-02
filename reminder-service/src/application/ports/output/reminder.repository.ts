import { Reminder } from "../../../domain/entities/reminder";

export interface ReminderRepository {
    create(reminder: Reminder): Promise<Reminder>;
    findById(id: number): Promise<Reminder | null>;
    findByUserId(userId: string): Promise<Reminder[]>;
    findAll(): Promise<Reminder[]>;
    update(reminder: Reminder): Promise<Reminder>;
    delete(id: number): Promise<void>;
}