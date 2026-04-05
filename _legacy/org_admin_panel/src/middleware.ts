import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Simple check for the 'token' cookie
    const token = request.cookies.get('token')?.value;
    const isLoginPage = request.nextUrl.pathname === '/login';
    const isPublicAccess = request.nextUrl.pathname.startsWith('/access');

    // Skip middleware for API, static files, and public access pages
    if (
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/api') ||
        isPublicAccess
    ) {
        return NextResponse.next();
    }

    // If not logged in and trying to access protected route
    if (!token && !isLoginPage) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // If logged in and trying to access login page
    if (token && isLoginPage) {
        const dashboardUrl = new URL('/', request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
