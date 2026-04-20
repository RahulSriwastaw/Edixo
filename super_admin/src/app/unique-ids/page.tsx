"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Copy,
  MoreHorizontal,
  Eye,
  RotateCcw,
  Ban,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Fingerprint,
  Users,
  GraduationCap,
  Building2,
  Download,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";

// Mock Unique IDs data
const uniqueIDs = [
  {
    id: "GK-TCH-00892",
    type: "Teacher",
    name: "Rajesh Kumar",
    orgId: "GK-ORG-00142",
    organization: "Apex Academy",
    appType: "BOTH",
    status: "Active",
    createdAt: "Feb 15, 2026",
    lastUsed: "5 min ago",
  },
  {
    id: "GK-TCH-00765",
    type: "Teacher",
    name: "Amit Verma",
    orgId: "GK-ORG-00140",
    organization: "Excel Institute",
    appType: "BOTH",
    status: "Active",
    createdAt: "Feb 10, 2026",
    lastUsed: "2 hours ago",
  },
  {
    id: "GK-TCH-00543",
    type: "Teacher",
    name: "Neha Gupta",
    orgId: "GK-ORG-00139",
    organization: "Success Classes",
    appType: "MOCKBOOK",
    status: "Active",
    createdAt: "Jan 28, 2026",
    lastUsed: "3 days ago",
  },
  {
    id: "GK-TCH-00421",
    type: "Teacher",
    name: "Suresh Patel",
    orgId: "GK-ORG-00136",
    organization: "Knowledge Park",
    appType: "BOTH",
    status: "Suspended",
    createdAt: "Jan 15, 2026",
    lastUsed: "1 week ago",
  },
  {
    id: "GK-PUB-00123",
    type: "Public",
    name: "Demo Session",
    orgId: null,
    organization: "Public Access",
    appType: "BOTH",
    status: "Active",
    createdAt: "Mar 01, 2026",
    lastUsed: "1 hour ago",
  },
  {
    id: "GK-TCH-00389",
    type: "Teacher",
    name: "Priya Sharma",
    orgId: "GK-ORG-00137",
    organization: "Prime Tutorials",
    appType: "STUDENT",
    status: "Active",
    createdAt: "Jan 05, 2026",
    lastUsed: "4 hours ago",
  },
  {
    id: "GK-TCH-00256",
    type: "Teacher",
    name: "Vikram Singh",
    orgId: "GK-ORG-00142",
    organization: "Apex Academy",
    appType: "BOTH",
    status: "Revoked",
    createdAt: "Dec 20, 2025",
    lastUsed: "Jan 10, 2026",
  },
  {
    id: "GK-PUB-00098",
    type: "Public",
    name: "Guest Lecture",
    orgId: null,
    organization: "Public Access",
    appType: "STUDENT",
    status: "Expired",
    createdAt: "Feb 20, 2026",
    lastUsed: "Feb 25, 2026",
  },
];

// Stats data
const stats = [
  { label: "Total IDs Issued", value: "1,247", icon: Fingerprint, color: "blue" },
  { label: "Teacher IDs", value: "1,089", icon: Users, color: "purple" },
  { label: "Public IDs", value: "158", icon: GraduationCap, color: "green" },
  { label: "Active Today", value: "892", icon: Building2, color: "orange" },
];

// Type Badge Component
function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    Teacher: "bg-purple-50 text-purple-700",
    Public: "bg-blue-50 text-blue-700",
    Student: "bg-green-50 text-green-700",
  };
  return <span className={`badge ${styles[type] || ""}`}>{type}</span>;
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "badge-active",
    Suspended: "badge-suspended",
    Revoked: "bg-red-100 text-red-700",
    Expired: "bg-gray-100 text-gray-600",
  };
  return <span className={`badge ${styles[status] || ""}`}>{status}</span>;
}

// App Type Badge Component
function AppTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    STUDENT: "badge-student",
    MOCKBOOK: "badge-mockbook",
    BOTH: "badge-both",
  };
  return <span className={`badge ${styles[type] || ""}`}>{type}</span>;
}

const getIconBgColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    orange: "bg-orange-50",
    purple: "bg-purple-50",
  };
  return colors[color] || "bg-gray-50";
};

const getIconColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    orange: "text-orange-600",
    purple: "text-purple-600",
  };
  return colors[color] || "text-gray-600";
};

