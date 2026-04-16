"use client";

import React, { createContext, useContext } from 'react';

interface OrgContextType {
    organizations: any[];
    selectedOrgId: string | null;
    setSelectedOrgId: (id: string | null) => void;
    isLoading: boolean;
    refreshOrganizations: () => Promise<void>;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: React.ReactNode }) {
    return (
        <OrgContext.Provider value={{ 
            organizations: [], 
            selectedOrgId: null, 
            setSelectedOrgId: () => {}, 
            isLoading: false,
            refreshOrganizations: async () => {}
        }}>
            {children}
        </OrgContext.Provider>
    );
}

export function useOrg() {
    const context = useContext(OrgContext);
    // Return a dummy context instead of throwing to prevent crashes in case some component still uses it
    return context || {
        organizations: [],
        selectedOrgId: null,
        setSelectedOrgId: () => {},
        isLoading: false,
        refreshOrganizations: async () => {}
    };
}
