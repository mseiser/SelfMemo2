import { ReminderService } from "services/ReminderService";
import { CreateReminderSchema } from "@/lib/validations/reminder";
import { z } from "zod";
import { requireAuth } from "middlewares/authMiddleware";
import { NextAuthRequest } from "next-auth/lib";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const role = user.role;
    const userId = user.id!!;

    const reminderService = ReminderService.getInstance();
    let reminders;

    if (role === "admin") {
      reminders = await reminderService.getAll();
    } else {
      reminders = await reminderService.getAllByUserId(userId);
    }

    return new NextResponse(JSON.stringify(reminders), { status: 200 });
  } catch (error: any) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ message: error.message || "An error occurred" }),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const requestBody = await request.json();

    const createReminderDto = CreateReminderSchema.parse({
      userId: user.id,
      name: requestBody.name,
      description: requestBody.description,
      timestamp: requestBody.timestamp,
      type: requestBody.type,
      config: requestBody.config,
      isDisabled: requestBody.isDisabled,
      belongsTo: requestBody.belongsTo,
      lastSent: requestBody.lastSent,
      hasWarnings: requestBody.hasWarnings,
      warningNumber: requestBody.warningNumber,
      warningInterval: requestBody.warningInterval,
      warningIntervalNumber: requestBody.warningIntervalNumber,
    });

    const reminderService = ReminderService.getInstance();
    await reminderService.createReminder(createReminderDto);

    return new NextResponse("Reminder created", { status: 201 });
  } catch (error: any) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ errors: error.errors }),
        { status: 400 }
      );
    }
    return new NextResponse(
      JSON.stringify({ message: error.message || "An error occurred" }),
      { status: 500 }
    );
  }
}
