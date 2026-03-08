"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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

export default function OrganizationDetailPage() {
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImpersonateDialog, setShowImpersonateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchAllData();
  }, [orgId]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchOrgDetails(),
      fetchStaff(),
      fetchStudents(),
      fetchAuditLogs()
    ]);
    setLoading(false);
  };

  const fetchOrgDetails = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/super-admin/organizations/${orgId}`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setOrgData(data.data);
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
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
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
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
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
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
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
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
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

  const handleDelete = () => {
    if (!orgData) return;
    toast.success(`${orgData.name} has been deleted`);
    setShowDeleteDialog(false);
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

  if (!orgData) return null;

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
                              <div className="text-xl font-bold text-gray-900">{orgData._count.staff}</div>
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
                              <div className="text-xl font-bold text-gray-900">{orgData._count.students.toLocaleString()}</div>
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
                            <Input defaultValue={orgData.name} className="input-field" readOnly />
                          </div>
                          <div className="space-y-2">
                            <Label>Domain</Label>
                            <Input defaultValue={orgData.domain || 'N/A'} className="input-field" readOnly />
                          </div>
                          <div className="space-y-2">
                            <Label>Contact Email</Label>
                            <Input defaultValue={orgData.email || 'N/A'} className="input-field" readOnly />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input defaultValue={orgData.mobile || 'N/A'} className="input-field" readOnly />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Address</Label>
                          <Input defaultValue={`${orgData.city || ''} ${orgData.state || ''}`.trim() || 'N/A'} className="input-field" readOnly />
                        </div>
                        <div className="flex justify-end">
                          <Button className="btn-primary" disabled>Save Changes</Button>
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
                            <span className="font-medium">{orgData._count.students.toLocaleString()} / 10000</span>
                          </div>
                          <Progress value={Math.min((orgData._count.students / 10000) * 100, 100)} className="h-2" />
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
                        <Button className="w-full justify-start btn-secondary">
                          <Monitor className="w-4 h-4 mr-2" /> Change App Type
                        </Button>
                        <Button className="w-full justify-start btn-secondary">
                          <CreditCard className="w-4 h-4 mr-2" /> Change Plan
                        </Button>
                        <Button className="w-full justify-start btn-secondary">
                          <Clock className="w-4 h-4 mr-2" /> Extend Trial
                        </Button>
                        <Button className="w-full justify-start text-orange-600 border-orange-200 hover:bg-orange-50" variant="outline">
                          <AlertTriangle className="w-4 h-4 mr-2" /> Suspend Org
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
                        <span className="text-sm font-medium">{orgData.activeStudents.toLocaleString()}</span>
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
                          <div className="text-xl font-bold text-gray-900">₹{orgData.mrr.toLocaleString()}</div>
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
                          <div className="text-xl font-bold text-gray-900">₹{orgData.totalRevenue.toLocaleString()}</div>
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
                        <Input defaultValue={orgData.name} className="input-field" />
                      </div>
                      <div className="space-y-2">
                        <Label>Primary Color</Label>
                        <div className="flex gap-2">
                          <Input type="color" defaultValue="#1E40AF" className="w-14 h-10 p-1 border rounded" />
                          <Input defaultValue="#1E40AF" className="input-field mono" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Logo URL</Label>
                        <Input placeholder="https://..." className="input-field" />
                      </div>
                      <Button className="btn-primary">Save Branding</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Custom Domain</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Admin Domain</Label>
                        <Input defaultValue={orgData.adminDomain} placeholder="admin.example.com" className="input-field" />
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">DNS Status</span>
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Verified</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">SSL Certificate</span>
                          <div className="flex items-center gap-1 text-green-600">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm font-medium">Active</span>
                          </div>
                        </div>
                      </div>
                      <Button className="btn-primary">Update Domain</Button>
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
    </div>
  );
}
