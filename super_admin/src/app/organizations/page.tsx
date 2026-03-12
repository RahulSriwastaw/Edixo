"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, Plus, Download, MoreHorizontal, Copy, X,
  ChevronLeft, ChevronRight, UserPlus, CreditCard, Clock,
  Ban, Eye, Trash2, KeyRound, CheckCircle, Globe,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : "";
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    ACTIVE: "bg-green-100 text-green-700",
    Trial: "bg-blue-100 text-blue-700",
    TRIAL: "bg-blue-100 text-blue-700",
    Suspended: "bg-red-100 text-red-700",
    SUSPENDED: "bg-red-100 text-red-700",
    Expired: "bg-gray-100 text-gray-600",
    EXPIRED: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string, string> = {
    Small: "bg-gray-100 text-gray-700", SMALL: "bg-gray-100 text-gray-700",
    Medium: "bg-blue-100 text-blue-700", MEDIUM: "bg-blue-100 text-blue-700",
    Large: "bg-purple-100 text-purple-700", LARGE: "bg-purple-100 text-purple-700",
    Enterprise: "bg-orange-100 text-orange-700", ENTERPRISE: "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[plan] || "bg-gray-100 text-gray-600"}`}>
      {plan}
    </span>
  );
}

type ModalType = "change-plan" | "extend-trial" | "impersonate" | "suspend" | "activate" | "delete" | "edit-domain" | null;

