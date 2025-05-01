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
          id: user.id as string,
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
    error: "/login",
  },

  session: { strategy: "jwt", },

  callbacks: {
    
    jwt: async ({ token, user, account }: {token: JWT, user?: User | AdapterUser | UserProps, account?: Account | null}) => {
     
      if (user && account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
  
        // Assign default role only if user doesn't already have one
        if (!existingUser?.role) {
          await prisma.user.update({
            where: { email: user.email! },
            data: { role: "OWNER" },
          });
          token.role = "OWNER";
        } else {
          token.role = existingUser.role;
        }
  
        token.id = existingUser?.id || user.id;
        token.email = user.email;
      }
     
      if (user  && 'role' in user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role; // This will pick up the OWNER role set by the default
      }
      
      if (account?.provider === 'google') {
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
