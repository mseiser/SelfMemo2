import * as z from "zod";


export const CreateScheduledReminderSchema = z.object({
  reminderId: z.string().nonempty("Reminder ID is required"),
  timestamp: z.number(),
  isWarning: z.boolean().default(false),
});


export const UpdateScheduledReminderSchema = z.object({
  id: z.string().nonempty("Reminder ID is required"),
  reminderId: z.string().nonempty("Reminder ID is required"),
  timestamp: z.number(),
  isWarning: z.boolean().default(false),
});

export type CreateScheduledReminderDto = z.infer<typeof CreateScheduledReminderSchema>;
export type UpdateScheduledReminderDto = z.infer<typeof UpdateScheduledReminderSchema>;
