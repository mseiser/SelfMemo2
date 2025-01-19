import { UserService } from "services/UserService";
import { UpdateUserDto, UpdateUserSchema } from "@/lib/validations/user";
import { getCurrentUser } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const DELETE = async (request: NextRequest) => {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Extract user ID from the URL
        const url = new URL(request.url);
        const id = url.pathname.split("/").pop();

        if (!id || typeof id !== "string") {
            return new NextResponse("User ID is required", { status: 400 });
        }

        const userService = UserService.getInstance();
        await userService.deleteUser(id);

        return new NextResponse("User deleted", { status: 200 });
    } catch (error: any) {
        console.error(error);
        return new NextResponse(
            JSON.stringify({ message: error.message || "An error occurred" }),
            { status: 500 }
        );
    }
}

export const PUT = async (request: NextRequest) => {
    try {
        const user = await getCurrentUser();

        // Extract user ID from the URL
        const url = new URL(request.url);
        const id = url.pathname.split("/").pop();

        if (!user || (user.role !== "admin" && user.id !== id)) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!id || typeof id !== "string") {
            return new NextResponse("User ID is required", { status: 400 });
        }

        // Parse request body
        const requestBody = await request.json();
        const { email, password, role, firstName, lastName } = requestBody;

        const updateUserDto: UpdateUserDto = UpdateUserSchema.parse({
            id,
            email,
            password,
            role,
            firstName,
            lastName,
        });

        const userService = UserService.getInstance();
        const updatedUser = await userService.updateUser(updateUserDto);

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