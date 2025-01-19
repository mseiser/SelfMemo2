import { prisma } from "@/lib/db";
import { CreateReminderDto, UpdateReminderDto } from "@/lib/validations/reminder";
import { Reminder } from "@prisma/client";
import IReminderRepository from "repositories/IReminderRepository";
import { ReminderRepository } from "repositories/ReminderRepository";

type ReminderNotification = {
    timestamp: number;
    isWarning: boolean;
};

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

    async deleteReminder(reminderId: string) {
        return await this.reminderRepository.delete(reminderId);
    }

    async getReminderTimestamps(date: Date, reminder: Reminder): Promise<ReminderNotification[]> {
        switch(reminder.type) {
            case 'one-time':
                return this.createScheduledRemindersForOneTime(date, reminder);
            case 'daily':
                return this.createScheduledRemindersForDaily(date, reminder);
            case 'weekly':
                return this.createScheduledRemindersForWeekly(date, reminder);
            case 'n-weekly':
                return this.createScheduledRemindersForNWeekly(date, reminder);
            case 'monthly':
                return this.createScheduledRemindersForMonthly(date, reminder);
            case 'yearly':
                return this.createScheduledRemindersForYearly(date, reminder);
            case 'n-yearly':
                return this.createScheduledRemindersForNYearly(date, reminder);
            default:
                return [];
        }
    }

    async createScheduledRemindersForOneTime(nowDate: Date, reminder: Reminder) {
        let createdReminders: ReminderNotification[] = [];
        const config = JSON.parse(reminder.config);

        if(config.timestamp < (Math.round(nowDate.getTime() / 1000))) { 
            return [];
        }

        createdReminders.push({
            timestamp: config.timestamp,
            isWarning: false
        });

        if(reminder.hasWarnings) {
            const warningReminders = await this.generateWarningReminders(
                nowDate,
                config.timestamp,
                reminder.warningNumber,
                reminder.warningIntervalNumber,
                reminder.warningInterval
            );

            warningReminders.forEach(async (reminderTimestamp) => {
                createdReminders.push({
                    timestamp: Math.round(reminderTimestamp / 1000),
                    isWarning: true
                });
            });
        }

        return createdReminders;
    }

    async createScheduledRemindersForDaily(nowDate: Date, reminder: Reminder) {
        let createdReminders: ReminderNotification[] = [];
        const config = JSON.parse(reminder.config);

        const time = config.time;
        const days = config.repeat;

        const timestamps = this.getNextOccurrencesForDaily(nowDate, days, time);

        timestamps.forEach(async (calculatedTimestamp) => {
            const adjustedCalculatedTimestamp = Math.round(calculatedTimestamp / 1000);

            // await this.saveScheduledReminderInDb(reminder.id, adjustedCalculatedTimestamp, false);
            createdReminders.push({
                timestamp: adjustedCalculatedTimestamp,
                isWarning: false
            });

            if(reminder.hasWarnings) {
                const warningReminders = await this.generateWarningReminders(
                    nowDate,
                    adjustedCalculatedTimestamp,
                    reminder.warningNumber,
                    reminder.warningIntervalNumber,
                    reminder.warningInterval
                );
    
                warningReminders.forEach(async (reminderTimestamp) => {
                    createdReminders.push({
                        timestamp: Math.round(reminderTimestamp / 1000),
                        isWarning: true
                    });
                    // await this.saveScheduledReminderInDb(
                    //     reminder.id,
                    //     Math.round(reminderTimestamp / 1000),
                    //     true
                    // );
                });
            }
        });

        return createdReminders;
    }

    async createScheduledRemindersForWeekly(nowDate: Date, reminder: Reminder) {
        let createdReminders: ReminderNotification[] = [];
        const config = JSON.parse(reminder.config);

        const time = config.time;
        const day = config.day;

        const timestamp = this.getNextOccurrenceForWeekly(nowDate, day, time);

        const adjustedCalculatedTimestamp = Math.round(timestamp / 1000);

        createdReminders.push({
            timestamp: adjustedCalculatedTimestamp,
            isWarning: false
        });

        if(reminder.hasWarnings) {
            const warningReminders = await this.generateWarningReminders(
                nowDate,
                adjustedCalculatedTimestamp,
                reminder.warningNumber,
                reminder.warningIntervalNumber,
                reminder.warningInterval
            );

            warningReminders.forEach(async (reminderTimestamp) => {
                createdReminders.push({
                    timestamp: Math.round(reminderTimestamp / 1000),
                    isWarning: true
                });
            });
        }

        return createdReminders;
    }

    async createScheduledRemindersForNWeekly(nowDate: Date, reminder: Reminder) {
        let createdReminders: ReminderNotification[] = [];
        const config = JSON.parse(reminder.config);

        const weeks = config.weeks;
        const time = config.time;
        const startDate = config.date;

        const timestamp = this.getNextOccurrenceForNWeekly(nowDate, weeks, startDate, time);

        const adjustedCalculatedTimestamp = Math.round(timestamp / 1000);

        createdReminders.push({
            timestamp: adjustedCalculatedTimestamp,
            isWarning: false
        });

        if(reminder.hasWarnings) {
            const warningReminders = await this.generateWarningReminders(
                nowDate,
                adjustedCalculatedTimestamp,
                reminder.warningNumber,
                reminder.warningIntervalNumber,
                reminder.warningInterval
            );

            warningReminders.forEach(async (reminderTimestamp) => {
                createdReminders.push({
                    timestamp: Math.round(reminderTimestamp / 1000),
                    isWarning: true
                });
            });
        }

        return createdReminders;
    }

    async createScheduledRemindersForMonthly(nowDate: Date, reminder: Reminder) {
        let createdReminders: ReminderNotification[] = [];
        const config = JSON.parse(reminder.config);

        const type = config.type;
        const time = config.time;
        const day = config.day;
        const orderNumber = config.orderNumber;
        const weekDay = config.weekDay;

        const timestamp = type == "monthlyType1" ? this.getNextOccurenceForMonthlyType1(nowDate, day, time) : this.getNextOccurenceForMonthlyType2(nowDate, time, this.mapOrderStringToNumber(orderNumber), weekDay);

        const adjustedCalculatedTimestamp = Math.round(timestamp / 1000);

        createdReminders.push({
            timestamp: adjustedCalculatedTimestamp,
            isWarning: false
        });

        if(reminder.hasWarnings) {
            const warningReminders = await this.generateWarningReminders(
                nowDate,
                adjustedCalculatedTimestamp,
                reminder.warningNumber,
                reminder.warningIntervalNumber,
                reminder.warningInterval
            );

            warningReminders.forEach(async (reminderTimestamp) => {
                createdReminders.push({
                    timestamp: Math.round(reminderTimestamp / 1000),
                    isWarning: true
                });
            });
        }

        return createdReminders;
    }

    async createScheduledRemindersForYearly(nowDate: Date, reminder: Reminder) {
        let createdReminders: ReminderNotification[] = [];
        const config = JSON.parse(reminder.config);

        const type = config.type;
        const month = config.month;
        const day = config.day;
        const orderNumber = config.orderNumber;
        const weekDay = config.weekDay;
        const time = config.time;

        const timestamp = type == "yearlyType1" ? this.getNextOccurenceForYearlyType1(nowDate, this.mapMonthStringToNumber(month), day, time) : this.getNextOccurenceForYearlyType2(nowDate, this.mapMonthStringToNumber(month), this.mapOrderStringToNumber(orderNumber), weekDay, time);

        const adjustedCalculatedTimestamp = Math.round(timestamp / 1000);

        createdReminders.push({
            timestamp: adjustedCalculatedTimestamp,
            isWarning: false
        });

        if(reminder.hasWarnings) {
            const warningReminders = await this.generateWarningReminders(
                nowDate,
                adjustedCalculatedTimestamp,
                reminder.warningNumber,
                reminder.warningIntervalNumber,
                reminder.warningInterval
            );

            warningReminders.forEach(async (reminderTimestamp) => {
                createdReminders.push({
                    timestamp: Math.round(reminderTimestamp / 1000),
                    isWarning: true
                });
            });
        }

        return createdReminders;
    }

    async createScheduledRemindersForNYearly(nowDate: Date, reminder: Reminder) {
        let createdReminders: ReminderNotification[] = [];
        const config = JSON.parse(reminder.config);

        const years = config.years;
        const type = config.type;
        const month = config.month;
        const day = config.day;
        const orderNumber = config.orderNumber;
        const weekDay = config.weekDay;
        const time = config.time;

        const timestamp = type == "yearlyType1" ? this.getNextOccurenceForNYearlyType1(nowDate, this.mapMonthStringToNumber(month), day, time, years) : this.getNextOccurenceForNYearlyType2(nowDate, this.mapMonthStringToNumber(month), this.mapOrderStringToNumber(orderNumber), weekDay, time, years);

        const adjustedCalculatedTimestamp = Math.round(timestamp / 1000);

        createdReminders.push({
            timestamp: adjustedCalculatedTimestamp,
            isWarning: false
        });

        if(reminder.hasWarnings) {
            const warningReminders = await this.generateWarningReminders(
                nowDate,
                adjustedCalculatedTimestamp,
                reminder.warningNumber,
                reminder.warningIntervalNumber,
                reminder.warningInterval
            );

            warningReminders.forEach(async (reminderTimestamp) => {
                createdReminders.push({
                    timestamp: Math.round(reminderTimestamp / 1000),
                    isWarning: true
                });
            });
        }

        return createdReminders;
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
        nowDate: Date,
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
  
            if (reminderTimestamp >= nowDate.getTime()) {
                reminders.push(reminderTimestamp);
            }
        }
      
        return reminders;
      }

    getNextOccurrencesForDaily(nowDate: Date, days: { [key: string]: boolean }, time: string): number[] {
        const dayMapping: { [key: string]: number } = {
          sunday: 0,
          monday: 1,
          tuesday: 2,
          wednesday: 3,
          thursday: 4,
          friday: 5,
          saturday: 6,
        };
      
        const [hours, minutes] = time.split(":").map(Number);
      
        const timestamps: number[] = [];
      
        for (const [day, isActive] of Object.entries(days)) {
          if (!isActive) continue;
      
          const targetDay = dayMapping[day.toLowerCase()];
          if (targetDay === undefined) {
            throw new Error(`Invalid day: ${day}`);
          }
      
          let dayDifference = targetDay - nowDate.getDay();
          if (dayDifference < 0 || (dayDifference === 0 && (nowDate.getHours() > hours || (nowDate.getHours() === hours && nowDate.getMinutes() >= minutes)))) {
            dayDifference += 7;
          }
      
          const nextDate = new Date(nowDate);
          nextDate.setDate(nowDate.getDate() + dayDifference);
          nextDate.setHours(hours, minutes, 0, 0);
      
          timestamps.push(nextDate.getTime());
        }
      
        return timestamps.sort((a, b) => a - b);
    }

    getNextOccurrenceForWeekly(nowDate: Date, day: string, time: string): number {
        const dayMapping: { [key: string]: number } = {
          sunday: 0,
          monday: 1,
          tuesday: 2,
          wednesday: 3,
          thursday: 4,
          friday: 5,
          saturday: 6,
        };
      
        const targetDay = dayMapping[day.toLowerCase()];
      
        if (targetDay === undefined) {
          throw new Error(`Invalid day: ${day}`);
        }
      
        const [hours, minutes] = time.split(":").map(Number);
      
        let dayDifference = targetDay - nowDate.getDay();
        if (dayDifference < 0 || (dayDifference === 0 && (nowDate.getHours() > hours || (nowDate.getHours() === hours && nowDate.getMinutes() >= minutes)))) {
          dayDifference += 7;
        }
      
        const nextDate = new Date(nowDate);
        nextDate.setDate(nowDate.getDate() + dayDifference);
        nextDate.setHours(hours, minutes, 0, 0);
      
        return nextDate.getTime();
    }

    getNextOccurrenceForNWeekly(nowDate: Date, weeks: number, startDate: number, time: string): number {
        const [hours, minutes] = time.split(":").map(Number);

        const startDateTime = new Date(startDate * 1000);
        startDateTime.setHours(hours, minutes, 0, 0);

        if (weeks <= 0) {
            throw new Error("The interval (n) must be a positive number.");
        }

        if (nowDate < startDateTime) {
            return startDateTime.getTime();
        }

        const msInWeek = 7 * 24 * 60 * 60 * 1000;
        const elapsedWeeks = Math.floor((nowDate.getTime() - startDateTime.getTime()) / msInWeek);

        const nextWeekMultiple = Math.ceil((elapsedWeeks + 1) / weeks) * weeks;
        const nextOccurrence = new Date(startDateTime.getTime() + nextWeekMultiple * msInWeek);

        return nextOccurrence.getTime();
    }

    getNextOccurenceForMonthlyType1(nowDate: Date, dayOfMonth: number, time: string): number {
        const [hours, minutes] = time.split(":").map(Number);
      
        let nextDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), dayOfMonth, hours, minutes, 0, 0);
      
        if (nowDate > nextDate) {
          nextDate = new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, dayOfMonth, hours, minutes, 0, 0);
        }
      
        return nextDate.getTime();
    }

    getNextOccurenceForMonthlyType2(nowDate: Date, time: string, order: number, dayOfWeek: string): number {
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

        let nextDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1, hours, minutes, 0, 0);

        // Find the first occurrence of the target day in the current month
        while (nextDate.getDay() !== targetDay) {
            nextDate.setDate(nextDate.getDate() + 1);
        }

        // Move to the correct occurrence (order - 1 times after the first occurrence)
        nextDate.setDate(nextDate.getDate() + (order - 1) * 7);

        // If the calculated date is in the past, move to the next month
        if (nowDate > nextDate) {
            nextDate = new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 1, hours, minutes, 0, 0);

            // Find the first occurrence of the target day in the next month
            while (nextDate.getDay() !== targetDay) {
            nextDate.setDate(nextDate.getDate() + 1);
            }

            // Move to the correct occurrence (order - 1 times after the first occurrence)
            nextDate.setDate(nextDate.getDate() + (order - 1) * 7);
        }

        return nextDate.getTime();
    }

    getNextOccurenceForYearlyType1(nowDate: Date, month: number, dayOfMonth: number, time: string): number {
        const [hours, minutes] = time.split(":").map(Number);

        let nextDate = new Date(nowDate.getFullYear(), month - 1, dayOfMonth, hours, minutes, 0, 0);

        // If the current date and time is past the target date, move to the next year
        if (nowDate > nextDate) {
            nextDate = new Date(nowDate.getFullYear() + 1, month - 1, dayOfMonth, hours, minutes, 0, 0);
        }

        return nextDate.getTime();
    }

    getNextOccurenceForYearlyType2(
        nowDate: Date,
        month: number, // Month (1-12)
        order: number, // 1 for first, 2 for second, etc.
        dayOfWeek: string, // "sunday", "monday", etc.
        time: string // Time in HH:mm format
      ): number {
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

        let nextDate = new Date(nowDate.getFullYear(), month - 1, 1, hours, minutes, 0, 0);

        // Find the first occurrence of the target day in the given month
        while (nextDate.getDay() !== targetDay) {
            nextDate.setDate(nextDate.getDate() + 1);
        }

        // Move to the correct occurrence (order - 1 times after the first occurrence)
        nextDate.setDate(nextDate.getDate() + (order - 1) * 7);

        // If the calculated date is in the past, move to the next year
        if (nowDate > nextDate) {
            nextDate = new Date(nowDate.getFullYear() + 1, month - 1, 1, hours, minutes, 0, 0);

            // Find the first occurrence of the target day in the next year's given month
            while (nextDate.getDay() !== targetDay) {
            nextDate.setDate(nextDate.getDate() + 1);
            }

            // Move to the correct occurrence (order - 1 times after the first occurrence)
            nextDate.setDate(nextDate.getDate() + (order - 1) * 7);
        }

        return nextDate.getTime();
    }

    getNextOccurenceForNYearlyType1(nowDate: Date, month: number, dayOfMonth: number, time: string, everyNYears: number): number {
        const [hours, minutes] = time.split(":").map(Number);

        let nextDate = new Date(nowDate.getFullYear(), month - 1, dayOfMonth, hours, minutes, 0, 0);

        // If the current date and time is past the target date, or not on the correct interval, move forward
        while (nowDate > nextDate || (nextDate.getFullYear() - nowDate.getFullYear()) % everyNYears !== 0) {
            nextDate = new Date(nextDate.getFullYear() + 1, month - 1, dayOfMonth, hours, minutes, 0, 0);
        }

        return nextDate.getTime();
    }

    getNextOccurenceForNYearlyType2(
        nowDate: Date,
        month: number, // Month (1-12)
        order: number, // 1 for first, 2 for second, etc.
        dayOfWeek: string, // "sunday", "monday", etc.
        time: string, // Time in HH:mm format
        everyNYears: number // Interval in years
      ): number {
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

        let nextDate = new Date(nowDate.getFullYear(), month - 1, 1, hours, minutes, 0, 0);

        // Find the first occurrence of the target day in the given month
        while (nextDate.getDay() !== targetDay) {
            nextDate.setDate(nextDate.getDate() + 1);
        }

        // Move to the correct occurrence (order - 1 times after the first occurrence)
        nextDate.setDate(nextDate.getDate() + (order - 1) * 7);

        // If the calculated date is in the past, or not on the correct interval, move forward
        while (nowDate > nextDate || (nextDate.getFullYear() - nowDate.getFullYear()) % everyNYears !== 0) {
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
