import { CreateReminderDto, UpdateReminderDto } from "@/lib/validations/reminder";
import { CreateScheduledReminderDto, UpdateScheduledReminderDto } from "@/lib/validations/scheduledReminder";
import { Reminder, ScheduledReminder } from "@prisma/client";

export default interface IScheduledReminderRepository {
    getAll(): Promise<ScheduledReminder[]>;
    getAllByReminderId(reminderId: string): Promise<ScheduledReminder[]>;
    getByReminderIdAndTimestamp(reminderId: string, timestamp: number): Promise<ScheduledReminder|null>;
    create(entity: CreateScheduledReminderDto): Promise<ScheduledReminder>;
    update(entity: UpdateScheduledReminderDto): Promise<ScheduledReminder>;
    delete(id: string): Promise<ScheduledReminder>;
    deleteAllForReminder(reminderId: string): Promise<void>;
}
