import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    // Regular customer login — used by /login.
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Every failure branch below throws the SAME generic message.
        // This is intentional: if the message changed depending on
        // *why* login failed (no such user / wrong password / this is
        // actually an admin account), someone could use that difference
        // to figure out which emails are registered, or which ones
        // belong to admins. One message, always.
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

    // Admin-only login — used by /admin-login. Same principle applies:
    // a non-admin account gets the same generic message a wrong
    // password would, so this form can't be used to fish for which
    // emails have admin access either.
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