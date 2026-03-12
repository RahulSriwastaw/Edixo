"use client";

import { Building2, SwitchCamera, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MockBookOrg {
  id: string;
  name: string;
  plan: string;
  status: string;
  students: number;
  mockTests: number;
  aiCredits?: number;
}

interface MockBookOrgBannerProps {
  org: MockBookOrg;
  onSwitch: () => void;
  onExit: () => void;
  children: React.ReactNode;
}

export function MockBookOrgBanner({ org, onSwitch, onExit, children }: MockBookOrgBannerProps) {
  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Orange Context Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{org.name}</span>
              <span className="text-white/70 text-sm font-mono">({org.id})</span>
            </div>
            <div className="text-xs text-white/80">
              Managing MockBook content
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSwitch}
            className="h-7 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
          >
            <SwitchCamera className="w-3.5 h-3.5 mr-1" />
            Switch Org
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExit}
            className="h-7 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Exit
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}
