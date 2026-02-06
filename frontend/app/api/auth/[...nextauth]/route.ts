import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            // Add custom logic here if needed, e.g., adding user ID from database
            return session;
        },
        async signIn({ user, account, profile }) {
            // Hook to sync user with backend DB could go here
            // For now, we'll return true to allow sign in
            try {
                if (account?.provider === "google") {
                    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                    // Optimistically sync user to backend
                    // We use fetch here to send data to our backend
                    // verifyUser(user) - to be implemented
                }
                return true;
            } catch (error) {
                console.error("Error saving user", error);
                return true;
            }
        },
    },
    pages: {
        signIn: '/auth/signin', // Optional custom signin page
    },
    secret: process.env.NEXTAUTH_SECRET || "supersecretkey123",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
