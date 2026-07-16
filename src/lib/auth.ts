import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
    secret: process.env.BETTER_AUTH_SECRET || "local-secret",
    plugins: [nextCookies()],
    session: { strategy: "jwt" },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            async profile(profile: any) {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        googleId: profile.id,
                        email: profile.email,
                        name: profile.name,
                        image: profile.picture,
                    }),
                });
                const data = await res.json();
                if (!data?.user) return null;

                // ✅ Google লগইনের সময় কুকিতে token ও user সেট
                try {
                    const { cookies } = await import("next/headers");
                    const cookieStore = await cookies();
                    cookieStore.set("token", data.token, { path: "/", maxAge: 60 * 60 * 24 * 7, httpOnly: false });
                    cookieStore.set("user", JSON.stringify({
                        id: data.user.id,
                        name: data.user.name,
                        email: data.user.email,
                        role: data.user.role,
                    }), { path: "/", maxAge: 60 * 60 * 24 * 7, httpOnly: false });
                } catch (e) {
                    console.error("Cookie set failed in profile:", e);
                }

                return {
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.name,
                    role: data.user.role,
                    token: data.token,
                };
            },
        },
    },
    providers: [
        {
            id: "credentials",
            type: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: { email: string; password: string }) {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(credentials),
                });
                if (!res.ok) return null;
                const data = await res.json();
                return {
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.name,
                    role: data.user.role,
                    token: data.token,
                };
            },
        },
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role || "consumer";
                token.accessToken = user.token;
            }
            return token;
        },
        async session({ session, token }: any) {
            session.user.role = token.role;
            session.accessToken = token.accessToken;
            return session;
        },
    },
} as any);

export const handlers = { GET: auth.handler, POST: auth.handler };