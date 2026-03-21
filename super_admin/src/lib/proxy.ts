import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/**
 * Extract token from request cookies header directly (no Next.js cookies() API needed).
 * Works in both Next.js 14 and 15 in route handlers.
 */
function getToken(req: NextRequest): string {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/(?:^|;\s*)sb_token=([^;]*)/);
    return match ? match[1] : '';
}

/**
 * Proxy a Next.js route request to the eduhub-backend.
 */
export async function proxyToBackend(req: NextRequest, backendPath: string): Promise<NextResponse> {
    const token = getToken(req);
    const url = `${BACKEND}${backendPath}${req.nextUrl.search}`;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined;

    try {
        const res = await fetch(url, { method: req.method, headers, body });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err) {
        console.error(`Proxy error for ${url}:`, err);
        return NextResponse.json({ success: false, error: 'Backend unavailable' }, { status: 503 });
    }
}
