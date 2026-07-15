import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL,
    plugins: [nextCookies()],
    session: {
        strategy: "jwt",
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
                token.role = user.role;
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
} as any);   // ← টাইপ এড়াতে as any

export const handlers = {
    GET: auth.handler,
    POST: auth.handler,
};