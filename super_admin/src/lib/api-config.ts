"use client";

/**
 * Centralized API configuration for the Super Admin panel.
 * Handles production and development environments gracefully.
 */

// Use the environment variable if defined, otherwise fallback to a smart default.
const getBaseUrl = () => {
  // 1. Explicitly defined NEXT_PUBLIC_API_URL has highest precedence
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // 2. Client-side detection (smart fallback)
  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    
    // If we're on localhost, assume the backend is also on localhost:4000
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `http://${hostname}:4000/api`;
    }
    
    // If we're on a production domain like superadmin.mockveda.com,
    // we can try to infer the API domain. 
    // Usually it's either api.maindomain.com or something similar.
    // However, since we don't know the exact pattern, we'll log a warning.
    console.warn("NEXT_PUBLIC_API_URL is not set. Falling back to default.");
  }

  // 3. Last resort default
  return "https://eduhub-backend.onrender.com/api"; // Replace with your production URL if known
};

export const API_URL = getBaseUrl();

/**
 * Helper to get authentication headers from cookies.
 */
export const getAuthHeaders = () => {
  if (typeof document === "undefined") return { "Content-Type": "application/json" };
  
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("sb_token="))
    ?.split("=")[1];

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
