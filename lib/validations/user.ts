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

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;