import * as z from "zod";


export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "user"]),
  firstName: z.string().nullable(),
  lastName: z.string().nullable()
})

export const UpdateUserSchema = CreateUserSchema.omit({ password: true }).extend({
  id: z.string()
})

export const UpdateUserPasswordSchema = z.object({
  id: z.string(),
  currentPassword: z.string(),
  newPassword: z.string().min(4)
})

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

export type UpdateUserPasswordDto = z.infer<typeof UpdateUserPasswordSchema>;