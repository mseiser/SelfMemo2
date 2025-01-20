import { Reminder } from "@prisma/client";
import nodemailer from 'nodemailer';
import { UserService } from "./UserService";
import { ReminderService } from "./ReminderService";

async function getTemplates() {
  const file = await fetch(process.env.TEMPLATES_PATH + "/email-templates.json");
  const templates = await file.json();
  return templates;
}

export class NotificationService {
  private static instance: NotificationService;
  private static notificationTemplates: { [key: string]: string };

  private constructor() {
    getTemplates().then((templates) => {
      NotificationService.notificationTemplates = templates;
    });
  }

  public static getInstance(): NotificationService {
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
    let body = bodyTemplate
      .replace('{{userName}}', `${user?.firstName || 'User'} ${user?.lastName || ''}`.trim())
      .replace('{{reminderName}}', reminder.name)
      .replace('{{reminderDescription}}', reminder.description);

    smtpTransport.sendMail(
      {
      from: process.env.SMTP_MAIL,
      to: user?.email,
      subject: subject,
      text: body,
      },
      function (error, response) {
      if (error) {
      console.log(error);
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
    console.log('timestamps:');
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
