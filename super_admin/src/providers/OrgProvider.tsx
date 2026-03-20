"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Organization {
    id: string;
    orgId: string;
    name: string;
    logoUrl?: string;
}

interface OrgContextType {
    organizations: Organization[];
    selectedOrgId: string | null;
    setSelectedOrgId: (id: string | null) => void;
    isLoading: boolean;
    refreshOrganizations: () => Promise<void>;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: React.ReactNode }) {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrganizations = async () => {
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/login')) {
            setIsLoading(false);
            return;
        }
        
        try {
            setIsLoading(true);
            const response = await api.get('/organizations');
            if (response.success) {
                setOrganizations(response.data.orgs);
                // Default to first org if none selected and orgs exist
                if (!selectedOrgId && response.data.orgs.length > 0) {
                    const savedOrg = localStorage.getItem('last_selected_org');
                    const exists = response.data.orgs.find((o: Organization) => o.orgId === savedOrg);
                    setSelectedOrgId(exists ? savedOrg : response.data.orgs[0].orgId);
                }
            }
        } catch (error: any) {
            if (error?.message !== 'No token provided') {
                console.error("Failed to fetch organizations:", error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, []);

    useEffect(() => {
        if (selectedOrgId) {
            localStorage.setItem('last_selected_org', selectedOrgId);
        }
    }, [selectedOrgId]);

    return (
        <OrgContext.Provider value={{ 
            organizations, 
            selectedOrgId, 
            setSelectedOrgId, 
            isLoading,
            refreshOrganizations: fetchOrganizations
        }}>
            {children}
        </OrgContext.Provider>
    );
}

export function useOrg() {
    const context = useContext(OrgContext);
    if (context === undefined) {
        throw new Error('useOrg must be used within an OrgProvider');
    }
    return context;
}
