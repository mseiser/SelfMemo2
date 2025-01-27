import { UserService } from "services/UserService";
import { UpdateUserPasswordDto, UpdateUserPasswordSchema } from "@/lib/validations/user";
import { getCurrentUser } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const PUT = async (request: NextRequest) => {
    try {
        const user = await getCurrentUser();

        const url = new URL(request.url);
        const id = url.pathname.split("/")[3];

        if (!user || (user.role !== "admin" && user.id !== id)) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!id || typeof id !== "string") {
            return new NextResponse("User ID is required", { status: 400 });
        }

        const requestBody = await request.json();
        const { currentPassword, newPassword } = requestBody;

        const updateUserPasswordDto: UpdateUserPasswordDto = UpdateUserPasswordSchema.parse({
            id,
            currentPassword,
            newPassword
        });

        const userService = UserService.getInstance();
        const updatedUser = await userService.updatePassword(updateUserPasswordDto);

        return new NextResponse(JSON.stringify(updatedUser), { status: 200 });
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