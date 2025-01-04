import * as z from "zod";


export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "user"]),
})

export type CreateUserDto = z.infer<typeof CreateUserSchema>;