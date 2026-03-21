"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Users,
  DollarSign, Calendar, CheckCircle2, ChevronRight, Sparkles,
  BookOpen, Gift, Copy, Archive, Play, Loader2, X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { MockBookOrgSwitcher } from "@/components/mockbook/MockBookOrgSwitcher";
import { MockBookOrgBanner, MockBookOrg } from "@/components/mockbook/MockBookOrgBanner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { API_URL, getAuthHeaders } from "@/lib/api-config";

// getToken removed

const api = (path: string, opts?: RequestInit) =>
  fetch(`${API_URL}${path}`, {
    ...opts,
    headers: { ...getAuthHeaders(), ...(opts?.headers || {}) },
  }).then(r => r.json());

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    active: "bg-green-50 text-green-700 border-green-200",
    draft: "bg-gray-50 text-gray-600 border-gray-200",
    archived: "bg-red-50 text-red-700 border-red-200",
  };
  return <Badge variant="outline" className={cn("text-[10px]", cfg[status] || cfg.draft)}>{status}</Badge>;
}

const EMPTY_FORM = {
  name: "", shortDesc: "", description: "", badge: "none",
  monthlyPrice: 0, yearlyPrice: 0, trialDays: 3,
  aiPoints: 500, dailyPractice: true, status: "draft",
};

