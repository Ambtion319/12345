// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    provider?: string;
    user: {
      id: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: string;
  }

  interface JWT {
    id?: string;
    role?: string;
    accessToken?: string;
    provider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    accessToken?: string;
    provider?: string;
  }
}
