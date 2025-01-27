import { Reminder } from "@prisma/client";
import nodemailer from 'nodemailer';
import { UserService } from "./UserService";
import { ReminderService } from "./ReminderService";
import template from 'public/email-template.json';

type Template = {
  warningSubject: string;
  warningBody: string;
  reminderSubject: string;
  reminderBody: string;
};

export class NotificationService {
  private static instance: NotificationService;
  private static notificationTemplates: Template;

  private constructor() {
    NotificationService.notificationTemplates = {
      warningSubject: template.warning.subject,
      warningBody: template.warning.body,
      reminderSubject: template.reminder.subject,
      reminderBody: template.reminder.body,
    };
  }

  public static getInstance() {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }

    return NotificationService.instance;
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


    let subjectTemplate = NotificationService.notificationTemplates[isWarning ? 'warningSubject' : 'reminderSubject'];
    let subject = subjectTemplate.replace('{{reminderName}}', reminder.name);

    const userService = UserService.getInstance();
    const user = await userService.getUserById(reminder.userId);

    let bodyTemplate = NotificationService.notificationTemplates[isWarning ? 'warningBody' : 'reminderBody'];
    let body = bodyTemplate.replace('{{firstName}}', user?.firstName || '')
                           .replace('{{lastName}}', user?.lastName || '')
                           .replace('{{description}}', reminder.description);

    smtpTransport.sendMail(
      {
      from: process.env.SMTP_MAIL,
      to: user?.email,
      subject: subject,
      text: body,
      },
      function (error, response) {
      if (error) {
      console.error(error);
      } else {
      console.log({
      from: process.env.SMTP_MAIL,
      to: user?.email,
      subject: subject,
      text: body
      });
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

  async checkIfReminderShouldBeNotified(date: Date, reminder: Reminder) {
    const reminderTimestamps = await ReminderService.getInstance().getReminderTimestamps(date, reminder);
    reminderTimestamps.forEach(async (reminderTimestamp) => {
      console.log((new Date(reminderTimestamp.timestamp * 1000)).toISOString());

      const reminderDate = new Date(reminderTimestamp.timestamp * 1000);

      if(
        date.getFullYear() === reminderDate.getFullYear() &&
        date.getMonth() === reminderDate.getMonth() &&
        date.getDate() === reminderDate.getDate() &&
        date.getHours() === reminderDate.getHours() &&
        date.getMinutes() === reminderDate.getMinutes()
      ) {
        this.sendNotification(reminder, reminderTimestamp.isWarning);
      }
    });
  }
};
