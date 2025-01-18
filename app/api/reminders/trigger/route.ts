import { ReminderService } from "services/ReminderService";
import { NextRequest } from "next/server";
import { isTimeSetToCurrentTime, isTimestampSetToCurrentMinute, isTodaySetToTrue } from "@/lib/utils";
import { NotificationService } from "services/NotificationService";
import { ScheduledReminderService, ScheduledReminderService } from "services/ScheduledReminderService";

export async function POST(request: NextRequest) {
  try {
    const notificationService = NotificationService.getInstance();
    const scheduledReminderService = ScheduledReminderService.getInstance();
    const scheduledReminders = await scheduledReminderService.getAll();
    const reminders = await ReminderService.getInstance().getAll();
    const now = new Date();

    scheduledReminders.forEach((scheduledReminder) => {
      notificationService.checkIfReminderShouldBeNotified(now, scheduledReminder);
    });

    reminders.forEach(async (reminder) => {
      await scheduledReminderService.createScheduledReminders(reminder);
    });

    return new Response("OK");
  } catch (error: any) {
    console.error(error);
    return new Response(error.message, { status: 500 });
  }
}