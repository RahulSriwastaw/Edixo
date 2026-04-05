"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Building2,
  Hash,
  ArrowRight,
  X,
  Check,
  Users,
  GraduationCap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock organizations data
const organizations = [
  {
    id: "GK-ORG-00142",
    name: "Apex Academy",
    domain: "apex-academy.com",
    plan: "Medium",
    status: "Active",
    students: 847,
    staff: 24,
    logo: null,
  },
  {
    id: "GK-ORG-00141",
    name: "Brilliant Coaching",
    domain: "brilliantcoaching.in",
    plan: "Small",
    status: "Trial",
    students: 324,
    staff: 12,
    logo: null,
  },
  {
    id: "GK-ORG-00140",
    name: "Excel Institute",
    domain: "excelinstitute.edu",
    plan: "Large",
    status: "Active",
    students: 1520,
    staff: 45,
    logo: null,
  },
  {
    id: "GK-ORG-00139",
    name: "Success Classes",
    domain: "successclasses.com",
    plan: "Medium",
    status: "Active",
    students: 678,
    staff: 18,
    logo: null,
  },
  {
    id: "GK-ORG-00138",
    name: "Vision Academy",
    domain: "visionacademy.in",
    plan: "Small",
    status: "Suspended",
    students: 156,
    staff: 8,
    logo: null,
  },
  {
    id: "GK-ORG-00137",
    name: "Rise Learning Center",
    domain: "riselearning.com",
    plan: "Enterprise",
    status: "Active",
    students: 2340,
    staff: 67,
    logo: null,
  },
  {
    id: "GK-ORG-00136",
    name: "Bright Future Institute",
    domain: "brightfuture.edu",
    plan: "Medium",
    status: "Active",
    students: 456,
    staff: 15,
    logo: null,
  },
  {
    id: "GK-ORG-00135",
    name: "Knowledge Park",
    domain: "knowledgepark.in",
    plan: "Small",
    status: "Trial",
    students: 234,
    staff: 9,
    logo: null,
  },
];

interface OrgSelectionModalProps {
  open: boolean;
  onSelect: (org: typeof organizations[0]) => void;
}

const getPlanBadgeStyle = (plan: string) => {
  const styles: Record<string, string> = {
    Small: "bg-blue-100 text-blue-700",
    Medium: "bg-orange-100 text-orange-700",
    Large: "bg-green-100 text-green-700",
    Enterprise: "bg-purple-100 text-purple-700",
  };
  return styles[plan] || "bg-gray-100 text-gray-700";
};

const getStatusBadgeStyle = (status: string) => {
  const styles: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    Trial: "bg-yellow-100 text-yellow-700",
    Suspended: "bg-red-100 text-red-700",
  };
  return styles[status] || "bg-gray-100 text-gray-700";
};

