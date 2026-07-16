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
                // Google প্রোফাইল – id, email, name, picture
                return {
                    id: profile.id,           // ✅ real Google ID
                    email: profile.email,
                    name: profile.name,
                    image: profile.picture,
                };
            },
        },
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    console.log("🔧 databaseHooks triggered for user:", user.email);
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            googleId: user.id,    // ✅ Google ID
                            email: user.email,
                            name: user.name,
                            image: (user as any).image || "",
                        }),
                    });
                    const data = await res.json();
                    console.log("📥 Backend response in hook:", data);
                    if (data?.user) {
                        (user as any).role = data.user.role || "consumer";
                        (user as any).token = data.token;
                    }
                    return user;
                },
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