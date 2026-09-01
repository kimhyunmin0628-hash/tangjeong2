import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      status: string;
      dong: string;
      ho: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    status: string;
    dong: string;
    ho: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    status: string;
    dong: string;
    ho: string;
  }
}
