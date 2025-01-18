import { Reminder, ScheduledReminder } from "@prisma/client";
import nodemailer from 'nodemailer';
import { UserService } from "./UserService";
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
};
