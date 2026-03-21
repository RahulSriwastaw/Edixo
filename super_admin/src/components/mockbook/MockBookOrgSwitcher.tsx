"use client";

import { useState, useEffect, useMemo } from "react";
import { Building2, Search, Clock, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API_URL, getAuthHeaders } from "@/lib/api-config";

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

// The organizations list is now fetched from the API instead of hardcoded

export function MockBookOrgSwitcher({ open, onSelect, onClose, recentOrgs = [] }: MockBookOrgSwitcherProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  // getToken removed

  useEffect(() => {
    setMounted(true);
    fetchOrganizations();
  }, [open]); // Re-fetch when the switcher is opened just in case

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/super-admin/organizations?limit=100`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        // Map the API response to the required Organization interface format
        const mappedData = data.data.orgs.map((org: any) => ({
          id: org.orgId, // Use the human-readable orgId instead of the DB id!
          dbId: org.id, // Keep pure DB id if needed
          name: org.name,
          plan: org.plan || "SMALL",
          status: org.status || "ACTIVE",
          students: org.studentCount || 0,
          mockTests: 0 // Will need to adjust if testAttempts is available or use 0
        }));
        setOrganizations(mappedData);
      }
    } catch (err) {
      console.error("Failed to fetch mockbook orgs", err);
    }
    setLoading(false);
  };

  const filteredOrgs = useMemo(() => {
    if (!searchQuery) return organizations;
    const query = searchQuery.toLowerCase();
    return organizations.filter(
      (org) =>
        org.name?.toLowerCase().includes(query) ||
        org.id?.toLowerCase().includes(query)
    );
  }, [searchQuery, organizations]);

  const recentOrgIds = recentOrgs.map((org) => org.id);
  const otherOrgs = filteredOrgs.filter((org) => !recentOrgIds.includes(org.id));

  const handleSelect = (org: Organization) => {
    onSelect(org);
    setSearchQuery("");
  };

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && onClose) onClose();
    }}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0" onPointerDownOutside={(e) => {
        // Only prevent default if we want to force explicit selection, but user asked for close button to work
        // Removing preventDefault allows clicking outside to close
      }}>
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-600" />
            Select Organization
          </DialogTitle>
          <DialogDescription>
            Choose an organization to manage their MockBook content
          </DialogDescription>
        </DialogHeader>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 input-field"
              autoFocus
            />
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="px-4 pb-4">
            {/* Recently Accessed */}
            {recentOrgs.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Recently Accessed
                </div>
                <div className="space-y-1">
                  {recentOrgs.map((org) => (
                    <OrgListItem
                      key={org.id}
                      org={org}
                      isRecent
                      onClick={() => handleSelect(org)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Organizations */}
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                All Organizations ({filteredOrgs.length})
              </div>

              {loading ? (
                <div className="py-8 flex justify-center text-sm text-gray-500">Loading organizations...</div>
              ) : (
                <div className="space-y-1">
                  {(recentOrgs.length > 0 ? otherOrgs : filteredOrgs).map((org) => (
                    <OrgListItem
                      key={org.id}
                      org={org}
                      onClick={() => handleSelect(org)}
                    />
                  ))}
                  {filteredOrgs.length === 0 && !loading && (
                    <div className="py-4 text-center text-sm text-gray-500">No organizations found.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function OrgListItem({
  org,
  isRecent = false,
  onClick,
}: {
  org: Organization;
  isRecent?: boolean;
  onClick: () => void;
}) {
  const planStyles: Record<string, string> = {
    Small: "bg-blue-50 text-blue-700",
    Medium: "bg-orange-50 text-orange-700",
    Large: "bg-green-50 text-green-700",
    Enterprise: "bg-purple-50 text-purple-700",
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors text-left group"
    >
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
        {org.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 truncate">{org.name}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${planStyles[org.plan] || "bg-gray-50 text-gray-700"}`}>
            {org.plan?.toLowerCase() || 'Small'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
          <span className="font-mono">{org.id}</span>
          <span>{org.students} students</span>
          <span>{org.mockTests} tests</span>
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
          <Check className="w-4 h-4 text-orange-600" />
        </div>
      </div>
    </button>
  );
}
