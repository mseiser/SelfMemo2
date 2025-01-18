import * as z from "zod";


export const CreateReminderSchema = z.object({
  userId: z.string().nonempty("User ID is required"),
  name: z.string().nonempty("Name is required"),
  description: z.string().optional(),
  type: z.string().nonempty().refine(
    (val) => ["one-time", "daily", "weekly", "n-weekly", "monthly", "yearly", "n-yearly"].includes(val),
    { message: "Type must be one of 'one-time', 'daily', 'weekly', 'n-weekly', 'monthly', 'yearly', 'n-yearly'." }
  ),
  config: z.string().refine((value) => {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }, { message: "Invalid JSON format" }),
  isDisabled: z.boolean().optional().default(false),
  belongsTo: z.string().optional().nullable(),
  lastSent: z.string().optional().nullable(),
  hasWarnings: z.boolean().optional().default(false),
  warningNumber: z.number().optional().nullable(),
  warningInterval: z.string().optional().nullable(),
  warningIntervalNumber: z.number().optional().nullable(),
});


export const UpdateReminderSchema = z.object({
  id: z.string().nonempty("Reminder ID is required"),
  userId: z.string().nonempty("User ID is required"),
  name: z.string().nonempty("Name is required"),
  description: z.string().optional(),
  type: z.string().nonempty().refine(
    (val) => ["one-time", "daily", "weekly", "n-weekly", "monthly", "yearly", "n-yearly"].includes(val),
    { message: "Type must be one of 'one-time', 'daily', 'weekly', 'n-weekly', 'monthly', 'yearly', 'n-yearly'." }
  ),
  config: z.string().refine((value) => {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }, { message: "Invalid JSON format" }),
  isDisabled: z.boolean().optional().default(false),
  belongsTo: z.string().optional().nullable(),
  lastSent: z.string().optional().nullable(),
  hasWarnings: z.boolean().optional().default(false),
  warningNumber: z.number().optional().nullable(),
  warningInterval: z.string().optional().nullable(),
  warningIntervalNumber: z.number().optional().nullable(),
});

export type CreateReminderDto = z.infer<typeof CreateReminderSchema>;
export type UpdateReminderDto = z.infer<typeof UpdateReminderSchema>;