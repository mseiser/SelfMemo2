import { Reminder } from "@prisma/client";
import nodemailer from 'nodemailer';
import { UserService } from "./UserService";
import { addDaysToTimestamp, isCurrentDay, isCurrentHour, isCurrentMinute, isCurrentMonth, isCurrentYear, isDayNumberToday, isNowGreaterThanDate, isNthWeekdayOfMonth, isTimeSetToCurrentTime, isTimestampSetToCurrentMinute, isTodaySetToTrue, isTodayWeekDay } from "@/lib/utils";
import { ReminderService } from "./ReminderService";

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }

    return NotificationService.instance;
  }

  async checkIfReminderShouldBeNotified(reminder: Reminder) {
    if(reminder.isDisabled) {
      return;
    }

    switch(reminder.type) {
      case 'one-time':
        this.checkOneTimeReminder(reminder);
        break;
      case 'daily':
        this.checkDailyReminder(reminder);
        break;
      case 'weekly':
        this.checkWeeklyReminder(reminder);
        break;
      case 'n-weekly':
        this.checkNWeeklyReminder(reminder);
        break;
      case 'monthly':
        this.checkMonthlyReminder(reminder);
        break;
      case 'yearly':
        this.checkYearlyReminder(reminder);
        break;
      default:
        break;
    }
  }

  async sendNotification(reminder: Reminder) {
    console.log(`Triggering reminder: ${reminder.id}`);

    var smtpTransport = nodemailer.createTransport({
        host: "mail.smtp2go.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
    });

    const userService = UserService.getInstance();
    const user = await userService.getUserById(reminder.userId);
    smtpTransport.sendMail(
      {
        from: "dev@weisl.cc",
        to: user?.email,
        subject: "SelfMemo Reminder: " + reminder.name,
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
    const reminderService = ReminderService.getInstance();
    reminderService.updateReminderLastSent(reminder.id, (new Date().getTime() / 1000));
  }

  async checkOneTimeReminder(reminder: Reminder) {
    const config = JSON.parse(reminder.config);
    if(config.timestamp === undefined) {
      console.log('Misconfigured reminder, skipping...');
      return;
    }

    const timestamp = config.timestamp;

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