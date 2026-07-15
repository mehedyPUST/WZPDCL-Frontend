import type { Session } from "better-auth";

declare module "better-auth" {
    interface Session {
        accessToken?: string;
    }
    interface User {
        role?: string;
    }
}