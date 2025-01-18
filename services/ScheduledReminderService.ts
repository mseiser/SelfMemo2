import { CreateScheduledReminderDto, UpdateScheduledReminderDto } from "@/lib/validations/scheduledReminder";
import { Reminder } from "@prisma/client";
import IScheduledReminderRepository from "repositories/IScheduledReminderRepository";
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
            case 'weekly':
                this.createScheduledRemindersForWeekly(reminder);
                break;
            case 'n-weekly':
                this.createScheduledRemindersForNWeekly(reminder);
                break;
            case 'monthly':
                this.createScheduledRemindersForMonthly(reminder);
                break;
            case 'yearly':
                this.createScheduledRemindersForYearly(reminder);
                break;
            case 'n-yearly':
                this.createScheduledRemindersForNYearly(reminder);
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
                await this.saveScheduledReminderInDb(
                    reminder.id,
                    Math.round(reminderTimestamp / 1000),
                    true
                );
            });
        }
    }

    async createScheduledRemindersForDaily(reminder: Reminder) {
        const config = JSON.parse(reminder.config);

        const time = config.time;
        const days = config.repeat;

        const timestamps = this.getNextOccurrencesForDaily(days, time);

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

    async createScheduledRemindersForWeekly(reminder: Reminder) {
        const config = JSON.parse(reminder.config);

        const time = config.time;
        const day = config.day;

        const timestamp = this.getNextOccurrenceForWeekly(day, time);

        const adjustedCalculatedTimestamp = Math.round(timestamp / 1000);

        await this.saveScheduledReminderInDb(
            reminder.id,
            adjustedCalculatedTimestamp,
            false
        );

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
    }

    async createScheduledRemindersForNWeekly(reminder: Reminder) {
        const config = JSON.parse(reminder.config);

        const weeks = config.weeks;
        const time = config.time;
        const startDate = config.date;

        const timestamp = this.getNextOccurrenceForNWeekly(weeks, startDate, time);

        const adjustedCalculatedTimestamp = Math.round(timestamp / 1000);

        await this.saveScheduledReminderInDb(
            reminder.id,
            adjustedCalculatedTimestamp,
            false
        );

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
    }

    async createScheduledRemindersForMonthly(reminder: Reminder) {
        const config = JSON.parse(reminder.config);

        const type = config.type;
        const time = config.time;
        const day = config.day;
        const orderNumber = config.orderNumber;
        const weekDay = config.weekDay;

        const timestamp = type == "monthlyType1" ? this.getNextOccurenceForMonthlyType1(day, time) : this.getNextOccurenceForMonthlyType2(time, this.mapOrderStringToNumber(orderNumber), weekDay);

        const adjustedCalculatedTimestamp = Math.round(timestamp / 1000);

        await this.saveScheduledReminderInDb(
            reminder.id,
            adjustedCalculatedTimestamp,
            false
        );

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
    }

    async createScheduledRemindersForYearly(reminder: Reminder) {
        const config = JSON.parse(reminder.config);

        const type = config.type;
        const month = config.month;
        const day = config.day;
        const orderNumber = config.orderNumber;
        const weekDay = config.weekDay;
        const time = config.time;

        const timestamp = type == "yearlyType1" ? this.getNextOccurenceForYearlyType1(this.mapMonthStringToNumber(month), day, time) : this.getNextOccurenceForYearlyType2(this.mapMonthStringToNumber(month), this.mapOrderStringToNumber(orderNumber), weekDay, time);

        const adjustedCalculatedTimestamp = Math.round(timestamp / 1000);

        await this.saveScheduledReminderInDb(
            reminder.id,
            adjustedCalculatedTimestamp,
            false
        );

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
    }

    async createScheduledRemindersForNYearly(reminder: Reminder) {
        const config = JSON.parse(reminder.config);

        const years = config.years;
        const type = config.type;
        const month = config.month;
        const day = config.day;
        const orderNumber = config.orderNumber;
        const weekDay = config.weekDay;
        const time = config.time;

        const timestamp = type == "yearlyType1" ? this.getNextOccurenceForNYearlyType1(this.mapMonthStringToNumber(month), day, time, years) : this.getNextOccurenceForNYearlyType2(this.mapMonthStringToNumber(month), this.mapOrderStringToNumber(orderNumber), weekDay, time, years);

        const adjustedCalculatedTimestamp = Math.round(timestamp / 1000);

        await this.saveScheduledReminderInDb(
            reminder.id,
            adjustedCalculatedTimestamp,
            false
        );

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
    }

    mapOrderStringToNumber(order: string): number {
        const orderMapping: { [key: string]: number } = {
          first: 1,
          second: 2,
          third: 3,
          fourth: 4,
        };
      
        const orderNumber = orderMapping[order.toLowerCase()];
        if (orderNumber === undefined) {
          throw new Error(`Invalid order string: ${order}`);
        }
      
        return orderNumber;
    }

    mapMonthStringToNumber(month: string): number {
        const monthMapping: { [key: string]: number } = {
            january: 1,
            february: 2,
            march: 3,
            april: 4,
            may: 5,
            june: 6,
            july: 7,
            august: 8,
            september: 9,
            october: 10,
            november: 11,
            december: 12,
          };
        
          const monthNumber = monthMapping[month.toLowerCase()];
          if (monthNumber === undefined) {
            throw new Error(`Invalid month: ${month}`);
          }
        
          return monthNumber;
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
            
            // Only add reminders that are in the future
            if (reminderTimestamp > Date.now()) {
                reminders.push(reminderTimestamp);
            }
        }
      
        return reminders;
      }

    getNextOccurrencesForDaily(days: { [key: string]: boolean }, time: string): number[] {
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

    getNextOccurrenceForWeekly(day: string, time: string): number {
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
        const targetDay = dayMapping[day.toLowerCase()];
      
        if (targetDay === undefined) {
          throw new Error(`Invalid day: ${day}`);
        }
      
        const [hours, minutes] = time.split(":").map(Number);
      
        let dayDifference = targetDay - now.getDay();
        if (dayDifference < 0 || (dayDifference === 0 && (now.getHours() > hours || (now.getHours() === hours && now.getMinutes() >= minutes)))) {
          dayDifference += 7;
        }
      
        const nextDate = new Date(now);
        nextDate.setDate(now.getDate() + dayDifference);
        nextDate.setHours(hours, minutes, 0, 0);
      
        return nextDate.getTime();
    }

    getNextOccurrenceForNWeekly(weeks: number, startDate: number, time: string): number {
        const now = new Date();
        const [hours, minutes] = time.split(":").map(Number);

        const startDateTime = new Date(startDate * 1000);
        startDateTime.setHours(hours, minutes, 0, 0);

        if (weeks <= 0) {
            throw new Error("The interval (n) must be a positive number.");
        }

        if (now < startDateTime) {
            return startDateTime.getTime();
        }

        const msInWeek = 7 * 24 * 60 * 60 * 1000;
        const elapsedWeeks = Math.floor((now.getTime() - startDateTime.getTime()) / msInWeek);

        const nextWeekMultiple = Math.ceil((elapsedWeeks + 1) / weeks) * weeks;
        const nextOccurrence = new Date(startDateTime.getTime() + nextWeekMultiple * msInWeek);

        return nextOccurrence.getTime();
    }

    getNextOccurenceForMonthlyType1(dayOfMonth: number, time: string): number {
        const now = new Date();
        const [hours, minutes] = time.split(":").map(Number);
      
        let nextDate = new Date(now.getFullYear(), now.getMonth(), dayOfMonth, hours, minutes, 0, 0);
      
        if (now > nextDate) {
          nextDate = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth, hours, minutes, 0, 0);
        }
      
        return nextDate.getTime();
    }

    getNextOccurenceForMonthlyType2(time: string, order: number, dayOfWeek: string): number {
        const now = new Date();
        const [hours, minutes] = time.split(":").map(Number);
        const dayMapping: { [key: string]: number } = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6,
        };

        const targetDay = dayMapping[dayOfWeek.toLowerCase()];
        if (targetDay === undefined) {
            throw new Error(`Invalid day of week: ${dayOfWeek}`);
        }

        let nextDate = new Date(now.getFullYear(), now.getMonth(), 1, hours, minutes, 0, 0);

        // Find the first occurrence of the target day in the current month
        while (nextDate.getDay() !== targetDay) {
            nextDate.setDate(nextDate.getDate() + 1);
        }

        // Move to the correct occurrence (order - 1 times after the first occurrence)
        nextDate.setDate(nextDate.getDate() + (order - 1) * 7);

        // If the calculated date is in the past, move to the next month
        if (now > nextDate) {
            nextDate = new Date(now.getFullYear(), now.getMonth() + 1, 1, hours, minutes, 0, 0);

            // Find the first occurrence of the target day in the next month
            while (nextDate.getDay() !== targetDay) {
            nextDate.setDate(nextDate.getDate() + 1);
            }

            // Move to the correct occurrence (order - 1 times after the first occurrence)
            nextDate.setDate(nextDate.getDate() + (order - 1) * 7);
        }

        return nextDate.getTime();
    }

    getNextOccurenceForYearlyType1(month: number, dayOfMonth: number, time: string): number {
        const now = new Date();
        const [hours, minutes] = time.split(":").map(Number);

        let nextDate = new Date(now.getFullYear(), month - 1, dayOfMonth, hours, minutes, 0, 0);

        // If the current date and time is past the target date, move to the next year
        if (now > nextDate) {
            nextDate = new Date(now.getFullYear() + 1, month - 1, dayOfMonth, hours, minutes, 0, 0);
        }

        return nextDate.getTime();
    }

    getNextOccurenceForYearlyType2(
        month: number, // Month (1-12)
        order: number, // 1 for first, 2 for second, etc.
        dayOfWeek: string, // "sunday", "monday", etc.
        time: string // Time in HH:mm format
      ): number {
        const now = new Date();
        const [hours, minutes] = time.split(":").map(Number);
        const dayMapping: { [key: string]: number } = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6,
        };

        const targetDay = dayMapping[dayOfWeek.toLowerCase()];
        if (targetDay === undefined) {
            throw new Error(`Invalid day of week: ${dayOfWeek}`);
        }

        let nextDate = new Date(now.getFullYear(), month - 1, 1, hours, minutes, 0, 0);

        // Find the first occurrence of the target day in the given month
        while (nextDate.getDay() !== targetDay) {
            nextDate.setDate(nextDate.getDate() + 1);
        }

        // Move to the correct occurrence (order - 1 times after the first occurrence)
        nextDate.setDate(nextDate.getDate() + (order - 1) * 7);

        // If the calculated date is in the past, move to the next year
        if (now > nextDate) {
            nextDate = new Date(now.getFullYear() + 1, month - 1, 1, hours, minutes, 0, 0);

            // Find the first occurrence of the target day in the next year's given month
            while (nextDate.getDay() !== targetDay) {
            nextDate.setDate(nextDate.getDate() + 1);
            }

            // Move to the correct occurrence (order - 1 times after the first occurrence)
            nextDate.setDate(nextDate.getDate() + (order - 1) * 7);
        }

        return nextDate.getTime();
    }

    getNextOccurenceForNYearlyType1(month: number, dayOfMonth: number, time: string, everyNYears: number): number {
        const now = new Date();
        const [hours, minutes] = time.split(":").map(Number);

        let nextDate = new Date(now.getFullYear(), month - 1, dayOfMonth, hours, minutes, 0, 0);

        // If the current date and time is past the target date, or not on the correct interval, move forward
        while (now > nextDate || (nextDate.getFullYear() - now.getFullYear()) % everyNYears !== 0) {
            nextDate = new Date(nextDate.getFullYear() + 1, month - 1, dayOfMonth, hours, minutes, 0, 0);
        }

        return nextDate.getTime();
    }

    getNextOccurenceForNYearlyType2(
        month: number, // Month (1-12)
        order: number, // 1 for first, 2 for second, etc.
        dayOfWeek: string, // "sunday", "monday", etc.
        time: string, // Time in HH:mm format
        everyNYears: number // Interval in years
      ): number {
        const now = new Date();
        const [hours, minutes] = time.split(":").map(Number);
        const dayMapping: { [key: string]: number } = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6,
        };

        const targetDay = dayMapping[dayOfWeek.toLowerCase()];
        if (targetDay === undefined) {
            throw new Error(`Invalid day of week: ${dayOfWeek}`);
        }

        let nextDate = new Date(now.getFullYear(), month - 1, 1, hours, minutes, 0, 0);

        // Find the first occurrence of the target day in the given month
        while (nextDate.getDay() !== targetDay) {
            nextDate.setDate(nextDate.getDate() + 1);
        }

        // Move to the correct occurrence (order - 1 times after the first occurrence)
        nextDate.setDate(nextDate.getDate() + (order - 1) * 7);

        // If the calculated date is in the past, or not on the correct interval, move forward
        while (now > nextDate || (nextDate.getFullYear() - now.getFullYear()) % everyNYears !== 0) {
            nextDate = new Date(nextDate.getFullYear() + 1, month - 1, 1, hours, minutes, 0, 0);

            // Find the first occurrence of the target day in the new year's given month
            while (nextDate.getDay() !== targetDay) {
            nextDate.setDate(nextDate.getDate() + 1);
            }

            // Move to the correct occurrence (order - 1 times after the first occurrence)
            nextDate.setDate(nextDate.getDate() + (order - 1) * 7);
        }

        return nextDate.getTime();
    }
}
