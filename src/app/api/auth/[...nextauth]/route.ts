import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/user";
import bcrypt from "bcryptjs";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "m@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectToDatabase();
        const user = await User.findOne({ email: credentials?.email });
        
        if (!user) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(credentials?.password || "", user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any, user?: any }) {
      if (user) {
        token.userId = user.id;
        token.username = user.username;
        token.email = user.email;
        token.avatar = user.avatar;
      }
      console.log('JWT token:', token); // Debugging line
      return token;
    }
    ,
    async session({ session, token }: { session: any, token: any }) {
      if (session.user) {
        session.user.id = token.userId;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.avatar = token.avatar;
        session.user.name = token.username;  // Set name to username
        session.user.image = token.avatar;
      }
      return session;
    },
  },
  session: { strategy: "jwt" as const },
  secret: process.env.NEXTAUTH_SECRET, // Set this in your .env file
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
