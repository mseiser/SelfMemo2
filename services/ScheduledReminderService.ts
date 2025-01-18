import { prisma } from "@/lib/db";
import { CreateReminderDto, UpdateReminderDto } from "@/lib/validations/reminder";
import { CreateScheduledReminderDto, UpdateScheduledReminderDto } from "@/lib/validations/scheduledReminder";
import { Reminder } from "@prisma/client";
import IReminderRepository from "repositories/IReminderRepository";
import IScheduledReminderRepository from "repositories/IScheduledReminderRepository";
import { ReminderRepository } from "repositories/ReminderRepository";
import { ScheduledReminderRepository } from "repositories/ScheduledReminderRepository";

export class ScheduledReminderService {
    private static instance: ScheduledReminderService;
    private scheduledReminderRepository: IScheduledReminderRepository;

    private constructor() {
        this.scheduledReminderRepository = new ScheduledReminderRepository();
    }

    public static getInstance(): ScheduledReminderService {
        if (!ScheduledReminderService.instance) {
            ScheduledReminderService.instance = new ScheduledReminderService();
        }

        return ScheduledReminderService.instance;
    }

    async getAll() {
        return await this.scheduledReminderRepository.getAll();
    }

    async create(reminder: CreateScheduledReminderDto) {
        return await this.scheduledReminderRepository.create(reminder);
    }

    async update(reminder: UpdateScheduledReminderDto) {
        return await this.scheduledReminderRepository.update(reminder);
    }

    async delete(id: string) {
        return await this.scheduledReminderRepository.delete(id);
    }

    async deleteAllForReminder(reminderId: string) {
        return await this.scheduledReminderRepository.deleteAllForReminder(reminderId);
    }

    async saveScheduledReminderInDb(reminderId: string, reminderTimestamp: number, isWarning: boolean) {
        const alreadyExistingReminder = await this.scheduledReminderRepository.getByReminderIdAndTimestamp(reminderId, reminderTimestamp);

        if(alreadyExistingReminder != null) {
            return;
        }

        await this.create({
            reminderId: reminderId,
            timestamp: reminderTimestamp,
            isWarning: isWarning,
        });
    }

    async createScheduledReminders(reminder: Reminder) {
        switch(reminder.type) {
            case 'one-time':
                this.createScheduledRemindersForOneTime(reminder);
                break;
            case 'daily':
                this.createScheduledRemindersForDaily(reminder);
                break;
            default:
                break;
        }
    }

    async createScheduledRemindersForOneTime(reminder: Reminder) {
        const config = JSON.parse(reminder.config);

        if(config.timestamp < (Math.round(Date.now() / 1000))) {
            return;
        }

        await this.saveScheduledReminderInDb(reminder.id, config.timestamp, false);

        if(reminder.hasWarnings) {
            const warningReminders = await this.generateWarningReminders(
                config.timestamp,
                reminder.warningNumber,
                reminder.warningIntervalNumber,
                reminder.warningInterval
            );

            warningReminders.forEach(async (reminderTimestamp) => {
                await this.saveScheduledReminderInDb(reminder.id, config.timestamp, true);
            });
        }
    }

    async createScheduledRemindersForDaily(reminder: Reminder) {
        const config = JSON.parse(reminder.config);

        const time = config.time;
        const days = config.repeat;

        const timestamps = this.getNextOccurrences(days, time);

        timestamps.forEach(async (calculatedTimestamp) => {
            const adjustedCalculatedTimestamp = Math.round(calculatedTimestamp / 1000);

            await this.saveScheduledReminderInDb(reminder.id, adjustedCalculatedTimestamp, false);

            if(reminder.hasWarnings) {
                const warningReminders = await this.generateWarningReminders(
                    adjustedCalculatedTimestamp,
                    reminder.warningNumber,
                    reminder.warningIntervalNumber,
                    reminder.warningInterval
                );
    
                warningReminders.forEach(async (reminderTimestamp) => {
                    await this.saveScheduledReminderInDb(
                        reminder.id,
                        Math.round(reminderTimestamp / 1000),
                        true
                    );
                });
            }
        });
    }

    async generateWarningReminders(
        timestamp: number,
        warningNumber: number | null,
        warningIntervalNumber: number | null,
        warningInterval: string | null
      ) {
        const intervalMap = {
          minute: 60 * 1000,
          hour: 60 * 60 * 1000,
          day: 24 * 60 * 60 * 1000,
          week: 7 * 24 * 60 * 60 * 1000,
          month: 30 * 24 * 60 * 60 * 1000, // approximation
          year: 365 * 24 * 60 * 60 * 1000 // approximation
        };
    
        if(warningNumber === null || warningIntervalNumber === null || warningInterval === null) {
          throw new Error("Invalid warning configuration.");
        }
      
        if (!(warningInterval in intervalMap)) {
          throw new Error("Invalid interval unit. Must be one of: minutes, hours, days, weeks, months, years.");
        }
      
        const intervalMilliseconds = intervalMap[warningInterval as keyof typeof intervalMap];
        const reminders = [];
      
        for (let i = 1; i <= warningNumber; i++) {
          const reminderTimestamp = (timestamp * 1000) - (i * warningIntervalNumber * intervalMilliseconds);
      
          if (reminderTimestamp > Date.now()) {
            reminders.push(reminderTimestamp);
          }
        }
      
        return reminders;
      }

    getNextOccurrences(days: { [key: string]: boolean }, time: string): number[] {
        const dayMapping: { [key: string]: number } = {
          sunday: 0,
          monday: 1,
          tuesday: 2,
          wednesday: 3,
          thursday: 4,
          friday: 5,
          saturday: 6,
        };
      
        const now = new Date();
        const [hours, minutes] = time.split(":").map(Number);
      
        const timestamps: number[] = [];
      
        for (const [day, isActive] of Object.entries(days)) {
          if (!isActive) continue;
      
          const targetDay = dayMapping[day.toLowerCase()];
          if (targetDay === undefined) {
            throw new Error(`Invalid day: ${day}`);
          }
      
          // Calculate the difference in days
          let dayDifference = targetDay - now.getDay();
          if (dayDifference < 0 || (dayDifference === 0 && (now.getHours() > hours || (now.getHours() === hours && now.getMinutes() >= minutes)))) {
            dayDifference += 7;
          }
      
          const nextDate = new Date(now);
          nextDate.setDate(now.getDate() + dayDifference);
          nextDate.setHours(hours, minutes, 0, 0);
      
          timestamps.push(nextDate.getTime());
        }
      
        return timestamps.sort((a, b) => a - b);
    }
}
