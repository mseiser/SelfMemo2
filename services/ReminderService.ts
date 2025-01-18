import { prisma } from "@/lib/db";
import { CreateReminderDto, UpdateReminderDto } from "@/lib/validations/reminder";
import IReminderRepository from "repositories/IReminderRepository";
import { ReminderRepository } from "repositories/ReminderRepository";

export class ReminderService {
    private static instance: ReminderService;
    private reminderRepository: IReminderRepository;

    private constructor() {
        this.reminderRepository = new ReminderRepository();
    }

    public static getInstance(): ReminderService {
        if (!ReminderService.instance) {
            ReminderService.instance = new ReminderService();
        }

        return ReminderService.instance;
    }

    async createReminder(reminder: CreateReminderDto) {
        return await this.reminderRepository.create(reminder);
    }

    async updateReminder(reminder: UpdateReminderDto) {
        return await this.reminderRepository.update(reminder);
    }

    async updateReminderLastSent(reminderId: string, timestamp: number) {
        return await this.reminderRepository.updateLastSent(reminderId, timestamp);
    }

    async getAll() {
        return await this.reminderRepository.getAll();
    }

    async getById(reminderId: string) {
        return await this.reminderRepository.getById(reminderId);
    }

    async getAllByUserId(userId: string) {
        return await this.reminderRepository.getAllByUserId(userId);
    }

    async getSingleWithChildReminders(reminderId: string) {
        const reminderWithChildren = await prisma.reminder.findUnique({
            where: { id: reminderId },
            include: {
              childReminders: true,
            },
        });

        return reminderWithChildren;
    }

    async deleteReminder(reminderId: string) {
        return await this.reminderRepository.delete(reminderId);
    }
}
