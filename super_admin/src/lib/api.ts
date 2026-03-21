/**
 * Shared API utility for super_admin frontend.
 * Attach token from cookies to requests going to eduhub-backend.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:4000/api'
        : 'https://eduhub-backend.onrender.com/api');

function getToken(): string {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(/(?:^|;\s*)sb_token=([^;]*)/);
    return match ? match[1] : '';
}

async function request<T = any>(method: string, path: string, options: { body?: any, params?: any } = {}): Promise<T> {
    const token = getToken();
    let url = `${BACKEND_URL}${path}`;

    if (options.params) {
        const query = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query.append(key, String(value));
            }
        });
        const queryString = query.toString();
        if (queryString) {
            url += (url.includes('?') ? '&' : '?') + queryString;
        }
    }

    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });

    if (res.status === 401 && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        document.cookie = "sb_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        window.location.href = '/login';
        throw new Error('Session expired. Redirecting...');
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.message || err.error || `API Error: ${res.status}`);
    }

    return res.json();
}

export const api = {
    get: <T = any>(path: string, options?: { params?: any }) => request<T>('GET', path, options),
    post: <T = any>(path: string, body?: any) => request<T>('POST', path, { body }),
    patch: <T = any>(path: string, body?: any) => request<T>('PATCH', path, { body }),
    delete: <T = any>(path: string) => request<T>('DELETE', path),
};

export { BACKEND_URL };
