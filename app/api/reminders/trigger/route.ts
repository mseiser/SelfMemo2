import { ReminderService } from "services/ReminderService";
import { NextRequest } from "next/server";
import { NotificationService } from "services/NotificationService";

export async function GET(request: NextRequest) {
  try {
    const notificationService = NotificationService.getInstance();
    const reminders = await ReminderService.getInstance().getAll();

    const now = new Date();
    now.setSeconds(0, 0);

    reminders.forEach(async (reminder) => {
      await notificationService.checkIfReminderShouldBeNotified(now, reminder);
    });

    return new Response("OK");
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({message: error.message}), { status: 500 });
  }
}