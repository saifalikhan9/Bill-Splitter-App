import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";
import type { NextAuthOptions } from "next-auth";
import { storeEmailOAuthTokens } from "@/lib/emailService";

// Ensure prisma is properly initialized before using it in the adapter
const adapter = PrismaAdapter(prisma) as any;

export const authOptions: NextAuthOptions = {
    adapter,
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        authorization: {
          params: {
            scope: "openid email profile",
            access_type: "offline",
            prompt: "consent", // This forces Google to show the consent screen again
          },
        },
      }),
      
      // You can remove this CredentialsProvider if you only want Google authentication
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          try {
            // Validate credentials format
            if (!credentials?.email || !credentials?.password) {
              throw new Error("Missing credentials");
            }
  
            // Find user with error handling
              const user = await prisma.user.findUnique({
              where: { email: credentials.email },
              select: {
                id: true,
                email: true,
                password: true,
                name: true,
                role: true,
              },
              });
  
                  if (!user) {
                    throw new Error("User not found");
                  }
  
           
                  const passwordValid = await compare(
                    credentials.password,
                    user?.password
                  );
  
                      if (!passwordValid) {
                        throw new Error("Invalid password");
                      }
  
            return {
              id: user.id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
            };
          } catch (error) {
            // Enhanced error logging
            console.error("Authentication error:", error);
  
            // Convert error to string for client-side
            let errorMessage = "Authentication failed";
            if (error instanceof Error) {
              errorMessage += `: ${error.message}`;
            }
  
            // Return error information
            return Promise.reject(new Error(errorMessage));
          }
        },
      }),
    ],
    pages: {
      signIn: "/signin",
      error: "/errors", // Custom error page
    },
    session: {
      strategy: "jwt",
      maxAge: 24 * 60 * 60, // 24 hours
    },
    callbacks: {
      async signIn({ user, account, profile, email, credentials }) {
        // Check if this is an email authorization request from our custom flow
        const isEmailAuth = account?.provider === 'google' && 
                            typeof account.state === 'string' && 
                            account.state.startsWith('email-auth:');
        
        if (isEmailAuth && account) {
          try {
            console.log("Processing email auth in signIn callback");
            // Extract the user ID from state parameter
            const stateParam = account.state as string;
            const userId = parseInt(stateParam.split(':')[1], 10);
            
            if (!isNaN(userId) && account.access_token && account.refresh_token && account.expires_at) {
              // Store the OAuth tokens
              await storeEmailOAuthTokens(userId, {
                accessToken: account.access_token,
                refreshToken: account.refresh_token,
                expiryDate: new Date(account.expires_at * 1000),
                provider: 'gmail'
              });
              
              console.log("Successfully stored email OAuth tokens");
              
              // Redirect to profile page
              return `/dashboard/profile?emailAuth=success`;
            }
          } catch (error) {
            console.error("Error saving email auth tokens:", error);
            // Continue with sign in anyway
          }
        }
        
        // If the account is Google, update the user's role to OWNER (standard flow)
        if (account?.provider === 'google' && !isEmailAuth) {
          return true;
        }
        
        return true;
      },
      async jwt({ token, user, account }) {
        // Include the user's role in the JWT token
        if (user) {
          token.id = user.id;
          token.role = user.role; 
        }
        
        // Special handling for new Google users
        if (account?.provider === 'google' && token.email) {
          try {
            // After a Google sign-in, update the user role to OWNER
            const updatedUser = await prisma.user.update({
              where: { email: token.email as string },
              data: { role: 'OWNER' }
            });
            
            token.role = 'OWNER';
          } catch (error) {
            console.error("Error updating user role:", error);
          }
        }
        
        return token;
      },
      async session({ session, token }) {
        if (token && session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as string;
        }
        return session;
      },
    },
  
    debug: process.env.NODE_ENV !== "production", // Enable debug in development
    logger: {
      error(code, metadata) {
        console.error("NextAuth error:", { code, metadata });
      },
      warn(code) {
        console.warn("NextAuth warning:", code);
      },
      debug(code, metadata) {
        console.debug("NextAuth debug:", { code, metadata });
      },
    },
  };