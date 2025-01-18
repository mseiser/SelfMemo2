import { CreateUserDto, CreateUserSchema } from "@/lib/validations/user";
import { NextRequest, NextResponse } from "next/server";
import { UserService } from "services/UserService";
import z from "zod";

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        const createUserDto: CreateUserDto = CreateUserSchema.parse({
            email,
            password,
            role: "user"
        });

        const userService = UserService.getInstance();

        await userService.registerUser(createUserDto);

        return new Response("User created", { status: 201 });
    } catch (error: any) {

        console.error(error);
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify({ errors: error.errors }), { status: 400 });
        }
        return new Response(JSON.stringify({message: error.message}), { status: 500 });
    }
}