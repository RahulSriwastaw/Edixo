"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface Organization {
  orgId: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
}

interface OrganizationContextType {
  org: Organization | null;
  loading: boolean;
  error: string | null;
}

const OrganizationContext = createContext<OrganizationContextType>({
  org: null,
  loading: true,
  error: null,
});

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    async function fetchOrg() {
      if (!ORG_ID) {
        setError("Missing NEXT_PUBLIC_ORG_ID environment variable");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/organizations/public/${ORG_ID}`);
        const data = await res.json();
        
        if (data.success) {
          setOrg(data.data);
          // Apply primary color to CSS variables if it exists
          if (data.data.primaryColor) {
            const hsl = hexToHsl(data.data.primaryColor);
            if (hsl) {
              document.documentElement.style.setProperty('--primary', hsl);
            }
          }
        } else {
          setError(data.message || "Failed to load organization data");
        }
      } catch (err) {
        setError("Network error loading organization");
      } finally {
        setLoading(false);
      }
    }

    fetchOrg();
  }, [ORG_ID, API_URL]);

  return (
    <OrganizationContext.Provider value={{ org, loading, error }}>
      {children}
    </OrganizationContext.Provider>
  );
}

function hexToHsl(hex: string): string | null {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  if (hex.length !== 6) return null;
  
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export const useOrganization = () => useContext(OrganizationContext);
