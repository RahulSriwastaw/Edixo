"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  Palette,
  FileText,
  Settings,
  Key,
  Monitor,
  Globe,
  Shield,
  Bell,
  TrendingUp,
  Calendar,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TableBody as TableBodyStyled,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";

// Unique IDs for this org (Placeholder for now)
const uniqueIDs: any[] = [];

// Users for this org (Placeholder for now)
const orgUsers: any[] = [];

// Invoices for this org (Placeholder for now)
const invoices: any[] = [];

// Audit log for this org (Placeholder for now)
const auditLog: any[] = [];

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "badge-active",
    TRIAL: "badge-trial",
    SUSPENDED: "badge-suspended",
    EXPIRED: "badge-suspended",
    Paid: "badge-active",
    Pending: "badge-pending",
  };
  return <span className={`badge ${styles[status] || ""}`}>{status}</span>;
}

// Plan Badge
function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    SMALL: "badge-small",
    MEDIUM: "badge-medium",
    LARGE: "badge-large",
    ENTERPRISE: "badge-enterprise",
  };
  return <span className={`badge ${styles[plan] || ""}`}>{plan}</span>;
}

// App Type Badge
function AppTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    STUDENT: "badge-student",
    MOCKBOOK: "badge-mockbook",
    BOTH: "badge-both",
  };
  return <span className={`badge ${styles[type] || ""}`}>{type}</span>;
}

