import { Reminder } from "@prisma/client";
import nodemailer from 'nodemailer';
import { UserService } from "./UserService";
import { isTimeSetToCurrentTime, isTimestampSetToCurrentMinute, isTodaySetToTrue } from "@/lib/utils";

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
  }

  async checkOneTimeReminder(reminder: Reminder) {
    if(isTimestampSetToCurrentMinute(JSON.parse(reminder.config).timestamp)) {
      this.sendNotification(reminder);
    }
  }

  async checkDailyReminder(reminder: Reminder) {
    if(isTimeSetToCurrentTime(JSON.parse(reminder.config).time) && isTodaySetToTrue(JSON.parse(reminder.config).repeat)) {
      this.sendNotification(reminder);
    }
  }

  async checkWeeklyReminder(reminder: Reminder) {
    // TODO
  }

  async checkNWeeklyReminder(reminder: Reminder) {
    // TODO
  }

  async checkMonthlyReminder(reminder: Reminder) {
    // TODO
  }
  
  async checkYearlyReminder(reminder: Reminder) {
    // TODO
  }
};