"use client";

import { Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Organization {
  id: string;
  name: string;
  plan: string;
  status: string;
  students: number;
  mockTests: number;
}

interface MockBookOrgSwitcherProps {
  open: boolean;
  onSelect: (org: Organization) => void;
  onClose?: () => void;
  recentOrgs?: Organization[];
}

export function MockBookOrgSwitcher({ open, onClose }: MockBookOrgSwitcherProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && onClose) onClose();
    }}>
      <DialogContent className="sm:max-w-[500px] p-6 gap-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-600" />
            Organization Mode Disabled
          </DialogTitle>
          <DialogDescription>
            This workspace is running in single-owner mode. Org-based MockBook routes are disabled.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
          Continue with whiteboard-account workflows from the single-owner dashboard.
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={() => {
            if (onClose) onClose();
            router.push('/whiteboard-accounts');
          }}>
            Go to Whiteboard Accounts
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
