
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define protected paths
const protectedPaths = ['/app'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if current path matches any protected path
    const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

    if (!isProtected) {
        return NextResponse.next();
    }

    // Get token from cookie
    const token = request.cookies.get('access_token')?.value;

    if (!token) {
        const loginUrl = new URL('/auth', request.url);
        // loginUrl.searchParams.set('from', pathname); // Optional: Redirect back after login
        return NextResponse.redirect(loginUrl);
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

        // Verify token statelessly
        await jwtVerify(token, secret);

        // Valid token -> Proceed
        return NextResponse.next();
    } catch (error) {
        console.error('Middleware Auth Error:', error);
        // Invalid token -> Redirect to login
        const loginUrl = new URL('/auth', request.url);
        return NextResponse.redirect(loginUrl);
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
