import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:4000/api';

function getToken(req: NextRequest): string {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/(?:^|;\s*)token=([^;]*)/);
    return match ? match[1] : '';
}

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
