import { CreateReminderDto, UpdateReminderDto } from "@/lib/validations/reminder";
import { Reminder } from "@prisma/client";

export default interface IReminderRepository {
    getAll(): Promise<Reminder[]>;
    create(entity: CreateReminderDto): Promise<Reminder>;
    update(entity: UpdateReminderDto): Promise<Reminder>;
    // delete(id: string): Promise<User>;
    // getById(id: string): Promise<User | null>;
    // getByEmail(email: string): Promise<User | null>;
}