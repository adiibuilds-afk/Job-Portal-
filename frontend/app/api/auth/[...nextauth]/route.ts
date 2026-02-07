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
            if (session?.user?.email) {
                try {
                    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                    const res = await fetch(`${API_URL}/api/user/profile?email=${session.user.email}`);
                    const data = await res.json();
                    if (data.user) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (session.user as any).batch = data.user.batch;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (session.user as any).id = data.user._id;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (session.user as any).role = data.user.role;
                    }
                } catch (error) {
                    console.error("Error fetching user session data", error);
                }
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            try {
                if (account?.provider === "google") {
                    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                    await fetch(`${API_URL}/api/auth/google`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.name,
                            image: user.image,
                            googleId: user.id
                        })
                    });
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
