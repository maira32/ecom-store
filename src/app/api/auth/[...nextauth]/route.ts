import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        
        const genericError = "Invalid email or password";

        if (!credentials?.email || !credentials?.password) {
          throw new Error(genericError);
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email }).select("+password");

        if (!user) {
          throw new Error(genericError);
        }

        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordMatch) {
          throw new Error(genericError);
        }

        if (user.role === 'admin') {
          throw new Error(genericError);
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    }),

    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const genericError = "Invalid email or password";

        if (!credentials?.email || !credentials?.password) {
          throw new Error(genericError);
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email }).select("+password");

        if (!user) {
          throw new Error(genericError);
        }

        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordMatch) {
          throw new Error(genericError);
        }

        if (user.role !== 'admin') {
          throw new Error(genericError);
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).role = (user as any).role;
        (token as any).id = user.id; 
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = (token as any).role;
        (session.user as any).id = (token as any).id; 
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', 
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };