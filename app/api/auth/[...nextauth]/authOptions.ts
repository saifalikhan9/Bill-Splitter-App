import { prisma } from "@/lib/prisma";
import { Account, NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcrypt";
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";

export interface UserProps {
  id: string;
  name: string;
  email: string;
  image: string;
  role: string;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials!;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error("No user found with that email");

        const isValid = await compare(password, user.password!);
        if (!isValid) throw new Error("Invalid password");

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
    signOut: "/signout",
    error: "/error",
  },

  session: { strategy: "jwt" },

  callbacks: {
    jwt: async ({
      token,
      user,
      account,
    }: {
      token: JWT;
      user?: User | AdapterUser | UserProps;
      account?: Account | null;
    }) => {
      // Populate token on sign-in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = (user as any).role || "OWNER"; // Fallback if somehow missing
      }

      if (account?.provider === "google") {
        token.accessToken = account.access_token;
      }

      return token;
    },

    session: async ({ session, token }) => {
      session.user = {
        name: token.name as string,
        image: token.picture as string,
        role: token.role as string,
        id: token.id as string,
        email: token.email as string,
      } as UserProps;
      return session;
    },
  },
};
