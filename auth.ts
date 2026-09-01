import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        phone: { label: "휴대전화번호", type: "text" },
        password: { label: "비밀번호", type: "password" },
      },
      authorize: async (credentials) => {
        const phone = credentials?.phone as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!phone || !password) return null;

        const user = await prisma.user.findUnique({ where: { phone } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          role: user.role,
          status: user.status,
          dong: user.dong,
          ho: user.ho,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: string }).role;
        token.status = (user as { status: string }).status;
        token.dong = (user as { dong: string }).dong;
        token.ho = (user as { ho: string }).ho;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
        session.user.dong = token.dong as string;
        session.user.ho = token.ho as string;
      }
      return session;
    },
  },
});
