import { ReminderService } from "services/ReminderService";
import { NextRequest } from "next/server";
import { isTimeSetToCurrentTime, isTimestampSetToCurrentMinute, isTodaySetToTrue } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const reminderService = ReminderService.getInstance();
    const reminders = await reminderService.getAll();

    reminders.forEach((reminder) => {
      if(reminder.isDisabled) {
        return;
      }

      switch(reminder.type) {
        case 'one-time':
          if(isTimestampSetToCurrentMinute(JSON.parse(reminder.config).timestamp)) {
            reminderService.triggerReminder(reminder);
          }
          break;
        case 'daily':
          if(isTimeSetToCurrentTime(JSON.parse(reminder.config).time) && isTodaySetToTrue(JSON.parse(reminder.config).repeat)) {
            reminderService.triggerReminder(reminder);
          }
          break;
        default:
          break;
      }
    });

    return new Response("OK");
  } catch (error: any) {
    console.error(error);
    return new Response(error.message, { status: 500 });
  }
}