export default function UniqueIDsPage() {
    const { isOpen } = useSidebarStore();
const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orgFilter, setOrgFilter] = useState("all");
  const [selectedIDs, setSelectedIDs] = useState<string[]>([]);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

  // Form state for generation
  const [idType, setIdType] = useState("Teacher");
  const [selectedOrg, setSelectedOrg] = useState("");
  const [personName, setPersonName] = useState("");
  const [appType, setAppType] = useState("BOTH");

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setStatusFilter("all");
    setOrgFilter("all");
  };

  const hasActiveFilters = searchQuery || typeFilter !== "all" || statusFilter !== "all" || orgFilter !== "all";

  // Get unique organizations for filter
  const organizations = [...new Set(uniqueIDs.filter(u => u.organization !== "Public Access").map(u => u.organization))];

  // Filter IDs
  const filteredIDs = uniqueIDs.filter((id) => {
    const matchesSearch = id.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      id.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      id.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || id.type === typeFilter;
    const matchesStatus = statusFilter === "all" || id.status === statusFilter;
    const matchesOrg = orgFilter === "all" || 
      (orgFilter === "public" ? id.organization === "Public Access" : id.organization === orgFilter);
    return matchesSearch && matchesType && matchesStatus && matchesOrg;
  });

  const allSelected = selectedIDs.length === filteredIDs.length;
  
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIDs([]);
    } else {
      setSelectedIDs(filteredIDs.map((id) => id.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIDs.includes(id)) {
      setSelectedIDs(selectedIDs.filter((i) => i !== id));
    } else {
      setSelectedIDs([...selectedIDs, id]);
    }
  };

  const handleCopyID = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success(`Copied ${id} to clipboard`);
  };

  const handleGenerate = () => {
    if (!selectedOrg && idType === "Teacher") {
      toast.error("Please select an organization");
      return;
    }
    if (!personName) {
      toast.error("Please enter a name");
      return;
    }
    // Generate mock ID
    const newId = `GK-TCH-${String(Math.floor(Math.random() * 90000) + 10000)}`;
    toast.success(`Generated new ID: ${newId}`);
    setGenerateDialogOpen(false);
    setPersonName("");
    setSelectedOrg("");
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Unique IDs</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Generate and manage teacher and public access IDs
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="btn-secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Generate ID
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Generate Unique ID</DialogTitle>
                      <DialogDescription>
                        Create a new unique ID for teacher or public access
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>ID Type</Label>
                        <Select value={idType} onValueChange={setIdType}>
                          <SelectTrigger className="input-field">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Teacher">Teacher ID</SelectItem>
                            <SelectItem value="Public">Public Access ID</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {idType === "Teacher" && (
                        <div className="space-y-2">
                          <Label>Organization</Label>
                          <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                            <SelectTrigger className="input-field">
                              <SelectValue placeholder="Select organization" />
                            </SelectTrigger>
                            <SelectContent>
                              {organizations.map((org) => (
                                <SelectItem key={org} value={org}>{org}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={personName}
                          onChange={(e) => setPersonName(e.target.value)}
                          placeholder="Enter name"
                          className="input-field"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>App Access</Label>
                        <Select value={appType} onValueChange={setAppType}>
                          <SelectTrigger className="input-field">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STUDENT">Student App Only</SelectItem>
                            <SelectItem value="MOCKBOOK">MockBook Only</SelectItem>
                            <SelectItem value="BOTH">Both Apps</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button className="btn-primary" onClick={handleGenerate}>
                        Generate ID
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="kpi-card">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-full ${getIconBgColor(stat.color)} flex items-center justify-center shrink-0`}>
                          <Icon className={`w-5 h-5 ${getIconColor(stat.color)}`} />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {stat.label}
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {stat.value}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Filter Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by ID, name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 input-field"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[130px] input-field">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Teacher">Teacher</SelectItem>
                      <SelectItem value="Public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px] input-field">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="Revoked">Revoked</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={orgFilter} onValueChange={setOrgFilter}>
                    <SelectTrigger className="w-[180px] input-field">
                      <SelectValue placeholder="Organization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Organizations</SelectItem>
                      <SelectItem value="public">Public Access</SelectItem>
                      {organizations.map((org) => (
                        <SelectItem key={org} value={org}>{org}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters} className="btn-ghost">
                      <X className="w-4 h-4 mr-1" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bulk Action Bar */}
            {selectedIDs.length > 0 && (
              <div className="bg-brand-primary-tint border border-brand-primary/20 rounded-lg px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedIDs.length} selected
                  </span>
                  <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                    <Ban className="w-4 h-4 mr-1" />
                    Suspend
                  </Button>
                  <Button variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reactivate
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Revoke
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedIDs([])}>
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            )}

            {/* IDs Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Unique ID</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Type</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Name</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Organization</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">App Type</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Created</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Last Used</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIDs.map((id) => (
                      <TableRow
                        key={id.id}
                        className={`hover:bg-brand-primary-tint ${selectedIDs.includes(id.id) ? 'bg-brand-primary-tint' : ''}`}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIDs.includes(id.id)}
                            onCheckedChange={() => toggleSelect(id.id)}
                            aria-label={`Select ${id.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="mono text-xs">{id.id}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-gray-400 hover:text-brand-primary"
                              onClick={() => handleCopyID(id.id)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <TypeBadge type={id.type} />
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">{id.name}</TableCell>
                        <TableCell>
                          {id.orgId ? (
                            <Link
                              href={`/organizations/${id.orgId}`}
                              className="text-sm text-gray-700 hover:text-brand-primary"
                            >
                              {id.organization}
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-500">{id.organization}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <AppTypeBadge type={id.appType} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={id.status} />
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">{id.createdAt}</TableCell>
                        <TableCell className="text-sm text-gray-500">{id.lastUsed}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopyID(id.id)}>
                                <Copy className="w-4 h-4 mr-2" /> Copy ID
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {id.status === "Active" ? (
                                <DropdownMenuItem className="text-orange-600">
                                  <Ban className="w-4 h-4 mr-2" /> Suspend
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem className="text-green-600">
                                  <RotateCcw className="w-4 h-4 mr-2" /> Reactivate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" /> Revoke
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing 1–{filteredIDs.length} of {uniqueIDs.length}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Prev
                </Button>
                <Button variant="outline" size="sm">
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
