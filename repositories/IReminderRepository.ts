import { CreateReminderDto, UpdateReminderDto } from "@/lib/validations/reminder";
import { Reminder } from "@prisma/client";

export default interface IReminderRepository {
    getAll(): Promise<Reminder[]>;
    getById(reminderId: string): Promise<Reminder | null>;
    create(entity: CreateReminderDto): Promise<Reminder>;
    update(entity: UpdateReminderDto): Promise<Reminder>;
    updateLastSent(reminderId: string, timestamp: number): Promise<Reminder>;
    getAllByUserId(userId: string): Promise<Reminder[]>;
    delete(id: string): Promise<Reminder>;
}
