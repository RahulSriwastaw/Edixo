import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SINGLE_OWNER_DISABLED_PREFIXES = [
    '/organizations',
    '/org-admin',
    '/mockbook/org',
    '/question-bank/points',
    '/question-bank/sets/create',
    '/mocktests/create-from-sets',
];

export function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Simple check for the 'token' cookie
    const token = request.cookies.get('sb_token')?.value;
    const isLoginPage = pathname === '/login';
    const isPublicAccess = pathname.startsWith('/access');

    // Skip proxy checks for API, static files, and public access pages
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
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

    // Single-owner mode hard-cut: block org-dependent pages until migrated.
    if (
        token &&
        SINGLE_OWNER_DISABLED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    ) {
        const targetUrl = new URL('/whiteboard-accounts', request.url);
        targetUrl.searchParams.set('notice', 'single-owner-mode');
        return NextResponse.redirect(targetUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
