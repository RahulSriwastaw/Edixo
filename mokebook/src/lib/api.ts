export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? "http://localhost:4000/api"
    : "https://eduhub-backend.onrender.com/api");
export const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "GK-ORG-00001";

// Helper to get cookies in browser
export const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

// Helper for authorized API calls
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getCookie('token');
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // For GET requests, we can append orgId to URL if not present. 
  // For now, passing X-Org-Id header is cleaner if backend supports it.
  headers.set('X-Org-Id', ORG_ID);

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'API Error');
  }
  return data;
};
