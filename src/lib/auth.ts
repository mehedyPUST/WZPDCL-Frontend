import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";

let client: MongoClient;
async function getDb() {
    if (!client) {
        client = new MongoClient(process.env.MONGODB_URI!);
        await client.connect();
        console.log('✅ MongoDB connected for auth adapter');
    }
    return client.db(process.env.DB_NAME || 'WZPDCL-DB');
}

const dbPromise = getDb();

export const auth = betterAuth({
    database: mongodbAdapter(
        await dbPromise,
        {
            client: client!,
            // ✅ collection name কাস্টমাইজ করছি যাতে আমাদের "users" collection ব্যবহার হয়
            collectionName: "users",
        }
    ),
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
    secret: process.env.BETTER_AUTH_SECRET || "local-secret",
    plugins: [nextCookies()],
    session: { strategy: "jwt" },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    databaseHooks: {
        user: {
            signIn: {
                after: async (session, user) => {
                    console.log("🔧 signIn.after triggered for:", user.email);
                    try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                googleId: user.id,
                                email: user.email,
                                name: user.name,
                                image: (user as any).image || "",
                            }),
                        });
                        const data = await res.json();
                        console.log("📥 Backend response in signIn hook:", data);
                        if (data?.token) {
                            const { cookies } = await import("next/headers");
                            const cookieStore = await cookies();
                            cookieStore.set("token", data.token, { path: "/", maxAge: 60 * 60 * 24 * 7 });
                            cookieStore.set("user", JSON.stringify({
                                id: data.user.id, name: data.user.name,
                                email: data.user.email, role: data.user.role,
                            }), { path: "/", maxAge: 60 * 60 * 24 * 7 });
                            console.log("✅ Cookies updated from signIn hook");
                        }
                    } catch (err) {
                        console.error("❌ Backend call failed in signIn hook:", err);
                    }
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