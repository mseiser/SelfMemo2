import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
    } & DefaultSession["user"];
  }
}

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: "/login",
    error: '/login',
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@test.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const { email, password } = credentials;

        const user = await prisma.user.findUnique({
          where: {
            email: email,
          },
        })

        if (user) {
          const isMatch = await bcrypt.compare(password, user.password)//comparePassword(password, user.password);

          if (isMatch) {
            return user;
          } else {
            throw new Error("Email or Password is not correct");
          }
        } else {
          throw new Error("User not found");
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }

        if (token.email) {
          session.user.email = token.email;
        }

        if (token.role) {
          session.user.role = token.role;
        }

        session.user.name = token.name;
        session.user.image = token.picture;
      }

      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.role = user.role;
        token.name = user.name;
        token.picture = user.image;
      }

      return token;
    },
  }
});