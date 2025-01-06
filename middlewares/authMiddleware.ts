import { NextAuthRequest } from "next-auth/lib";

export const requireAuth = (handler: (req: NextAuthRequest) => Promise<Response>) => {
    return async (req: NextAuthRequest) => {
        const session = req.auth

        if (!session) {
            return new Response("Not authenticated", { status: 401 });
        }

        return handler(req);
    };
};

export const requireRole = (role: string, handler: (req: NextAuthRequest) => Promise<Response>) => {
    return requireAuth(async (req) => {
        const user = req.auth?.user;

        if (user?.role !== role) {
            return new Response("Unauthorized", { status: 403 });
        }

        return handler(req);
    });
};