function OrganizationDetailInner() {
  const { isOpen } = useSidebarStore();
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState<any>(null);
  const [staffData, setStaffData] = useState<any[]>([]);
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImpersonateDialog, setShowImpersonateDialog] = useState(false);
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false);
  const [showExtendTrialDialog, setShowExtendTrialDialog] = useState(false);
  const [newPlan, setNewPlan] = useState("SMALL");
  const [trialDays, setTrialDays] = useState(30);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Editable form state
  const [editData, setEditData] = useState({
    name: "",
    subdomain: "",
    customDomain: "",
    email: "",
    mobile: "",
    displayName: "",
    primaryColor: "",
    logoUrl: "",
  });

  const [saving, setSaving] = useState(false);

  // ── Mockbook Frontend Config State ────────────────────────────
  const [frontendConfig, setFrontendConfig] = useState<any>(null);
  const [fcSaving, setFcSaving] = useState(false);
  // banners
  const [banners, setBanners] = useState<any[]>([]);
  // quick links
  const [quickLinks, setQuickLinks] = useState<any[]>([]);
  // hero
  const [heroText, setHeroText] = useState('');
  const [heroSubText, setHeroSubText] = useState('');
  const [stats, setStats] = useState<{label: string, value: string}[]>([]);
  // faqs
  const [faqs, setFaqs] = useState<{q: string, a: string}[]>([]);
  // testimonials
  const [testimonials, setTestimonials] = useState<{name: string, role: string, text: string, avatar: string}[]>([]);
  // why section
  const [whyTitle, setWhyTitle] = useState('Why Choose Us?');
  const [whyItems, setWhyItems] = useState<{icon: string, title: string, desc: string}[]>([]);

  useEffect(() => {
    fetchAllData();
  }, [orgId]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchOrgDetails(),
      fetchStaff(),
      fetchStudents(),
      fetchAuditLogs(),
      fetchFrontendConfig(),
    ]);
    setLoading(false);
  };

  const fetchFrontendConfig = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/organizations/public/${orgId}`);
      const data = await res.json();
      if (data.success && data.data.frontendConfig) {
        const fc = data.data.frontendConfig;
        setFrontendConfig(fc);
        setBanners(fc.promoBanners || []);
        setQuickLinks(fc.quickLinks || []);
        setHeroText(fc.heroText || '');
        setHeroSubText(fc.heroSubText || '');
        setStats(fc.stats || []);
        setFaqs(fc.faqs || []);
        setTestimonials(fc.testimonials || []);
        setWhyTitle(fc.whySection?.title || 'Why Choose Us?');
        setWhyItems(fc.whySection?.items || []);
      }
    } catch (err) { console.error('Failed to load frontend config', err); }
  };

  const handleSaveFrontendConfig = async () => {
    setFcSaving(true);
    try {
      const token = document.cookie.split('sb_token=')[1]?.split(';')[0];
      const payload = {
        promoBanners: banners,
        quickLinks,
        heroText,
        heroSubText,
        stats,
        faqs,
        testimonials,
        whySection: { title: whyTitle, items: whyItems },
      };
      const res = await fetch(`http://localhost:4000/api/organizations/${orgId}/frontend-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) { toast.success('Mockbook config saved!'); }
      else toast.error(data.message || 'Failed to save config');
    } catch { toast.error('Connection error'); }
    finally { setFcSaving(false); }
  };

  const fetchOrgDetails = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/super-admin/organizations/${orgId}`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('sb_token=')[1]?.split(';')[0]}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setOrgData(data.data);
        setEditData({
          name: data.data.name || "",
          subdomain: data.data.subdomain || "",
          customDomain: data.data.customDomain || "",
          email: data.data.email || "",
          mobile: data.data.mobile || "",
          displayName: data.data.displayName || data.data.name || "",
          primaryColor: data.data.primaryColor || "#F4511E",
          logoUrl: data.data.logoUrl || "",
        });
      } else {
        toast.error(data.error || "Failed to fetch organization details");
        router.push('/organizations');
      }
    } catch (err) {
      toast.error("Connection error");
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/super-admin/organizations/${orgId}/staff`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('sb_token=')[1]?.split(';')[0]}`
        }
      });
      const data = await res.json();
      if (data.success) setStaffData(data.data);
    } catch (err) { console.error(err); }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/super-admin/organizations/${orgId}/students`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('sb_token=')[1]?.split(';')[0]}`
        }
      });
      const data = await res.json();
      if (data.success) setStudentsData(data.data);
    } catch (err) { console.error(err); }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/super-admin/organizations/${orgId}/audit`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('sb_token=')[1]?.split(';')[0]}`
        }
      });
      const data = await res.json();
      if (data.success) setAuditLogs(data.data);
    } catch (err) { console.error(err); }
  };

  const handleCopyId = () => {
    if (!orgData) return;
    navigator.clipboard.writeText(orgData.orgId);
    toast.success("Organization ID copied to clipboard");
  };

  const handleImpersonate = () => {
    if (!orgData) return;
    toast.success(`Impersonating ${orgData.name} admin`);
    setShowImpersonateDialog(false);
  };

  const handleSuspend = async () => {
    if (!orgData) return;
    try {
      const res = await fetch(`http://localhost:4000/api/super-admin/organizations/${orgId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('sb_token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify({ status: 'SUSPENDED' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${orgData.name} has been suspended`);
        fetchOrgDetails();
      } else {
        toast.error(data.error || "Failed to suspend organization");
      }
    } catch (err) {
      toast.error("Connection error");
    }
    setShowSuspendDialog(false);
  };

  const handleDelete = async () => {
    if (!orgData) return;
    try {
      const res = await fetch(`http://localhost:4000/api/super-admin/organizations/${orgId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${document.cookie.split('sb_token=')[1]?.split(';')[0]}` }
      });
      const data = await res.json();
      if (data.success) { toast.success(`${orgData.name} deleted`); router.push('/organizations'); }
      else toast.error(data.error || "Failed to delete");
    } catch { toast.error("Connection error"); }
    setShowDeleteDialog(false);
  };

  const handleActivate = async () => {
    if (!orgData) return;
    try {
      const res = await fetch(`http://localhost:4000/api/super-admin/organizations/${orgId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${document.cookie.split('sb_token=')[1]?.split(';')[0]}` },
        body: JSON.stringify({ status: 'ACTIVE' })
      });
      const data = await res.json();
      if (data.success) { toast.success(`${orgData.name} activated`); fetchOrgDetails(); }
      else toast.error(data.error || "Failed");
    } catch { toast.error("Connection error"); }
    setShowActivateDialog(false);
  };

  const handleChangePlan = async () => {
    if (!orgData) return;
    try {
      const res = await fetch(`http://localhost:4000/api/super-admin/organizations/${orgId}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${document.cookie.split('sb_token=')[1]?.split(';')[0]}` },
        body: JSON.stringify({ plan: newPlan })
      });
      const data = await res.json();
      if (data.success) { toast.success(`Plan changed to ${newPlan}`); fetchOrgDetails(); }
      else toast.error(data.error || "Failed");
    } catch { toast.error("Connection error"); }
    setShowChangePlanDialog(false);
  };

  const handleExtendTrial = async () => {
    if (!orgData) return;
    try {
      const res = await fetch(`http://localhost:4000/api/super-admin/organizations/${orgId}/extend-trial`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${document.cookie.split('sb_token=')[1]?.split(';')[0]}` },
        body: JSON.stringify({ days: Number(trialDays) })
      });
      const data = await res.json();
      if (data.success) { toast.success(`Trial extended by ${trialDays} days`); fetchOrgDetails(); }
      else toast.error(data.error || "Failed");
    } catch { toast.error("Connection error"); }
    setShowExtendTrialDialog(false);
  };

  const handleUpdateOrg = async (fields: any) => {
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:4000/api/super-admin/organizations/${orgId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('sb_token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify(fields)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Organization updated successfully");
        fetchOrgDetails();
      } else {
        toast.error(data.message || "Failed to update");
      }
    } catch (err) {
      toast.error("Connection error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bg">
        <Sidebar />
        <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
          <TopBar />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
              <p className="text-gray-500 font-medium">Loading organization details...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!orgData || !orgData._count) return null;

  const planRates: Record<string, number> = {
    SMALL: 5000,
    MEDIUM: 15000,
    LARGE: 40000,
    ENTERPRISE: 100000
  };

  const mrr = planRates[orgData.plan] || 0;
  const renewalDate = orgData.trialEndsAt ? new Date(orgData.trialEndsAt).toLocaleDateString() : 'N/A';
  const createdAtFormatted = new Date(orgData.createdAt).toLocaleDateString();

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className="ml-60 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Back Link */}
            <Link
              href="/organizations"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Organizations
            </Link>

            {/* Organization Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-brand-primary flex items-center justify-center text-white text-2xl font-bold">
                      {orgData.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">{orgData.name}</h1>
                        <StatusBadge status={orgData.status} />
                        <PlanBadge plan={orgData.plan} />
                        <AppTypeBadge type={orgData.appType} />
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="mono text-sm">{orgData.orgId}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyId}>
                          <Copy className="w-3 h-3" />
                        </Button>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{orgData.domain || 'no-domain.com'}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{orgData.email || 'no-email@org.com'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="btn-secondary" onClick={() => setShowImpersonateDialog(true)}>
                      <Key className="w-4 h-4 mr-2" />
                      Impersonate Admin
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="btn-secondary">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" /> Edit Organization
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CreditCard className="w-4 h-4 mr-2" /> Change Plan
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Monitor className="w-4 h-4 mr-2" /> Change App Type
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-orange-600">
                          <AlertTriangle className="w-4 h-4 mr-2" /> Suspend
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-white border border-gray-200 rounded-lg p-1 flex-wrap h-auto gap-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="unique-ids" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  Unique IDs
                </TabsTrigger>
                <TabsTrigger value="apps" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  Apps
                </TabsTrigger>
                <TabsTrigger value="users" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  Users
                </TabsTrigger>
                <TabsTrigger value="billing" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  Billing
                </TabsTrigger>
                <TabsTrigger value="white-label" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  White-Label
                </TabsTrigger>
                <TabsTrigger value="audit" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  Audit
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  Settings
                </TabsTrigger>
                <TabsTrigger value="mockbook-config" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  📱 Mockbook Config
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Profile Form */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="kpi-card">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                              <Users className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Teachers</div>
                              <div className="text-xl font-bold text-gray-900">{orgData._count?.staff ?? 0}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="kpi-card">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                              <GraduationCap className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Students</div>
                              <div className="text-xl font-bold text-gray-900">{(orgData._count?.students ?? 0).toLocaleString()}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="kpi-card">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">MRR</div>
                              <div className="text-xl font-bold text-gray-900">₹{mrr.toLocaleString()}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="kpi-card">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Renewal</div>
                              <div className="text-xl font-bold text-gray-900">{renewalDate}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Profile Form */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Organization Profile</CardTitle>
                        <CardDescription>Basic information about this organization</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Organization Name</Label>
                            <Input 
                              value={editData.name} 
                              onChange={(e) => setEditData({...editData, name: e.target.value})}
                              className="input-field" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Subdomain</Label>
                            <div className="flex items-center">
                              <Input 
                                value={editData.subdomain}
                                onChange={(e) => setEditData({...editData, subdomain: e.target.value})}
                                className="input-field rounded-r-none" 
                              />
                              <span className="bg-gray-100 border border-l-0 border-gray-200 px-3 py-2 rounded-r-lg text-sm text-gray-500">
                                .eduhub.in
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Contact Email</Label>
                            <Input 
                              value={editData.email}
                              onChange={(e) => setEditData({...editData, email: e.target.value})}
                              className="input-field" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input 
                              value={editData.mobile}
                              onChange={(e) => setEditData({...editData, mobile: e.target.value})}
                              className="input-field" 
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            className="btn-primary" 
                            onClick={() => handleUpdateOrg({
                              name: editData.name,
                              subdomain: editData.subdomain,
                              email: editData.email,
                              mobile: editData.mobile
                            })}
                            disabled={saving}
                          >
                            {saving ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Usage Stats */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Usage & Limits</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Storage Used</span>
                            <span className="font-medium">{orgData.storageUsed} / {orgData.storageLimit}</span>
                          </div>
                          <Progress value={68} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">AI Credits This Month</span>
                            <span className="font-medium">{orgData.aiCredits} / {orgData.plan === 'SMALL' ? '500' : orgData.plan === 'MEDIUM' ? '2000' : '8000'}</span>
                          </div>
                          <Progress value={Math.min((orgData.aiCredits / (orgData.plan === 'SMALL' ? 500 : 2000)) * 100, 100)} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Active Students</span>
                            <span className="font-medium">{(orgData._count?.students ?? 0).toLocaleString()} / 10000</span>
                          </div>
                          <Progress value={Math.min(((orgData._count?.students ?? 0) / 10000) * 100, 100)} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column - Quick Actions */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button className="w-full justify-start btn-secondary" onClick={() => setShowImpersonateDialog(true)}>
                          <Key className="w-4 h-4 mr-2" /> Impersonate Admin
                        </Button>
                        <Button className="w-full justify-start btn-secondary" onClick={() => setShowChangePlanDialog(true)}>
                          <CreditCard className="w-4 h-4 mr-2" /> Change Plan
                        </Button>
                        <Button className="w-full justify-start btn-secondary" onClick={() => setShowExtendTrialDialog(true)}>
                          <Clock className="w-4 h-4 mr-2" /> Extend Trial
                        </Button>
                        {orgData?.status === 'SUSPENDED' ? (
                          <Button className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50" variant="outline" onClick={() => setShowActivateDialog(true)}>
                            <CheckCircle className="w-4 h-4 mr-2" /> Activate Org
                          </Button>
                        ) : (
                          <Button className="w-full justify-start text-orange-600 border-orange-200 hover:bg-orange-50" variant="outline" onClick={() => setShowSuspendDialog(true)}>
                            <AlertTriangle className="w-4 h-4 mr-2" /> Suspend Org
                          </Button>
                        )}
                        <Button className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50" variant="outline" onClick={() => setShowDeleteDialog(true)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Org
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Created</span>
                            <span className="text-sm font-medium">{createdAtFormatted}</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Total Revenue</span>
                            <span className="text-sm font-medium">₹{(mrr * 3).toLocaleString()} (Est.)</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">App Type</span>
                            <AppTypeBadge type={orgData.appType || 'STUDENT'} />
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-600">Admin Email</span>
                            <span className="text-sm text-gray-900">{orgData.orgAdminEmail || "—"}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Unique IDs Tab */}
              <TabsContent value="unique-ids" className="mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Unique IDs</CardTitle>
                      <CardDescription>Teacher and Public access IDs for this organization</CardDescription>
                    </div>
                    <Button className="btn-primary">
                      Generate New ID
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Unique ID</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Type</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Name</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Last Used</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {staffData.map((uid) => (
                          <TableRow key={uid.id} className="hover:bg-brand-primary-tint">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="mono">{uid.staffId}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                                  navigator.clipboard.writeText(uid.staffId);
                                  toast.success("Copied!");
                                }}>
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={uid.role === "TEACHER" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}>
                                {uid.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-900">{uid.name}</TableCell>
                            <TableCell>
                              <StatusBadge status={uid.isActive ? "ACTIVE" : "SUSPENDED"} />
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">{uid.user?.lastLoginAt ? new Date(uid.user.lastLoginAt).toLocaleString() : 'Never'}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Suspend</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">Revoke</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                        {staffData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">No Unique IDs found for this organization.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Apps Tab */}
              <TabsContent value="apps" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                        Student App
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <StatusBadge status="Active" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Students Enrolled</span>
                        <span className="text-sm font-medium">{(orgData.activeStudents ?? orgData._count?.students ?? 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Courses Active</span>
                        <span className="text-sm font-medium">12</span>
                      </div>
                      <Button className="w-full btn-secondary">Manage Student App</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-purple-600" />
                        MockBook App
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <StatusBadge status="Active" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Tests Created</span>
                        <span className="text-sm font-medium">48</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Tests Attempted</span>
                        <span className="text-sm font-medium">3,421</span>
                      </div>
                      <Button className="w-full btn-secondary">Manage MockBook</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Users</CardTitle>
                      <CardDescription>All users in this organization</CardDescription>
                    </div>
                    <Button className="btn-primary">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">User</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Role</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Last Active</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {staffData.map((staff) => (
                          <TableRow key={staff.id} className="hover:bg-brand-primary-tint">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
                                    {staff.name.split(" ").map((n: string) => n[0]).join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                                  <div className="text-xs text-gray-500">{staff.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={staff.role === "ORG_ADMIN" ? "bg-orange-50 text-orange-700" : "bg-purple-50 text-purple-700"}>
                                {staff.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={staff.isActive ? "ACTIVE" : "SUSPENDED"} />
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">{staff.user?.lastLoginAt ? new Date(staff.user.lastLoginAt).toLocaleString() : 'Never'}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem>Reset Password</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">Suspend</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                        {studentsData.map((student) => (
                          <TableRow key={student.id} className="hover:bg-brand-primary-tint">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
                                    {student.name.split(" ").map((n: string) => n[0]).join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                  <div className="text-xs text-gray-500">{student.email || "No Email"}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-blue-50 text-blue-700">STUDENT</Badge>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={student.isActive ? "ACTIVE" : "SUSPENDED"} />
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">{student.user?.lastLoginAt ? new Date(student.user.lastLoginAt).toLocaleString() : 'Never'}</TableCell>
                            <TableCell className="text-right">
                              {/* Actions placeholder */}
                            </TableCell>
                          </TableRow>
                        ))}
                        {staffData.length === 0 && studentsData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">No users found for this organization.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Billing Tab */}
              <TabsContent value="billing" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="kpi-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Monthly Revenue</div>
                          <div className="text-xl font-bold text-gray-900">₹{(orgData.mrr ?? 0).toLocaleString()}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="kpi-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Total Revenue</div>
                          <div className="text-xl font-bold text-gray-900">₹{(orgData.totalRevenue ?? 0).toLocaleString()}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="kpi-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Next Renewal</div>
                          <div className="text-xl font-bold text-gray-900">{orgData.renewalDate}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Invoices</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Invoice #</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Period</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Amount</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Date</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((invoice) => (
                          <TableRow key={invoice.id} className="hover:bg-brand-primary-tint">
                            <TableCell className="mono text-brand-primary">{invoice.id}</TableCell>
                            <TableCell className="text-sm text-gray-900">{invoice.period}</TableCell>
                            <TableCell className="text-sm font-medium text-gray-900">₹{invoice.amount.toLocaleString()}</TableCell>
                            <TableCell>
                              <StatusBadge status={invoice.status} />
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">{invoice.date}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="text-brand-primary">
                                <ExternalLink className="w-3 h-3 mr-1" /> View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {invoices.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">No invoices generated yet.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* White-Label Tab */}
              <TabsContent value="white-label" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Branding Settings</CardTitle>
                      <CardDescription>Customize the look and feel for this organization</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                      <Button 
                        className="btn-primary"
                        onClick={() => handleUpdateOrg({
                          displayName: editData.displayName,
                          primaryColor: editData.primaryColor,
                          logoUrl: editData.logoUrl
                        })}
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save Branding"}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Custom Domain</CardTitle>
                      <CardDescription>Configure external domain (CNAME required)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Custom Domain</Label>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <Input 
                            value={editData.customDomain}
                            onChange={(e) => setEditData({...editData, customDomain: e.target.value})}
                            placeholder="e.g., learn.apex-academy.com" 
                            className="input-field" 
                          />
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 border rounded-lg space-y-3">
                        <div className="text-sm font-medium text-gray-900 mb-1">CNAME Configuration</div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-500 uppercase font-semibold">Type</span>
                          <span className="text-sm mono font-bold">CNAME</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-500 uppercase font-semibold">Target</span>
                          <span className="text-sm mono font-bold">cname.eduhub.in</span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                          <span className="text-sm text-gray-600">Status</span>
                          <div className={`flex items-center gap-1 ${orgData.customDomain ? 'text-green-600' : 'text-gray-400'}`}>
                            {orgData.customDomain ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                            <span className="text-sm font-medium">{orgData.customDomain ? 'Active' : 'Not Configured'}</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        className="btn-primary"
                        onClick={() => handleUpdateOrg({ customDomain: editData.customDomain })}
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Update Domain"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Audit Tab */}
              <TabsContent value="audit" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Audit Log</CardTitle>
                    <CardDescription>Recent activity for this organization</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Timestamp</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Action</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Actor</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditLog.map((log) => (
                          <TableRow key={log.id} className="hover:bg-brand-primary-tint">
                            <TableCell className="text-sm text-gray-500 mono">{log.timestamp}</TableCell>
                            <TableCell>
                              <Badge className="bg-gray-100 text-gray-700">{log.action}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-900">{log.actor}</TableCell>
                            <TableCell className="text-sm text-gray-600">{log.details}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-6">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Organization Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Feature Flags</div>
                          <div className="text-xs text-gray-500">Control which features are enabled</div>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">AI Quota</div>
                          <div className="text-xs text-gray-500">Manage monthly AI credits</div>
                        </div>
                        <Button variant="outline" size="sm">Edit Limit</Button>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Storage Limit</div>
                          <div className="text-xs text-gray-500">Manage storage allocation</div>
                        </div>
                        <Button variant="outline" size="sm">Edit Limit</Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Danger Zone */}
                  <Card className="border-red-200">
                    <CardHeader>
                      <CardTitle className="text-red-600 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Danger Zone
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Suspend Organization</div>
                          <div className="text-xs text-gray-500">All users will immediately lose access.</div>
                        </div>
                        <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => setShowSuspendDialog(true)}>
                          Suspend Organization
                        </Button>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Delete Organization</div>
                          <div className="text-xs text-gray-500">Permanently deletes org and all data. Irreversible.</div>
                        </div>
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowDeleteDialog(true)}>
                          Delete Organization
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* ── MOCKBOOK CONFIG TAB ───────────────────────────────── */}
              <TabsContent value="mockbook-config" className="mt-6">
                <div className="space-y-6">

                  {/* Hero Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Hero Section</CardTitle>
                      <CardDescription>Greeting text shown to logged-in students</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Hero Heading</Label>
                        <Input value={heroText} onChange={e => setHeroText(e.target.value)} placeholder="Ready to level up? 🚀" className="input-field" />
                      </div>
                      <div className="space-y-2">
                        <Label>Hero Sub Text</Label>
                        <Input value={heroSubText} onChange={e => setHeroSubText(e.target.value)} placeholder="Today is a great day to attempt a Full-Length Mock." className="input-field" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stats */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div><CardTitle>Platform Stats</CardTitle><CardDescription>Shown below the hero section</CardDescription></div>
                      <Button className="btn-primary" size="sm" onClick={() => setStats(s => [...s, { label: '', value: '' }])}>
                        + Add Stat
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {stats.map((stat, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <Input placeholder="Label" value={stat.label} onChange={e => setStats(s => s.map((x, j) => j===i ? {...x, label: e.target.value} : x))} className="input-field" />
                          <Input placeholder="Value (e.g. 50K+)" value={stat.value} onChange={e => setStats(s => s.map((x, j) => j===i ? {...x, value: e.target.value} : x))} className="input-field" />
                          <Button variant="outline" size="icon" className="text-red-500 border-red-200 shrink-0" onClick={() => setStats(s => s.filter((_,j)=>j!==i))}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      {stats.length === 0 && <p className="text-sm text-gray-400">No stats added. Click &quot;Add Stat&quot; to add one.</p>}
                    </CardContent>
                  </Card>

                  {/* Promo Banners */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div><CardTitle>Promo Banners</CardTitle><CardDescription>Rotating banners on the test series page</CardDescription></div>
                      <Button className="btn-primary" size="sm" onClick={() => setBanners(b => [...b, { id: `banner-${Date.now()}`, title: '', subtitle: '', badgeText: '', ctaText: 'Explore', linkUrl: '/tests', gradient: 'from-violet-600 via-purple-600 to-blue-600' }])}>
                        + Add Banner
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {banners.map((b, i) => (
                        <div key={b.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-700">Banner {i+1}</span>
                            <Button variant="ghost" size="sm" className="text-red-500 h-7" onClick={() => setBanners(prev => prev.filter((_,j)=>j!==i))}>Remove</Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div><Label className="text-xs">Title</Label><Input value={b.title} onChange={e => setBanners(prev => prev.map((x,j)=>j===i?{...x,title:e.target.value}:x))} className="input-field mt-1" /></div>
                            <div><Label className="text-xs">Badge Text</Label><Input value={b.badgeText} onChange={e => setBanners(prev => prev.map((x,j)=>j===i?{...x,badgeText:e.target.value}:x))} className="input-field mt-1" /></div>
                            <div><Label className="text-xs">Subtitle</Label><Input value={b.subtitle} onChange={e => setBanners(prev => prev.map((x,j)=>j===i?{...x,subtitle:e.target.value}:x))} className="input-field mt-1" /></div>
                            <div><Label className="text-xs">CTA Button Text</Label><Input value={b.ctaText} onChange={e => setBanners(prev => prev.map((x,j)=>j===i?{...x,ctaText:e.target.value}:x))} className="input-field mt-1" /></div>
                            <div><Label className="text-xs">Link URL</Label><Input value={b.linkUrl} onChange={e => setBanners(prev => prev.map((x,j)=>j===i?{...x,linkUrl:e.target.value}:x))} className="input-field mt-1" /></div>
                            <div><Label className="text-xs">Gradient (Tailwind)</Label><Input value={b.gradient} onChange={e => setBanners(prev => prev.map((x,j)=>j===i?{...x,gradient:e.target.value}:x))} placeholder="from-violet-600 via-purple-600 to-blue-600" className="input-field mt-1" /></div>
                          </div>
                          <div className={`h-8 rounded-lg bg-gradient-to-br ${b.gradient || 'from-violet-600 to-blue-600'}`} />
                        </div>
                      ))}
                      {banners.length === 0 && <p className="text-sm text-gray-400">No banners. Default banners will be shown to students.</p>}
                    </CardContent>
                  </Card>

                  {/* Quick Links */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div><CardTitle>Quick Links</CardTitle><CardDescription>Icon shortcuts shown below banners</CardDescription></div>
                      <Button className="btn-primary" size="sm" onClick={() => setQuickLinks(q => [...q, { id: `ql-${Date.now()}`, icon: '📝', label: '', linkUrl: '/tests' }])}>
                        + Add Link
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {quickLinks.map((ql, i) => (
                        <div key={ql.id} className="flex gap-2 items-center">
                          <Input placeholder="Icon (emoji)" value={ql.icon} onChange={e => setQuickLinks(q => q.map((x,j)=>j===i?{...x,icon:e.target.value}:x))} className="input-field w-20" />
                          <Input placeholder="Label" value={ql.label} onChange={e => setQuickLinks(q => q.map((x,j)=>j===i?{...x,label:e.target.value}:x))} className="input-field" />
                          <Input placeholder="URL" value={ql.linkUrl} onChange={e => setQuickLinks(q => q.map((x,j)=>j===i?{...x,linkUrl:e.target.value}:x))} className="input-field" />
                          <Button variant="outline" size="icon" className="text-red-500 border-red-200 shrink-0" onClick={() => setQuickLinks(q => q.filter((_,j)=>j!==i))}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      {quickLinks.length === 0 && <p className="text-sm text-gray-400">No quick links. Default links will be shown.</p>}
                    </CardContent>
                  </Card>

                  {/* Why Us Section */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div><CardTitle>Why Choose Us</CardTitle><CardDescription>Trust-building section shown on the test series page</CardDescription></div>
                      <Button className="btn-primary" size="sm" onClick={() => setWhyItems(w => [...w, { icon: '🏆', title: '', desc: '' }])}>
                        + Add Item
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Section Title</Label>
                        <Input value={whyTitle} onChange={e => setWhyTitle(e.target.value)} className="input-field" />
                      </div>
                      {whyItems.map((item, i) => (
                        <div key={i} className="border border-gray-100 rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500">Item {i+1}</span>
                            <Button variant="ghost" size="sm" className="text-red-500 h-6 text-xs" onClick={() => setWhyItems(w => w.filter((_,j)=>j!==i))}>Remove</Button>
                          </div>
                          <div className="flex gap-2">
                            <Input placeholder="Icon" value={item.icon} onChange={e => setWhyItems(w => w.map((x,j)=>j===i?{...x,icon:e.target.value}:x))} className="input-field w-20" />
                            <Input placeholder="Title" value={item.title} onChange={e => setWhyItems(w => w.map((x,j)=>j===i?{...x,title:e.target.value}:x))} className="input-field" />
                          </div>
                          <Input placeholder="Description" value={item.desc} onChange={e => setWhyItems(w => w.map((x,j)=>j===i?{...x,desc:e.target.value}:x))} className="input-field" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Testimonials */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div><CardTitle>Student Testimonials</CardTitle><CardDescription>Shown as social proof to students</CardDescription></div>
                      <Button className="btn-primary" size="sm" onClick={() => setTestimonials(t => [...t, { name: '', role: '', text: '', avatar: '' }])}>
                        + Add Testimonial
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {testimonials.map((t, i) => (
                        <div key={i} className="border border-gray-100 rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500">Testimonial {i+1}</span>
                            <Button variant="ghost" size="sm" className="text-red-500 h-6 text-xs" onClick={() => setTestimonials(prev => prev.filter((_,j)=>j!==i))}>Remove</Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Student Name" value={t.name} onChange={e => setTestimonials(prev => prev.map((x,j)=>j===i?{...x,name:e.target.value}:x))} className="input-field" />
                            <Input placeholder="Role (e.g., SSC CGL 2025 Qualifier)" value={t.role} onChange={e => setTestimonials(prev => prev.map((x,j)=>j===i?{...x,role:e.target.value}:x))} className="input-field" />
                          </div>
                          <Input placeholder="Testimonial text..." value={t.text} onChange={e => setTestimonials(prev => prev.map((x,j)=>j===i?{...x,text:e.target.value}:x))} className="input-field" />
                          <Input placeholder="Avatar URL (optional)" value={t.avatar} onChange={e => setTestimonials(prev => prev.map((x,j)=>j===i?{...x,avatar:e.target.value}:x))} className="input-field" />
                        </div>
                      ))}
                      {testimonials.length === 0 && <p className="text-sm text-gray-400">No testimonials added.</p>}
                    </CardContent>
                  </Card>

                  {/* FAQs */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div><CardTitle>FAQs</CardTitle><CardDescription>Frequently Asked Questions shown at the bottom of Test Series page</CardDescription></div>
                      <Button className="btn-primary" size="sm" onClick={() => setFaqs(f => [...f, { q: '', a: '' }])}>
                        + Add FAQ
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {faqs.map((faq, i) => (
                        <div key={i} className="border border-gray-100 rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500">Q{i+1}</span>
                            <Button variant="ghost" size="sm" className="text-red-500 h-6 text-xs" onClick={() => setFaqs(f => f.filter((_,j)=>j!==i))}>Remove</Button>
                          </div>
                          <Input placeholder="Question" value={faq.q} onChange={e => setFaqs(f => f.map((x,j)=>j===i?{...x,q:e.target.value}:x))} className="input-field" />
                          <Input placeholder="Answer" value={faq.a} onChange={e => setFaqs(f => f.map((x,j)=>j===i?{...x,a:e.target.value}:x))} className="input-field" />
                        </div>
                      ))}
                      {faqs.length === 0 && <p className="text-sm text-gray-400">No FAQs added.</p>}
                    </CardContent>
                  </Card>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <Button className="btn-primary h-12 px-10" onClick={handleSaveFrontendConfig} disabled={fcSaving}>
                      {fcSaving ? 'Saving...' : 'Save Mockbook Config'}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Impersonate Dialog */}
      <Dialog open={showImpersonateDialog} onOpenChange={setShowImpersonateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-brand-primary" />
              Impersonate Admin
            </DialogTitle>
            <DialogDescription>
              You are about to impersonate the Org Admin for <strong>{orgData.name}</strong>.
              All actions will be logged for security purposes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImpersonateDialog(false)}>Cancel</Button>
            <Button className="btn-primary" onClick={handleImpersonate}>
              Start Impersonation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Suspend Organization
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend <strong>{orgData.name}</strong>? All users will immediately lose access to their accounts.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>Cancel</Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleSuspend}>
              Suspend Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Delete Organization
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete <strong>{orgData.name}</strong>? This action cannot be undone. All data including users, courses, and tests will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>
              Delete Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate Dialog */}
      <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Activate Organization
            </DialogTitle>
            <DialogDescription>
              Re-activate <strong>{orgData?.name}</strong>? All users will regain access immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActivateDialog(false)}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleActivate}>
              Activate Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Plan Dialog */}
      <Dialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
        <DialogContent className="sm:max-w-[450px] bg-white">
          <DialogHeader>
            <DialogTitle>Change Plan</DialogTitle>
            <DialogDescription>Update subscription plan for <strong>{orgData?.name}</strong></DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">New Plan</label>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangePlanDialog(false)}>Cancel</Button>
            <Button className="bg-brand-primary hover:bg-brand-primary-hover text-white" onClick={handleChangePlan}>
              Change Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Trial Dialog */}
      <Dialog open={showExtendTrialDialog} onOpenChange={setShowExtendTrialDialog}>
        <DialogContent className="sm:max-w-[400px] bg-white">
          <DialogHeader>
            <DialogTitle>Extend Trial</DialogTitle>
            <DialogDescription>Extend trial period for <strong>{orgData?.name}</strong></DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Days to Extend</label>
            <Input
              type="number" min={1} max={365}
              value={trialDays}
              onChange={(e) => setTrialDays(Number(e.target.value))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendTrialDialog(false)}>Cancel</Button>
            <Button className="bg-brand-primary hover:bg-brand-primary-hover text-white" onClick={handleExtendTrial}>
              Extend by {trialDays} days
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OrganizationDetailPage() {
  return (
    <Suspense fallback={
       <div className="flex h-screen items-center justify-center">
         <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
       </div>
    }>
      <OrganizationDetailInner />
    </Suspense>
  );
}
