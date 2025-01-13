import { NextAuthRequest } from "next-auth/lib";
import { auth } from "@/lib/auth";
import { UserService } from "services/UserService";
import { requireAuth, requireRole } from "middlewares/authMiddleware";
import { CreateUserDto, CreateUserSchema } from "@/lib/validations/user";


export const GET = auth(
    requireAuth(
        requireRole("admin", async (req: NextAuthRequest) => {
            try {
                const userService = UserService.getInstance();
                const users = await userService.getAllUsers();

                return new Response(JSON.stringify(users), { status: 200 });
            } catch (error: any) {
                console.error(error);
                return new Response(error.message, { status: 500 });
            }
        })
    )
);

export const POST = auth(
    requireAuth(
        requireRole("admin", async (req: NextAuthRequest) => {
            try {

                const { email, password, role, firstName, lastName } = await req.json();

                const createUserDto: CreateUserDto = CreateUserSchema.parse({
                    email,
                    password,
                    role: role,
                    firstName,
                    lastName
                });

                const userService = UserService.getInstance();

                const user = await userService.registerUser(createUserDto);

                return new Response(JSON.stringify(user), { status: 201 });
            } catch (error: any) {
                console.error(error);
                return new Response(error.message, { status: 500 });
            }
        })
    )
);
