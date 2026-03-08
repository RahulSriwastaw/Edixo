"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Download,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  CreditCard,
  Clock,
  Ban,
  Eye,
  Trash2,
  KeyRound,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : '';
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "badge-active",
    Trial: "badge-trial",
    Suspended: "badge-suspended",
    Expired: "badge-suspended",
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

// Plan Badge Component
function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    Small: "badge-small",
    Medium: "badge-medium",
    Large: "badge-large",
    Enterprise: "badge-enterprise",
  };
  return <span className={`badge ${styles[plan] || ""}`}>{plan}</span>;
}

export default function OrganizationsPage() {
    const { isOpen } = useSidebarStore();
const [organizations, setOrganizations] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [appTypeFilter, setAppTypeFilter] = useState("all");

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter.toUpperCase());
      if (planFilter !== 'all') params.append('plan', planFilter.toUpperCase());

      const res = await fetch(`${API_URL}/super-admin/organizations?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setOrganizations(json.data.orgs.map((o: any) => ({
          id: o.orgId,
          name: o.name,
          domain: o.city || 'N/A',
          appType: "BOTH", // Default for now
          plan: o.plan.charAt(0) + o.plan.slice(1).toLowerCase(),
          status: o.status.charAt(0) + o.status.slice(1).toLowerCase(),
          teachers: o.staffCount,
          students: o.studentCount,
          mrr: "₹0", // Calculation done on backend dashboard
          renewal: o.trialEndsAt ? new Date(o.trialEndsAt).toLocaleDateString() : 'N/A'
        })));
        setTotalCount(json.data.total);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, [page, limit, statusFilter, planFilter]);

  // Handle search with debounce or manual trigger
  const handleSearch = () => {
    setPage(1);
    fetchOrgs();
  };

  const allSelected = selectedOrgs.length === organizations.length && organizations.length > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedOrgs([]);
    } else {
      setSelectedOrgs(organizations.map((org) => org.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedOrgs.includes(id)) {
      setSelectedOrgs(selectedOrgs.filter((orgId) => orgId !== id));
    } else {
      setSelectedOrgs([...selectedOrgs, id]);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPlanFilter("all");
    setAppTypeFilter("all");
    setPage(1);
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || planFilter !== "all" || appTypeFilter !== "all";

  const filteredOrgs = organizations; // Already filtered by API

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Manage all organizations, plans and licensing
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{organizations.length} total</span>
                <Button variant="outline" className="btn-secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Link href="/organizations/new">
                  <Button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    New Organization
                  </Button>
                </Link>
              </div>
            </div>

            {/* Filter Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search organizations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 input-field"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px] input-field">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Trial">Trial</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger className="w-[130px] input-field">
                      <SelectValue placeholder="Plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Plans</SelectItem>
                      <SelectItem value="Small">Small</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Large">Large</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={appTypeFilter} onValueChange={setAppTypeFilter}>
                    <SelectTrigger className="w-[150px] input-field">
                      <SelectValue placeholder="App Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Apps</SelectItem>
                      <SelectItem value="STUDENT">Student App</SelectItem>
                      <SelectItem value="MOCKBOOK">MockBook</SelectItem>
                      <SelectItem value="BOTH">Both Apps</SelectItem>
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
            {selectedOrgs.length > 0 && (
              <div className="bg-brand-primary-tint border border-brand-primary/20 rounded-lg px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedOrgs.length} selected
                  </span>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                    <Ban className="w-4 h-4 mr-1" />
                    Suspend
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Organizations</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {selectedOrgs.length} organization(s)? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrgs([])}>
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            )}

            {/* Organizations Table */}
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
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Organization</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Unique Org ID</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">App Type</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Plan</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase text-center">Teachers</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase text-center">Students</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">MRR</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Renewal</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrgs.map((org) => (
                      <TableRow
                        key={org.id}
                        className={`hover:bg-brand-primary-tint ${selectedOrgs.includes(org.id) ? 'bg-brand-primary-tint' : ''}`}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedOrgs.includes(org.id)}
                            onCheckedChange={() => toggleSelect(org.id)}
                            aria-label={`Select ${org.name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gray-200 text-gray-600 text-sm font-medium">
                                {org.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">{org.name}</div>
                              <div className="text-xs text-gray-500">{org.domain}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="mono text-xs">{org.id}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-brand-primary">
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <AppTypeBadge type={org.appType} />
                        </TableCell>
                        <TableCell>
                          <PlanBadge plan={org.plan} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={org.status} />
                        </TableCell>
                        <TableCell className="text-center text-sm">{org.teachers}</TableCell>
                        <TableCell className="text-center text-sm">{org.students.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          <span className={org.status === 'Suspended' ? 'text-red-600' : ''}>{org.mrr}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs ${org.renewal === 'Feb 28, 2026' ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
                            {org.renewal}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/organizations/${org.id}`}>
                              <Button variant="ghost" size="sm" className="text-brand-primary hover:text-brand-primary-hover">
                                View
                              </Button>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem className="text-brand-primary">
                                  <Eye className="w-4 h-4 mr-2" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <KeyRound className="w-4 h-4 mr-2" /> Manage IDs
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <CreditCard className="w-4 h-4 mr-2" /> Change Plan
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Clock className="w-4 h-4 mr-2" /> Extend Trial
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <UserPlus className="w-4 h-4 mr-2" /> Impersonate Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-orange-600">
                                  <Ban className="w-4 h-4 mr-2" /> Suspend
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
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
                Showing 1–{filteredOrgs.length} of {organizations.length}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Prev
                </Button>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0 bg-brand-primary text-white hover:bg-brand-primary-hover">
                    1
                  </Button>
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                    2
                  </Button>
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                    3
                  </Button>
                </div>
                <Button variant="outline" size="sm">
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                <Select defaultValue="20">
                  <SelectTrigger className="w-[100px] input-field ml-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20 / page</SelectItem>
                    <SelectItem value="50">50 / page</SelectItem>
                    <SelectItem value="100">100 / page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
