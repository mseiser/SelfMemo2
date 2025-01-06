import { ReminderService } from "services/ReminderService";
import { NextRequest, NextResponse } from "next/server";
import { CreateReminderDto, CreateReminderSchema } from "@/lib/validations/reminder";
import { z } from "zod";
import { JWT } from "next-auth/jwt";
import getServerSession from 'next-auth';
import { handlers } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const reminderService = ReminderService.getInstance();

    const reminders = await reminderService.getAll();

    return new Response(JSON.stringify(reminders));
  } catch (error: any) {
    console.error(error);
    return new Response(error.message, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const userId = user.id;

    const requestBody = await request.json();
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
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const userId = user.id;

    const requestBody = await request.json();
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
    await reminderService.updateReminder(createReminderDto);

    return new Response("Reminder updated", { status: 201 });
  } catch (error: any) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ errors: error.errors }), { status: 400 });
    }
    return new Response(error.message, { status: 500 });
  }
}
