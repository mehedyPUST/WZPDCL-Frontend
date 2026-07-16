import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Check for either the standard or secure better-auth session token
    const token = request.cookies.get("better-auth.session_token") ||
        request.cookies.get("__Secure-better-auth.session_token");

    if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};

