import { Reminder } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import IReminderRepository from "./IReminderRepository";
import { CreateReminderDto, UpdateReminderDto } from "@/lib/validations/reminder";
import { ScheduledReminderService } from "services/ScheduledReminderService";

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

        await ScheduledReminderService.getInstance().createScheduledReminders(newReminder);

        return newReminder;
    }

    async update(reminder: UpdateReminderDto): Promise<Reminder> {
        const updatedReminder = await this.prisma.reminder.update({
            where: {
                id: reminder.id,
            },
            data: reminder,
        });

        await ScheduledReminderService.getInstance().deleteAllForReminder(updatedReminder.id);
        await ScheduledReminderService.getInstance().createScheduledReminders(updatedReminder);

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
        return await this.prisma.reminder.findMany({
            where: {
                userId: userId,
            },
        });
    }

    // async getById(id: string): Promise<User | null> {
    //     return await this.prisma.user.findUnique({
    //         where: {
    //             id: id
    //         },
    //     });
    // }



    // async getWhere(where: any): Promise<User[]> {
    //     return await this.prisma.user.findMany({
    //         where: where
    //     });
    // }

    // async getByEmail(email: string): Promise<User | null> {
    //     return await this.prisma.user.findUnique({
    //         where: {
    //             email: email,
    //         },/*
    //         select: {
    //             name: true,
    //             emailVerified: true,
    //         },*/
    //     });
    // }
}