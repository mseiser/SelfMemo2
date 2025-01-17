import { UserService } from "services/UserService";
import { CreateUserDto, CreateUserSchema } from "@/lib/validations/user";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";


export const GET = async (request: NextRequest) => {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userService = UserService.getInstance();
        const users = await userService.getAllUsers();

        return new NextResponse(JSON.stringify(users), { status: 200 });
    } catch (error: any) {
        console.error(error);
        return new NextResponse(
            JSON.stringify({ message: error.message || "An error occurred" }),
            { status: 500 }
        );
    }
}

export const POST = async (request: NextRequest) => {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const requestBody = await request.json();
        const { email, password, role, firstName, lastName } = requestBody;

        const createUserDto: CreateUserDto = CreateUserSchema.parse({
            email,
            password,
            role,
            firstName,
            lastName,
        });

        const userService = UserService.getInstance();
        const newUser = await userService.registerUser(createUserDto);

        return new NextResponse(JSON.stringify(newUser), { status: 201 });
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