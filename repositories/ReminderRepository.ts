import { Reminder } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import IReminderRepository from "./IReminderRepository";
import { CreateReminderDto } from "@/lib/validations/reminder";

export class ReminderRepository extends BaseRepository implements IReminderRepository {
    async create(reminder: CreateReminderDto): Promise<Reminder> {
        return await this.prisma.reminder.create({
            data: reminder,
        });
    }

    async getAll(): Promise<Reminder[]> {
        return await this.prisma.reminder.findMany(
            
        );
    }

    async update(reminder: Reminder): Promise<Reminder> {
        return await this.prisma.reminder.update({
            where: {
                id: reminder.id,
            },
            data: reminder,
        });
    }

    // async delete(id: string): Promise<User> {
    //     return await this.prisma.user.delete({
    //         where: {
    //             id: id,
    //         },
    //     });
    // }

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