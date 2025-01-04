import { UserService } from "services/UserService";


export async function GET() {
  try {
    const userService = UserService.getInstance();

    await userService.createDefaultAdminUser();

    return new Response("Admin user created", { status: 201 });
  } catch (error: any) {
    console.error(error);
    return new Response(error.message, { status: 500 });
  }
}