export default function OrganizationsPage() {
  const { isOpen } = useSidebarStore();
  const router = useRouter();

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  // Modal state
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [targetOrg, setTargetOrg] = useState<any>(null);
  const [newPlan, setNewPlan] = useState("SMALL");
  const [billingCycle, setBillingCycle] = useState("MONTHLY");
  const [trialDays, setTrialDays] = useState(30);
  const [actionLoading, setActionLoading] = useState(false);
  const [editData, setEditData] = useState({
    subdomain: "",
    customDomain: "",
    displayName: "",
    primaryColor: "",
    logoUrl: "",
  });

  const totalPages = Math.ceil(totalCount / limit);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter.toUpperCase());
      if (planFilter !== "all") params.append("plan", planFilter.toUpperCase());

      const res = await fetch(`${API_URL}/super-admin/organizations?${params}`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        setOrganizations(
          json.data.orgs.map((o: any) => ({
            id: o.orgId,
            dbId: o.id,
            name: o.name,
            city: o.city || "N/A",
            plan: o.plan,
            status: o.status,
            teachers: o.staffCount,
            students: o.studentCount,
            renewal: o.trialEndsAt ? new Date(o.trialEndsAt).toLocaleDateString() : "N/A",
            subdomain: o.subdomain || "",
            customDomain: o.customDomain || "",
            displayName: o.displayName || o.name || "",
            primaryColor: o.primaryColor || "#F4511E",
            logoUrl: o.logoUrl || "",
          }))
        );
        setTotalCount(json.data.total);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, [page, statusFilter, planFilter]);

  // Search with debounce
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchOrgs(); }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const openModal = (type: ModalType, org: any) => {
    setTargetOrg(org);
    setNewPlan(org.plan || "SMALL");
    setBillingCycle("MONTHLY");
    setTrialDays(30);
    setEditData({
      subdomain: org.subdomain || "",
      customDomain: org.customDomain || "",
      displayName: org.displayName || org.name || "",
      primaryColor: org.primaryColor || "#F4511E",
      logoUrl: org.logoUrl || "",
    });
    setActiveModal(type);
  };
  const closeModal = () => { setActiveModal(null); setTargetOrg(null); };

  // ── Actions ──────────────────────────────────────
  async function callAPI(path: string, method: string, body?: object) {
    const res = await fetch(`${API_URL}/super-admin/organizations/${path}`, {
      method,
      headers: authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  }

  const handleChangePlan = async () => {
    if (!targetOrg) return;
    setActionLoading(true);
    try {
      await callAPI(`${targetOrg.id}/plan`, "PATCH", { plan: newPlan, billingCycle });
      toast.success(`Plan changed to ${newPlan}`);
      closeModal();
      fetchOrgs();
    } catch (e: any) { toast.error(e.message); }
    finally { setActionLoading(false); }
  };

  const handleExtendTrial = async () => {
    if (!targetOrg) return;
    setActionLoading(true);
    try {
      await callAPI(`${targetOrg.id}/extend-trial`, "PATCH", { days: Number(trialDays) });
      toast.success(`Trial extended by ${trialDays} days`);
      closeModal();
      fetchOrgs();
    } catch (e: any) { toast.error(e.message); }
    finally { setActionLoading(false); }
  };

  const handleStatusChange = async (newStatus: "ACTIVE" | "SUSPENDED") => {
    if (!targetOrg) return;
    setActionLoading(true);
    try {
      await callAPI(`${targetOrg.id}/status`, "PATCH", { status: newStatus });
      toast.success(newStatus === "SUSPENDED" ? `${targetOrg.name} suspended` : `${targetOrg.name} activated`);
      closeModal();
      fetchOrgs();
    } catch (e: any) { toast.error(e.message); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!targetOrg) return;
    setActionLoading(true);
    try {
      await callAPI(`${targetOrg.id}`, "DELETE");
      toast.success(`${targetOrg.name} deleted`);
      closeModal();
      fetchOrgs();
    } catch (e: any) { toast.error(e.message); }
    finally { setActionLoading(false); }
  };

  const handleUpdateOrg = async (fields: any) => {
    if (!targetOrg) return;
    setActionLoading(true);
    try {
      await callAPI(`${targetOrg.id}`, "PATCH", fields);
      toast.success("Organization updated");
      closeModal();
      fetchOrgs();
    } catch (e: any) { toast.error(e.message); }
    finally { setActionLoading(false); }
  };

  const handleImpersonate = () => {
    toast.success(`Logged in as admin of ${targetOrg?.name}`);
    closeModal();
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Org ID copied!");
  };

  // Bulk actions
  const handleBulkSuspend = async () => {
    for (const id of selectedOrgs) {
      await callAPI(`${id}/status`, "PATCH", { status: "SUSPENDED" }).catch(() => { });
    }
    toast.success(`${selectedOrgs.length} organizations suspended`);
    setSelectedOrgs([]);
    fetchOrgs();
  };

  const handleBulkDelete = async () => {
    for (const id of selectedOrgs) {
      await callAPI(`${id}`, "DELETE").catch(() => { });
    }
    toast.success(`${selectedOrgs.length} organizations deleted`);
    setSelectedOrgs([]);
    fetchOrgs();
  };

  const allSelected = selectedOrgs.length === organizations.length && organizations.length > 0;
  const toggleSelectAll = () => setSelectedOrgs(allSelected ? [] : organizations.map((o) => o.id));
  const toggleSelect = (id: string) =>
    setSelectedOrgs((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const hasFilters = searchQuery || statusFilter !== "all" || planFilter !== "all";

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
                <p className="text-gray-500 text-sm mt-1">Manage all organizations, plans and licensing</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{totalCount} total</span>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>
                <Link href="/organizations/new">
                  <Button className="bg-[#F4511E] hover:bg-[#E64A19] text-white">
                    <Plus className="w-4 h-4 mr-2" /> New Organization
                  </Button>
                </Link>
              </div>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px] max-w-[320px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search organizations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="TRIAL">Trial</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                      <SelectItem value="EXPIRED">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={planFilter} onValueChange={(v) => { setPlanFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Plans" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Plans</SelectItem>
                      <SelectItem value="SMALL">Small</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LARGE">Large</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                  {hasFilters && (
                    <Button variant="ghost" onClick={() => { setSearchQuery(""); setStatusFilter("all"); setPlanFilter("all"); setPage(1); }}>
                      <X className="w-4 h-4 mr-1" /> Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bulk Action Bar */}
            {selectedOrgs.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">{selectedOrgs.length} selected</span>
                  <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50" onClick={handleBulkSuspend}>
                    <Ban className="w-4 h-4 mr-1" /> Suspend All
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleBulkDelete}>
                    <Trash2 className="w-4 h-4 mr-1" /> Delete All
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrgs([])}>
                  <X className="w-4 h-4 mr-1" /> Clear
                </Button>
              </div>
            )}

            {/* Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="w-12">
                        <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} aria-label="Select all" />
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Organization</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Unique Org ID</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Plan</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase text-center">Teachers</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase text-center">Students</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Renewal</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F4511E] mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : organizations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                          No organizations found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      organizations.map((org) => (
                        <TableRow
                          key={org.id}
                          className={`hover:bg-orange-50/30 ${selectedOrgs.includes(org.id) ? "bg-orange-50/40" : ""}`}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedOrgs.includes(org.id)}
                              onCheckedChange={() => toggleSelect(org.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-gray-200 text-gray-600 text-sm font-medium">
                                  {org.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-gray-900">{org.name}</div>
                                <div className="text-xs text-gray-500">{org.city}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-gray-700">{org.id}</span>
                              <Button
                                variant="ghost" size="icon"
                                className="h-6 w-6 text-gray-400 hover:text-[#F4511E]"
                                onClick={() => handleCopyId(org.id)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell><PlanBadge plan={org.plan} /></TableCell>
                          <TableCell><StatusBadge status={org.status} /></TableCell>
                          <TableCell className="text-center text-sm">{org.teachers}</TableCell>
                          <TableCell className="text-center text-sm">{org.students?.toLocaleString()}</TableCell>
                          <TableCell className="text-xs text-gray-500">{org.renewal}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link href={`/organizations/${org.id}`}>
                                <Button variant="ghost" size="sm" className="text-[#F4511E] hover:text-[#E64A19]">
                                  View
                                </Button>
                              </Link>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52 bg-white shadow-lg border">
                                  <DropdownMenuItem
                                    className="text-[#F4511E] cursor-pointer"
                                    onClick={() => router.push(`/organizations/${org.id}`)}
                                  >
                                    <Eye className="w-4 h-4 mr-2" /> View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => router.push(`/organizations/${org.id}?tab=unique-ids`)}
                                  >
                                    <KeyRound className="w-4 h-4 mr-2" /> Manage IDs
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => openModal("edit-domain", org)}
                                  >
                                    <Globe className="w-4 h-4 mr-2" /> Domain & Branding
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => openModal("change-plan", org)}
                                  >
                                    <CreditCard className="w-4 h-4 mr-2" /> Change Plan
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => openModal("extend-trial", org)}
                                  >
                                    <Clock className="w-4 h-4 mr-2" /> Extend Trial
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => openModal("impersonate", org)}
                                  >
                                    <UserPlus className="w-4 h-4 mr-2" /> Impersonate Admin
                                  </DropdownMenuItem>
                                  {org.status === "SUSPENDED" ? (
                                    <DropdownMenuItem
                                      className="text-green-600 cursor-pointer"
                                      onClick={() => openModal("activate", org)}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" /> Activate
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      className="text-orange-600 cursor-pointer"
                                      onClick={() => openModal("suspend", org)}
                                    >
                                      <Ban className="w-4 h-4 mr-2" /> Suspend
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    className="text-red-600 cursor-pointer"
                                    onClick={() => openModal("delete", org)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {organizations.length === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, totalCount)} of {totalCount}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p} variant="outline" size="sm"
                    className={cn("w-8 h-8 p-0", p === page && "bg-[#F4511E] text-white border-[#F4511E] hover:bg-[#E64A19]")}
                    onClick={() => setPage(p)}
                  >{p}</Button>
                ))}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Change Plan Modal ── */}
      <Dialog open={activeModal === "change-plan"} onOpenChange={closeModal}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Change Plan</DialogTitle>
            <DialogDescription>Update subscription plan for <strong>{targetOrg?.name}</strong></DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">New Plan</label>
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="SMALL">Small — ₹5,000/mo</SelectItem>
                  <SelectItem value="MEDIUM">Medium — ₹15,000/mo</SelectItem>
                  <SelectItem value="LARGE">Large — ₹40,000/mo</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise — ₹1,00,000/mo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Billing Cycle</label>
              <Select value={billingCycle} onValueChange={setBillingCycle}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly (2 months free)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button className="bg-[#F4511E] hover:bg-[#E64A19] text-white" onClick={handleChangePlan} disabled={actionLoading}>
              {actionLoading ? "Saving..." : "Change Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Extend Trial Modal ── */}
      <Dialog open={activeModal === "extend-trial"} onOpenChange={closeModal}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Extend Trial</DialogTitle>
            <DialogDescription>Extend trial period for <strong>{targetOrg?.name}</strong></DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Days to Extend</label>
            <Input
              type="number" min={1} max={365}
              value={trialDays}
              onChange={(e) => setTrialDays(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Current renewal: {targetOrg?.renewal}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button className="bg-[#F4511E] hover:bg-[#E64A19] text-white" onClick={handleExtendTrial} disabled={actionLoading}>
              {actionLoading ? "Extending..." : `Extend by ${trialDays} days`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Impersonate Confirm ── */}
      <AlertDialog open={activeModal === "impersonate"} onOpenChange={closeModal}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Impersonate Admin</AlertDialogTitle>
            <AlertDialogDescription>
              You will be logged in as the admin of <strong>{targetOrg?.name}</strong>. Any actions you take will affect this organization's data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-[#F4511E] hover:bg-[#E64A19]" onClick={handleImpersonate}>
              Impersonate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Suspend Confirm ── */}
      <AlertDialog open={activeModal === "suspend"} onOpenChange={closeModal}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend Organization</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{targetOrg?.name}</strong> will be suspended. Their users will lose access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-orange-600 hover:bg-orange-700" onClick={() => handleStatusChange("SUSPENDED")} disabled={actionLoading}>
              Suspend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Activate Confirm ── */}
      <AlertDialog open={activeModal === "activate"} onOpenChange={closeModal}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Activate Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Re-activate <strong>{targetOrg?.name}</strong>? Their users will regain access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange("ACTIVE")} disabled={actionLoading}>
              Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Delete Confirm ── */}
      <AlertDialog open={activeModal === "delete"} onOpenChange={closeModal}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{targetOrg?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Edit Domain & Branding Modal ── */}
      <Dialog open={activeModal === "edit-domain"} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-[500px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Domain & Branding</DialogTitle>
            <DialogDescription>Configure domains and label settings for <strong>{targetOrg?.name}</strong></DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Subdomain</Label>
                <div className="flex items-center">
                  <Input 
                    value={editData.subdomain}
                    onChange={(e) => setEditData({...editData, subdomain: e.target.value})}
                    placeholder="apex"
                    className="input-field rounded-r-none" 
                  />
                  <span className="bg-gray-100 border border-l-0 border-gray-200 px-3 py-2 rounded-r-lg text-sm text-gray-500">
                    .eduhub.in
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Custom Domain</Label>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <Input 
                    value={editData.customDomain}
                    onChange={(e) => setEditData({...editData, customDomain: e.target.value})}
                    placeholder="learn.apex-academy.com" 
                    className="input-field" 
                  />
                </div>
                <p className="text-[10px] text-gray-400">Requires CNAME record to cname.eduhub.in</p>
              </div>
              <div className="border-t border-gray-100 my-2 pt-2"></div>
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input 
                  value={editData.displayName}
                  onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                  className="input-field" 
                />
              </div>
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    value={editData.primaryColor}
                    onChange={(e) => setEditData({...editData, primaryColor: e.target.value})}
                    className="w-14 h-10 p-1 border rounded" 
                  />
                  <Input 
                    value={editData.primaryColor}
                    onChange={(e) => setEditData({...editData, primaryColor: e.target.value})}
                    className="input-field mono" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input 
                  value={editData.logoUrl}
                  onChange={(e) => setEditData({...editData, logoUrl: e.target.value})}
                  placeholder="https://..." 
                  className="input-field" 
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button 
              className="bg-[#F4511E] hover:bg-[#E64A19] text-white" 
              onClick={() => handleUpdateOrg(editData)} 
              disabled={actionLoading}
            >
              {actionLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
