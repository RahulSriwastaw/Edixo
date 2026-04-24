export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'development'
    ? "http://localhost:4000/api"
    : "https://eduhub-backend.onrender.com/api");

// Helper to get cookies in browser
export const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null;
  return null;
};

/** Returns true if a valid token cookie exists */
export const isAuthenticated = () => {
  const token = getCookie('token');
  return !!token && token.length > 10;
};

/** Authorized API fetch — throws if unauthorized or request fails */
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getCookie('token');

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  } else if (options.method && options.method.toUpperCase() !== 'GET') {
    // Warn for write operations without a token — auth middleware will reject them anyway
    console.warn(`[apiFetch] No auth token found for ${options.method} ${endpoint}`);
  }

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  // Fix Node.js 18+ failing to resolve localhost (prefers IPv6 ::1, but server listens on IPv4)
  if (typeof window === 'undefined' && url.includes('://localhost:')) {
    url = url.replace('://localhost:', '://127.0.0.1:');
  }

  const res = await fetch(url, { ...options, headers, credentials: 'include' });

  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server returned non-JSON response (status ${res.status})`);
  }

  if (!res.ok) {
    const msg = data?.message || `Request failed with status ${res.status}`;
    throw new Error(msg);
  }
  return data;
};
