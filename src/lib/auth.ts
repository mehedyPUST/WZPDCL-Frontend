// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    plugins: [nextCookies()],
    session: {
        strategy: "jwt",
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            async profile(profile: any) {
                console.log("✅ Google profile received:", {
                    id: profile.id,
                    email: profile.email,
                    name: profile.name,
                    picture: profile.picture,
                });

                const googleId = profile.id;   // ✅ better‑auth uses profile.id
                const payload = {
                    googleId,
                    email: profile.email,
                    name: profile.name,
                    image: profile.picture,
                };
                console.log("📤 Sending to backend:", payload);

                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });

                    const data = await res.json();
                    console.log("📥 Backend response:", data);

                    if (!res.ok || !data.user) {
                        console.error("❌ Backend auth/google failed", data);
                        return null;
                    }

                    // কুকিতে token ও user সেট করি
                    try {
                        const { cookies } = await import("next/headers");
                        const cookieStore = await cookies();
                        cookieStore.set("token", data.token, { path: "/", maxAge: 60 * 60 * 24 * 7 });
                        cookieStore.set(
                            "user",
                            JSON.stringify({
                                id: data.user.id,
                                _id: data.user.id,
                                name: data.user.name,
                                email: data.user.email,
                                role: data.user.role || "consumer",
                            }),
                            { path: "/", maxAge: 60 * 60 * 24 * 7 }
                        );
                    } catch (cookieErr) {
                        console.error("❌ Could not set cookies in profile callback:", cookieErr);
                    }

                    return {
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.name,
                        role: data.user.role || "consumer",
                        token: data.token,
                    };
                } catch (fetchError) {
                    console.error("❌ Fetch to backend failed:", fetchError);
                    return null;
                }
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

export const handlers = {
    GET: auth.handler,
    POST: auth.handler,
};