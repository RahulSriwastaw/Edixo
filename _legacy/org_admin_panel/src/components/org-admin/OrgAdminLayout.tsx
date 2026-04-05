"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { Building2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrgSelectionModal } from "./OrgSelectionModal";

// Selected Organization type
export interface SelectedOrg {
  id: string;
  name: string;
  domain: string;
  plan: string;
  status: string;
  students: number;
  staff: number;
}

// Context for selected organization
interface OrgContextType {
  selectedOrg: SelectedOrg | null;
  setSelectedOrg: (org: SelectedOrg | null) => void;
  handleChangeOrg: () => void;
  handleExitOrg: () => void;
}

const OrgContext = createContext<OrgContextType | null>(null);

// Custom hook to use org context
export function useSelectedOrg() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error("useSelectedOrg must be used within OrgAdminLayout");
  }
  return context;
}

// Custom hook for localStorage with SSR support
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStoredValue(JSON.parse(item));
      }
    } catch {
      // Ignore errors
    }
  }, [key]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      // Ignore errors
    }
  };

  return [storedValue, setValue];
}

interface OrgAdminLayoutProps {
  children: ReactNode;
}

export function OrgAdminLayout({ children }: OrgAdminLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedOrg, setSelectedOrg] = useLocalStorage<SelectedOrg | null>("selectedOrg", null);
  const [showOrgSelector, setShowOrgSelector] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && selectedOrg) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowOrgSelector(false);
    }
  }, [mounted, selectedOrg]);

  const handleOrgSelect = (org: SelectedOrg) => {
    setSelectedOrg(org);
    setShowOrgSelector(false);
  };

  const handleChangeOrg = () => {
    setShowOrgSelector(true);
  };

  const handleExitOrg = () => {
    setSelectedOrg(null);
    setShowOrgSelector(true);
  };

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-neutral-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Show org selector modal
  if (showOrgSelector || !selectedOrg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Org Admin Panel</h1>
          <p className="text-gray-500 mt-1">Select an organization to manage</p>
        </div>
        <OrgSelectionModal open={showOrgSelector} onSelect={handleOrgSelect} />
      </div>
    );
  }

  return (
    <OrgContext.Provider value={{ selectedOrg, setSelectedOrg, handleChangeOrg, handleExitOrg }}>
      <div className="min-h-screen bg-neutral-bg">
        {/* Org Context Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 lg:px-6 py-2 sticky top-0 z-50">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5" />
              <div className="flex items-center gap-2">
                <span className="font-semibold">{selectedOrg.name}</span>
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 text-xs">
                  {selectedOrg.plan}
                </Badge>
                <span className="text-white/70 text-sm hidden sm:inline">• {selectedOrg.id}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleChangeOrg}
                className="text-white hover:bg-white/20 h-8"
              >
                <Building2 className="w-4 h-4 mr-1" />
                Switch Org
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExitOrg}
                className="text-white hover:bg-white/20 h-8"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Exit
              </Button>
            </div>
          </div>
        </div>
        {children}
      </div>
    </OrgContext.Provider>
  );
}
