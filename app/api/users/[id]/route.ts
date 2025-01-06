
import { auth } from "@/lib/auth";
import { requireAuth, requireRole } from "middlewares/authMiddleware";
import { UserService } from "services/UserService";
import { NextAuthRequest } from "next-auth/lib";

export const DELETE = auth(
    requireAuth(
        requireRole("admin", async (req: NextAuthRequest) => {
            try {
                const url = new URL(req.url);
                const id = url.pathname.split("/").pop();

                if (!id || typeof id !== "string") {
                    return new Response("User ID is required", { status: 400 });
                }

                const userService = UserService.getInstance();
                await userService.deleteUser(id);

                return new Response("User deleted", { status: 200 });
            } catch (error: any) {
                console.error(error);
                return new Response(error.message, { status: 500 });
            }
        })
    )
);