// Inner component that handles all the state - will remount when key changes
function OrgSelectorContent({ onSelect }: { onSelect: (org: typeof organizations[0]) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [idInput, setIdInput] = useState("");
  const [activeTab, setActiveTab] = useState("name");
  const [selectedOrg, setSelectedOrg] = useState<typeof organizations[0] | null>(null);

  // Filter organizations by name
  const filteredOrgs = useMemo(() => {
    if (!searchQuery.trim()) return organizations;
    const query = searchQuery.toLowerCase();
    return organizations.filter(
      (org) =>
        org.name.toLowerCase().includes(query) ||
        org.domain.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Find organization by ID
  const orgById = useMemo(() => {
    if (!idInput.trim()) return null;
    return organizations.find(
      (org) => org.id.toLowerCase() === idInput.trim().toLowerCase()
    );
  }, [idInput]);

  const handleSelectOrg = (org: typeof organizations[0]) => {
    setSelectedOrg(org);
  };

  const handleConfirmSelection = () => {
    if (selectedOrg) {
      onSelect(selectedOrg);
    }
  };

  const handleIdEnter = () => {
    if (orgById) {
      setSelectedOrg(orgById);
    }
  };

  return (
    <>
      <DialogHeader className="p-6 pb-0">
        <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-orange-600" />
          Select Organization
        </DialogTitle>
        <DialogDescription className="text-gray-500">
          Choose an organization to manage as Org Admin. You can search by name or enter the Organization ID directly.
        </DialogDescription>
      </DialogHeader>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="name" className="gap-2">
              <Search className="w-4 h-4" />
              Search by Name
            </TabsTrigger>
            <TabsTrigger value="id" className="gap-2">
              <Hash className="w-4 h-4" />
              Enter by ID
            </TabsTrigger>
          </TabsList>

          {/* Search by Name Tab */}
          <TabsContent value="name" className="mt-0">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search organization by name or domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            <ScrollArea className="h-[320px] rounded-lg border">
              <div className="p-2 space-y-1">
                {filteredOrgs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p>No organizations found</p>
                  </div>
                ) : (
                  filteredOrgs.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => handleSelectOrg(org)}
                      className={`w-full text-left p-3 rounded-lg transition-all hover:bg-orange-50 ${
                        selectedOrg?.id === org.id
                          ? "bg-orange-50 border-2 border-orange-500"
                          : "border-2 border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white font-semibold">
                            {org.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 truncate">
                              {org.name}
                            </span>
                            {selectedOrg?.id === org.id && (
                              <Check className="w-4 h-4 text-orange-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 mono">{org.id}</span>
                            <span className="text-xs text-gray-300">•</span>
                            <span className="text-xs text-gray-500">{org.domain}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <Badge className={getPlanBadgeStyle(org.plan)} variant="secondary">
                            {org.plan}
                          </Badge>
                          <Badge className={getStatusBadgeStyle(org.status)} variant="secondary">
                            {org.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <GraduationCap className="w-3 h-3" />
                          {org.students.toLocaleString()} students
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="w-3 h-3" />
                          {org.staff} staff
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Enter by ID Tab */}
          <TabsContent value="id" className="mt-0">
            <div className="space-y-4">
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Enter Organization ID (e.g., GK-ORG-00142)"
                  value={idInput}
                  onChange={(e) => setIdInput(e.target.value.toUpperCase())}
                  className="pl-10 h-11 font-mono uppercase"
                />
              </div>

              {idInput && !orgById && (
                <div className="text-center py-4 text-red-500 bg-red-50 rounded-lg">
                  <X className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">Organization not found</p>
                  <p className="text-sm text-gray-500">Please check the ID and try again</p>
                </div>
              )}

              {orgById && (
                <div
                  onClick={() => handleSelectOrg(orgById)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedOrg?.id === orgById.id
                      ? "bg-orange-50 border-orange-500"
                      : "bg-gray-50 border-gray-200 hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white font-semibold text-lg">
                        {orgById.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-lg">{orgById.name}</span>
                        {selectedOrg?.id === orgById.id && (
                          <Check className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500 mono">{orgById.id}</span>
                        <span className="text-sm text-gray-300">•</span>
                        <span className="text-sm text-gray-500">{orgById.domain}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={getPlanBadgeStyle(orgById.plan)} variant="secondary">
                        {orgById.plan}
                      </Badge>
                      <Badge className={getStatusBadgeStyle(orgById.status)} variant="secondary">
                        {orgById.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <GraduationCap className="w-4 h-4" />
                      {orgById.students.toLocaleString()} students
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      {orgById.staff} staff
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleIdEnter}
                disabled={!orgById}
                className="w-full h-11"
                variant={orgById ? "default" : "outline"}
              >
                {orgById ? "Select this Organization" : "Enter an ID to find organization"}
              </Button>
            </div>

            {/* Recent IDs */}
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-2">Recent IDs:</p>
              <div className="flex flex-wrap gap-2">
                {organizations.slice(0, 4).map((org) => (
                  <button
                    key={org.id}
                    onClick={() => setIdInput(org.id)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-orange-100 rounded-full text-xs font-mono text-gray-700 hover:text-orange-700 transition-colors"
                  >
                    {org.id}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="text-sm text-gray-500">
            {selectedOrg ? (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                Selected: <strong className="text-gray-900">{selectedOrg.name}</strong>
              </span>
            ) : (
              "Select an organization to continue"
            )}
          </div>
          <Button
            onClick={handleConfirmSelection}
            disabled={!selectedOrg}
            className="btn-primary h-10 px-6"
          >
            Enter Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </>
  );
}

export function OrgSelectionModal({ open, onSelect }: OrgSelectionModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0" onPointerDownOutside={(e) => e.preventDefault()}>
        {/* Key changes when open changes, causing component to remount and reset state */}
        <OrgSelectorContent key={open ? "open" : "closed"} onSelect={onSelect} />
      </DialogContent>
    </Dialog>
  );
}
