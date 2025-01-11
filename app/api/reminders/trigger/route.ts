import { ReminderService } from "services/ReminderService";
import { NextRequest } from "next/server";
import { isTimeSetToCurrentTime, isTimestampSetToCurrentMinute, isTodaySetToTrue } from "@/lib/utils";
import { NotificationService } from "services/NotificationService";

export async function POST(request: NextRequest) {
  try {
    const notificationService = NotificationService.getInstance();
    const reminderService = ReminderService.getInstance();
    const reminders = await reminderService.getAll();

    reminders.forEach((reminder) => {
      notificationService.checkIfReminderShouldBeNotified(reminder);
    });

    return new Response("OK");
  } catch (error: any) {
    console.error(error);
    return new Response(error.message, { status: 500 });
  }
}