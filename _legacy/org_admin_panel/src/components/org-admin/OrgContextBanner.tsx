"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { Building2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export interface SelectedOrg {
  id: string;
  name: string;
  domain: string;
  plan: string;
  status: string;
  students: number;
  staff: number;
}

interface OrgContextType {
  selectedOrg: SelectedOrg | null;
  handleChangeOrg: () => void;
  handleExitOrg: () => void;
}

const OrgContext = createContext<OrgContextType | null>(null);

export function useOrgContext() {
  const context = useContext(OrgContext);
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

interface OrgContextBannerProps {
  children: ReactNode;
}

export function OrgContextBanner({ children }: OrgContextBannerProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedOrg, setSelectedOrg] = useLocalStorage<SelectedOrg | null>("selectedOrg", null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleChangeOrg = () => {
    setSelectedOrg(null);
    router.push("/org-admin");
  };

  const handleExitOrg = () => {
    setSelectedOrg(null);
    router.push("/org-admin");
  };

  // Don't show banner during SSR or if no org selected
  if (!mounted || !selectedOrg) {
    return (
      <OrgContext.Provider value={{ selectedOrg: null, handleChangeOrg, handleExitOrg }}>
        {children}
      </OrgContext.Provider>
    );
  }

  return (
    <OrgContext.Provider value={{ selectedOrg, handleChangeOrg, handleExitOrg }}>
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
              Switch
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
    </OrgContext.Provider>
  );
}
