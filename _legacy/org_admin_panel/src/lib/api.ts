/**
 * Shared API utility for org._admin_pannel frontend.
 * Attach token from cookies to requests going to eduhub-backend.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 
    (process.env.NODE_ENV === 'development'
        ? 'http://localhost:4000/api'
        : 'https://eduhub-backend.onrender.com/api');

function getToken(): string {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
    return match ? match[1] : '';
}

async function request<T = any>(method: string, path: string, body?: any): Promise<T> {
    const token = getToken();

    let url = `${BACKEND_URL}${path}`;
    if (typeof window === 'undefined' && url.includes('://localhost:')) {
        url = url.replace('://localhost:', '://127.0.0.1:');
    }

    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `API Error: ${res.status}`);
    }

    return res.json();
}

export const api = {
    get: <T = any>(path: string) => request<T>('GET', path),
    post: <T = any>(path: string, body?: any) => request<T>('POST', path, body),
    patch: <T = any>(path: string, body?: any) => request<T>('PATCH', path, body),
    delete: <T = any>(path: string) => request<T>('DELETE', path),
};

export { BACKEND_URL };
