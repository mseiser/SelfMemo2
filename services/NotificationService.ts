import { Reminder, ScheduledReminder } from "@prisma/client";
import nodemailer from 'nodemailer';
import { UserService } from "./UserService";
import { addDaysToTimestamp, isCurrentDay, isCurrentHour, isCurrentMinute, isCurrentMonth, isCurrentYear, isDayNumberToday, isNowGreaterThanDate, isNthWeekdayOfMonth, isTimeSetToCurrentTime, isTimestampSetToCurrentMinute, isTodaySetToTrue, isTodayWeekDay } from "@/lib/utils";
import { ReminderService } from "./ReminderService";
import { ScheduledReminderService } from "./ScheduledReminderService";

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }

    return NotificationService.instance;
  }

  async checkIfReminderShouldBeNotified(date: Date, scheduledReminder: ScheduledReminder) {
    const scheduledReminderDate = new Date(scheduledReminder.timestamp * 1000);

    if(
      date.getFullYear() === scheduledReminderDate.getFullYear() &&
      date.getMonth() === scheduledReminderDate.getMonth() &&
      date.getDate() === scheduledReminderDate.getDate() &&
      date.getHours() === scheduledReminderDate.getHours() &&
      date.getMinutes() === scheduledReminderDate.getMinutes()
    ) {
      const reminder = await ReminderService.getInstance().getById(scheduledReminder.reminderId);

      if(!reminder) {
        console.log('Reminder not found, skipping...');
        return;
      }

      this.sendNotification(reminder, scheduledReminder.isWarning);
      await ScheduledReminderService.getInstance().delete(scheduledReminder.id);
    }

    // if(reminder.isDisabled) {
    //   return;
    // }

    // switch(reminder.type) {
    //   case 'one-time':
    //     this.checkOneTimeReminder(reminder);
    //     break;
    //   case 'daily':
    //     this.checkDailyReminder(reminder);
    //     break;
    //   case 'weekly':
    //     this.checkWeeklyReminder(reminder);
    //     break;
    //   case 'n-weekly':
    //     this.checkNWeeklyReminder(reminder);
    //     break;
    //   case 'monthly':
    //     this.checkMonthlyReminder(reminder);
    //     break;
    //   case 'yearly':
    //     this.checkYearlyReminder(reminder);
    //     break;
    //   default:
    //     break;
    // }
  }

  async generateWarningReminders(
    timestamp: number,
    warnings: number | null,
    intervalCount: number | null,
    intervalUnit: string | null
  ) {
    const intervalMap = {
      minute: 60 * 1000,
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000, // approximation
      year: 365 * 24 * 60 * 60 * 1000 // approximation
    };

    if(warnings === null || intervalCount === null || intervalUnit === null) {
      throw new Error("Invalid warning configuration.");
    }
  
    if (!(intervalUnit in intervalMap)) {
      throw new Error("Invalid interval unit. Must be one of: minutes, hours, days, weeks, months, years.");
    }
  
    const intervalMilliseconds = intervalMap[intervalUnit as keyof typeof intervalMap];
    const reminders = [];
  
    for (let i = 1; i <= warnings; i++) {
      const reminderTimestamp = (timestamp * 1000) - (i * intervalCount * intervalMilliseconds);
  
      if (reminderTimestamp > Date.now()) {
        reminders.push(reminderTimestamp);
      }
    }
  
    return reminders.reverse();
  }

  async sendNotification(reminder: Reminder, isWarning: boolean = false) {
    console.log(`Triggering reminder: ${reminder.id}`);

    var smtpTransport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
    });

    let subject = "SelfMemo Reminder: " + reminder.name;
    if(isWarning) {
      subject = "SelfMemo Warning-Reminder: " + reminder.name;
    }

    const userService = UserService.getInstance();
    const user = await userService.getUserById(reminder.userId);
    smtpTransport.sendMail(
      {
        from: process.env.SMTP_MAIL,
        to: user?.email,
        subject: subject,
        text: reminder.description,
      },
      function (error, response) {
        if (error) {
          console.log(error);
        } else {
          console.log("Message sent: " + response);
        }
      }
    );

    // Update lastSent field
    if(!isWarning) {
      const reminderService = ReminderService.getInstance();
      reminderService.updateReminderLastSent(reminder.id, Math.round((new Date().getTime() / 1000)));
    }
  }

  async checkOneTimeReminder(reminder: Reminder) {
    const config = JSON.parse(reminder.config);
    if(config.timestamp === undefined) {
      console.log('Misconfigured reminder, skipping...');
      return;
    }
    const timestamp = config.timestamp;

    if(reminder.hasWarnings) {
      const reminders = await this.generateWarningReminders(
        timestamp,
        reminder.warningNumber,
        reminder.warningIntervalNumber,
        reminder.warningInterval
      );

      reminders.forEach(async (reminderTimestamp) => {
        if(
          isCurrentYear(reminderTimestamp) &&
          isCurrentMonth(reminderTimestamp) &&
          isCurrentMonth(reminderTimestamp) &&
          isCurrentDay(reminderTimestamp) &&
          isCurrentHour(reminderTimestamp) &&
          isCurrentMinute(reminderTimestamp)
        ) {
          this.sendNotification(reminder, true);
        }
      });
    }

    if(
      !isCurrentYear(timestamp) ||
      !isCurrentMonth(timestamp) ||
      !isCurrentMonth(timestamp) ||
      !isCurrentDay(timestamp) ||
      !isCurrentHour(timestamp) ||
      !isCurrentMinute(timestamp)
    ) {
      return;
    }

    this.sendNotification(reminder);
  }

  async checkDailyReminder(reminder: Reminder) {
    const config = JSON.parse(reminder.config);
    if(
      config.repeat === undefined ||
      config.time === undefined
    ) {
      console.log('Misconfigured reminder, skipping...');
      return;
    }
    const repeat = config.repeat;
    const time = config.time;

    if(
      !isTodaySetToTrue(repeat) ||
      !isTimeSetToCurrentTime(time)
    ) {
      return;
    }

    this.sendNotification(reminder);
  }

  async checkWeeklyReminder(reminder: Reminder) {
    const config = JSON.parse(reminder.config);
    if(
      config.day === undefined ||
      config.time === undefined
    ) {
      console.log('Misconfigured reminder, skipping...');
      return;
    }
    const day = config.day;
    const time = config.time;

    if(
      !isTodayWeekDay(day) ||
      !isTimeSetToCurrentTime(time)
    ) {
      return;
    }

    this.sendNotification(reminder);
  }

  async checkNWeeklyReminder(reminder: Reminder) {
    const config = JSON.parse(reminder.config);
    if(
      config.weeks === undefined ||
      config.date === undefined ||
      config.time === undefined
    ) {
      console.log('Misconfigured reminder, skipping...');
      return;
    }
    const weeks = config.weeks;
    const date = config.date;
    const time = config.time;

    // check starting at date
    if(!isNowGreaterThanDate(date)) {
      return;
    }

    // check if reminder has not been sent before
    if(reminder.lastSent === null) {
      if(
        isCurrentYear(date) &&
        isCurrentMonth(date) &&
        isCurrentDay(date) &&
        isTimeSetToCurrentTime(time)
      ) {
        this.sendNotification(reminder);
        return;
      }
    }

    // check if reminder should be sent today
    // this is done by adding the week interval to the date
    const dateInclWeeks = addDaysToTimestamp(date, weeks * 7);
    if(
      !isCurrentYear(dateInclWeeks) ||
      !isCurrentMonth(dateInclWeeks) ||
      !isCurrentDay(dateInclWeeks) ||
      !isTimeSetToCurrentTime(time)
    ) {
      return;
    }

    this.sendNotification(reminder);
  }

  async checkMonthlyReminder(reminder: Reminder) {
    const config = JSON.parse(reminder.config);
    if(
      config.type === undefined ||
      config.time === undefined ||
      config.day === undefined ||
      config.orderNumber === undefined ||
      config.weekDay === undefined
    ) {
      console.log('Misconfigured reminder, skipping...');
      return;
    }
    const type = config.type;
    const time = config.time;
    const day = config.day;
    const orderNumber = config.orderNumber;
    const weekDay = config.weekDay;

    if(!isTimeSetToCurrentTime(time)) {
      return;
    }

    // monthlyType1: every x-th day of the month
    if(type === 'monthlyType1') {
      if(isDayNumberToday(day)) {
        this.sendNotification(reminder);
        return;
      }
    }

    // monthlyType2: every first,second,third,fourth week day (monday, tuesday, ...) of the month
    if (type === 'monthlyType2') {
      if(isNthWeekdayOfMonth(orderNumber, weekDay)) {
        this.sendNotification(reminder);
        return;
      }
    }
  }
  
  async checkYearlyReminder(reminder: Reminder) {
    const config = JSON.parse(reminder.config);
    if(
      config.type === undefined ||
      config.month === undefined ||
      config.day === undefined ||
      config.orderNumber === undefined ||
      config.weekDay === undefined || 
      config.time === undefined
    ) {
      console.log('Misconfigured reminder, skipping...');
      return;
    }
    const type = config.type;
    const month = config.month;
    const day = config.day;
    const orderNumber = config.orderNumber;
    const weekDay = config.weekDay;
    const time = config.time;

    if(
      !isTimeSetToCurrentTime(time) ||
      !isCurrentMonth(month)
    ) {
      return;
    }

    // yearlyType1: every x-th day of the specified month
    if(type === 'yearlyType1') {
      if(isDayNumberToday(day)) {
        this.sendNotification(reminder);
        return;
      }
    }

    // yearlyType2: every first,second,third,fourth week day (monday, tuesday, ...) of the month
    if (type === 'yearlyType2') {
      if(isNthWeekdayOfMonth(orderNumber, weekDay)) {
        this.sendNotification(reminder);
        return;
      }
    }
  }
};