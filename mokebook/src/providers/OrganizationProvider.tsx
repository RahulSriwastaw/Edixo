"use client";

import React, { createContext, useContext } from "react";

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
  // Single Owner Context: Static Information
  const staticOrg: Organization = {
    orgId: "demo-org",
    name: "EduHub Student App",
    logoUrl: "",
    primaryColor: "#6366f1"
  };

  return (
    <OrganizationContext.Provider value={{ org: staticOrg, loading: false, error: null }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export const useOrganization = () => useContext(OrganizationContext);
