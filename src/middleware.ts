import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // 1. আগে আমাদের custom token cookie চেক করো (email login)
    const customToken = request.cookies.get("token");
    if (customToken) {
        return NextResponse.next();
    }

    // 2. custom token না থাকলে better-auth session token চেক করো (Google login)
    const sessionToken =
        request.cookies.get("better-auth.session_token") ||
        request.cookies.get("__Secure-better-auth.session_token");

    if (sessionToken) {
        return NextResponse.next();
    }

    // 3. একটাও না থাকলে /login-এ পাঠাও
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};