export default function PacksPage() {
  const { isOpen } = useSidebarStore();
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;

  const [mounted, setMounted] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<MockBookOrg | null>(null);
  const [showOrgSwitcher, setShowOrgSwitcher] = useState(false);
  const [packsList, setPacksList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create/Edit
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createStep, setCreateStep] = useState(1);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [isSaving, setIsSaving] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
    const init = async () => {
      try {
        const orgData = await api(`/super-admin/organizations/${orgId}`);
        if (orgData.success) {
          const o = orgData.data;
          setSelectedOrg({ id: o.orgId, name: o.name, plan: o.plan || "SMALL", status: o.status || "ACTIVE", students: o._count?.students || 0, mockTests: 0, aiCredits: o.aiCredits || 0 });
        } else {
          router.push("/mockbook");
          return;
        }
        await loadPacks();
      } catch { router.push("/mockbook"); }
    };
    init();
  }, [orgId]);

  const loadPacks = async () => {
    setIsLoading(true);
    try {
      const d = await api(`/super-admin/mockbook/${orgId}/packs`);
      if (d.success) setPacksList(d.data);
    } catch { toast.error("Failed to load packs"); }
    finally { setIsLoading(false); }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setCreateStep(1);
    setShowDialog(true);
  };

  const openEdit = (pack: any) => {
    setEditingId(pack.id);
    setForm({
      name: pack.name,
      shortDesc: pack.shortDesc || "",
      description: pack.description || "",
      badge: pack.badge || "none",
      monthlyPrice: pack.monthlyPrice || 0,
      yearlyPrice: pack.yearlyPrice || 0,
      trialDays: pack.trialDays || 3,
      aiPoints: pack.aiPoints || 500,
      dailyPractice: pack.dailyPractice ?? true,
      status: pack.status || "draft",
    });
    setCreateStep(1);
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Pack name is required");
    setIsSaving(true);
    try {
      const endpoint = editingId
        ? `/super-admin/mockbook/${orgId}/packs/${editingId}`
        : `/super-admin/mockbook/${orgId}/packs`;
      const method = editingId ? "PATCH" : "POST";
      const d = await api(endpoint, { method, body: JSON.stringify(form) });
      if (d.success) {
        toast.success(editingId ? "Pack updated" : "Pack created");
        setShowDialog(false);
        await loadPacks();
      } else {
        toast.error(d.message || "Failed to save pack");
      }
    } catch { toast.error("An error occurred"); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const d = await api(`/super-admin/mockbook/${orgId}/packs/${deleteId}`, { method: "DELETE" });
      if (d.success) {
        setPacksList(p => p.filter(x => x.id !== deleteId));
        toast.success("Pack deleted");
      } else {
        toast.error(d.message || "Failed to delete");
      }
    } catch { toast.error("An error occurred"); }
    finally { setIsDeleting(false); setDeleteId(null); }
  };

  const toggleStatus = async (pack: any) => {
    const newStatus = pack.status === "active" ? "draft" : "active";
    const d = await api(`/super-admin/mockbook/${orgId}/packs/${pack.id}`, {
      method: "PATCH", body: JSON.stringify({ status: newStatus }),
    });
    if (d.success) {
      setPacksList(p => p.map(x => x.id === pack.id ? { ...x, status: newStatus } : x));
      toast.success(`Pack ${newStatus === "active" ? "activated" : "archived"}`);
    }
  };

  const filteredPacks = packsList.filter(p => {
    const ms = (p.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const mst = statusFilter === "all" || p.status === statusFilter;
    return ms && mst;
  });

  if (!mounted) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
  if (!selectedOrg) return <div className="min-h-screen flex items-center justify-center p-4"><MockBookOrgSwitcher open={true} onSelect={o => { setSelectedOrg(o); router.push(`/mockbook/org/${o.id}/packs`); }} /></div>;

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <MockBookOrgBanner org={selectedOrg} onSwitch={() => setShowOrgSwitcher(true)} onExit={() => { setSelectedOrg(null); router.push("/mockbook"); }}>
          <main className="flex-1 p-6">
            <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/mockbook" className="hover:text-orange-600">MockBook</Link>
                <ChevronRight className="w-4 h-4" />
                <Link href={`/mockbook/org/${orgId}`} className="hover:text-orange-600">{selectedOrg.name}</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 font-medium">Packs</span>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Pack System</h1>
                  <p className="text-gray-500 text-sm mt-1">Manage subscription packs for students</p>
                </div>
                <Button onClick={openCreate} className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" /> Create Pack
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Packs", value: packsList.length, icon: Gift, color: "purple" },
                  { label: "Active Packs", value: packsList.filter(p => p.status === "active").length, icon: CheckCircle2, color: "green" },
                  { label: "Total Subscribers", value: packsList.reduce((a, p) => a + (p.students || 0), 0), icon: Users, color: "blue" },
                  { label: "Monthly Revenue", value: `₹${packsList.filter(p => p.status === "active").reduce((a, p) => a + (p.monthlyPrice || 0), 0).toLocaleString()}`, icon: DollarSign, color: "orange" },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  const bg: Record<string, string> = { purple: "bg-purple-50", green: "bg-green-50", blue: "bg-blue-50", orange: "bg-orange-50" };
                  const tc: Record<string, string> = { purple: "text-purple-600", green: "text-green-600", blue: "text-blue-600", orange: "text-orange-600" };
                  return (
                    <Card key={i} className="kpi-card">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", bg[stat.color])}>
                          <Icon className={cn("w-5 h-5", tc[stat.color])} />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase">{stat.label}</div>
                          <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Filter Bar */}
              <Card>
                <CardContent className="p-4 flex flex-wrap gap-3">
                  <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Search packs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 input-field" />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px] input-field"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Packs Grid / Empty State */}
              {isLoading ? (
                <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-3" /><p className="text-gray-400">Loading packs...</p></div>
              ) : filteredPacks.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                  <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-gray-600 font-medium">No packs yet</h3>
                  <p className="text-gray-400 text-sm mt-1">Create your first pack to offer subscription plans to students</p>
                  <Button className="btn-primary mt-4" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Create Pack</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPacks.map((pack) => (
                    <Card key={pack.id} className={cn("kpi-card transition-all hover:shadow-md", pack.status === "draft" && "opacity-75")}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-lg">
                              {pack.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{pack.name}</div>
                              {pack.badge && pack.badge !== "none" && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">{pack.badge}</span>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(pack)}><Edit className="w-4 h-4 mr-2" />Edit Pack</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => toggleStatus(pack)}
                                className={pack.status === "active" ? "text-orange-600" : "text-green-600"}
                              >
                                {pack.status === "active" ? <><Archive className="w-4 h-4 mr-2" />Archive</> : <><Play className="w-4 h-4 mr-2" />Activate</>}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(pack.id)}><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{pack.shortDesc || "No description"}</p>

                        <div className="flex items-end gap-2 mb-4">
                          {pack.monthlyPrice > 0 ? (
                            <>
                              <span className="text-2xl font-bold text-gray-900">₹{pack.monthlyPrice}</span>
                              <span className="text-gray-500 text-sm mb-1">/month</span>
                              <span className="text-gray-400 text-sm mb-1 ml-2">or ₹{pack.yearlyPrice}/year</span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-green-600">FREE</span>
                          )}
                        </div>

                        <div className="space-y-1.5 mb-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-orange-500" />{pack.mockTests || 0} Mock Tests included</div>
                          <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-500" />{pack.aiPoints} AI Points/month</div>
                          {pack.dailyPractice && <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" />Daily Practice enabled</div>}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{pack.students || 0}</span>
                            <span className="text-gray-500">students</span>
                          </div>
                          <StatusBadge status={pack.status} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </main>
        </MockBookOrgBanner>
      </div>

      <MockBookOrgSwitcher open={showOrgSwitcher} onSelect={o => { setSelectedOrg(o); setShowOrgSwitcher(false); router.push(`/mockbook/org/${o.id}/packs`); }} recentOrgs={selectedOrg ? [selectedOrg] : []} />

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Pack" : "Create New Pack"}</DialogTitle>
            <DialogDescription>Step {createStep} of 3</DialogDescription>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex gap-2 py-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={cn("flex-1 h-1.5 rounded-full", s <= createStep ? "bg-orange-500" : "bg-gray-200")} />
            ))}
          </div>

          {/* Step 1: Basic Info */}
          {createStep === 1 && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Pack Name <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g. JEE Gold Pack" className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Short Description</Label>
                <Input placeholder="What students get in this pack" className="input-field" value={form.shortDesc} onChange={e => setForm(p => ({ ...p, shortDesc: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Full Description</Label>
                <Textarea placeholder="Detailed description..." className="input-field resize-none" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Badge</Label>
                <Select value={form.badge} onValueChange={v => setForm(p => ({ ...p, badge: v }))}>
                  <SelectTrigger className="input-field"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="Most Popular">Most Popular</SelectItem>
                    <SelectItem value="Best Value">Best Value</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Pricing */}
          {createStep === 2 && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Monthly Price (₹)</Label>
                  <Input type="number" placeholder="999" className="input-field" value={form.monthlyPrice || ""} onChange={e => setForm(p => ({ ...p, monthlyPrice: Number(e.target.value) }))} />
                  <p className="text-xs text-gray-500">Set 0 for free</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Yearly Price (₹)</Label>
                  <Input type="number" placeholder="8999" className="input-field" value={form.yearlyPrice || ""} onChange={e => setForm(p => ({ ...p, yearlyPrice: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Trial Duration (days)</Label>
                <Input type="number" placeholder="3" className="input-field w-24" value={form.trialDays} onChange={e => setForm(p => ({ ...p, trialDays: Number(e.target.value) }))} />
                <p className="text-xs text-gray-500">Set 0 to disable trial</p>
              </div>
            </div>
          )}

          {/* Step 3: Features & Status */}
          {createStep === 3 && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>AI Points per Month</Label>
                <Input type="number" className="input-field w-32" value={form.aiPoints} onChange={e => setForm(p => ({ ...p, aiPoints: Number(e.target.value) }))} />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div><div className="font-medium">Daily Practice</div><div className="text-sm text-gray-500">Enable daily practice for students</div></div>
                <Switch checked={form.dailyPractice} onCheckedChange={v => setForm(p => ({ ...p, dailyPractice: v }))} />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div><div className="font-medium">Status</div></div>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="w-28 input-field"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {createStep > 1 && <Button variant="outline" onClick={() => setCreateStep(s => s - 1)}>Back</Button>}
            {createStep < 3 ? (
              <Button className="btn-primary" onClick={() => setCreateStep(s => s + 1)}>Next</Button>
            ) : (
              <Button className="btn-primary" onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingId ? "Save Changes" : "Create Pack"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Pack</DialogTitle>
            <DialogDescription>This will permanently delete this pack. Students who subscribed will lose access. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Delete Pack
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
