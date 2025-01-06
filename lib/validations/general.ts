import * as z from "zod";


export const DeleteEntity = z.object({
    id: z.string().uuid()
})

export type DeleteEntityDto = z.infer<typeof DeleteEntity>;