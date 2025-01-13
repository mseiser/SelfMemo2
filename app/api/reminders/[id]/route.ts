import { ReminderService } from "services/ReminderService";
import { NextRequest, NextResponse } from "next/server";
import {CreateReminderSchema, UpdateReminderSchema } from "@/lib/validations/reminder";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { auth } from "@/lib/auth";
import { requireAuth } from "middlewares/authMiddleware";
import { NextAuthRequest } from "next-auth/lib";

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const requestBody = await request.json();
    if(requestBody.userId !== user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const updateReminderDto = UpdateReminderSchema.parse(requestBody);

    const reminderService = ReminderService.getInstance();
    await reminderService.updateReminder(updateReminderDto);

    return new Response("Reminder updated", { status: 200 });
  } catch (error: any) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ errors: error.errors }), { status: 400 });
    }
    return new Response(error.message, { status: 500 });
  }
}

export const DELETE = auth(
  requireAuth(async (req: NextAuthRequest) => {
    try {
      const url = new URL(req.url);
      const id = url.pathname.split("/").pop();

      if (!id || typeof id !== "string") {
        return new Response("Reminder ID is required", { status: 400 });
      }

      const reminderService = ReminderService.getInstance();
      await reminderService.deleteReminder(id);

      return new Response("Reminder deleted", { status: 200 });
    } catch (error: any) {
        console.error(error);
        return new Response(error.message, { status: 500 });
    }
  })
);
