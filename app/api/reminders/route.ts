import { ReminderService } from "services/ReminderService";
import { CreateReminderSchema } from "@/lib/validations/reminder";
import { z } from "zod";
import { requireAuth } from "middlewares/authMiddleware";
import { NextAuthRequest } from "next-auth/lib";
import { auth } from "@/lib/auth";

export const GET = auth(
  requireAuth(async (req: NextAuthRequest) => {
    try {
      const role = req.auth.user.role!;
      const userId = req.auth.user.id!;
      const reminderService = ReminderService.getInstance();
      let reminders;
      if (role === "admin") {
        reminders = await reminderService.getAll();
      } else {
        reminders = await reminderService.getAllByUserId(userId);
      }

      return new Response(JSON.stringify(reminders));
    } catch (error: any) {
      console.error(error);
      return new Response(error.message, { status: 500 });
    }
  }))

export const POST = auth(
  requireAuth(async (req: NextAuthRequest) => {
    try {
      const userId = req.auth?.user.id;

      const requestBody = await req.json();
      const createReminderDto = CreateReminderSchema.parse({
        userId: userId,
        name: requestBody.name,
        description: requestBody.description,
        timestamp: requestBody.timestamp,
        type: requestBody.type,
        config: requestBody.config,
        isDisabled: requestBody.isDisabled,
        belongsTo: requestBody.belongsTo,
      });

      const reminderService = ReminderService.getInstance();
      await reminderService.createReminder(createReminderDto);

      return new Response("Reminder created", { status: 201 });
    } catch (error: any) {
      console.error(error);
      if (error instanceof z.ZodError) {
        return new Response(JSON.stringify({ errors: error.errors }), { status: 400 });
      }
      return new Response(error.message, { status: 500 });
    }
  }))
