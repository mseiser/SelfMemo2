import { Reminder } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import IReminderRepository from "./IReminderRepository";
import { CreateReminderDto, UpdateReminderDto } from "@/lib/validations/reminder";

export class ReminderRepository extends BaseRepository implements IReminderRepository {
    async getAll(): Promise<Reminder[]> {
        return await this.prisma.reminder.findMany(

        );
    }

    async getById(reminderId: string): Promise<Reminder | null> {
        return await this.prisma.reminder.findUnique({
            where: {
                id: reminderId,
            },
        });
    }

    async create(reminder: CreateReminderDto): Promise<Reminder> {
        const newReminder = await this.prisma.reminder.create({
            // @ts-ignore
            data: {
                ...reminder,
                description: reminder.description ?? "",
            },
        });

        return newReminder;
    }

    async update(reminder: UpdateReminderDto): Promise<Reminder> {
        const updatedReminder = await this.prisma.reminder.update({
            where: {
                id: reminder.id,
            },
            data: reminder,
        });

        return updatedReminder;
    }

    async delete(id: string): Promise<Reminder> {
        return await this.prisma.reminder.delete({
            where: {
                id: id,
            },
        });
    }

    async updateLastSent(reminderId: string, timestamp: number): Promise<Reminder> {
        return await this.prisma.reminder.update({
            where: {
                id: reminderId,
            },
            data: {
                lastSent: timestamp.toString(),
            },
        });
    }

    async getAllByUserId(userId: string): Promise<Reminder[]> {
        if(!userId) {
            return [];
        }

        return await this.prisma.reminder.findMany({
            where: {
                userId: userId,
            },
        });
    }
}
