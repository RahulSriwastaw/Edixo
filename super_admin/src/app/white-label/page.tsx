"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Palette,
  Building2,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Upload,
  MoreHorizontal,
  X,
  Monitor,
  Tablet,
  Smartphone,
  RefreshCcw,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";

// Mock white-label data
const whiteLabelData = [
  {
    id: "GK-ORG-00142",
    organization: "Apex Academy",
    plan: "Medium",
    branding: {
      displayName: "Apex Academy",
      logoUrl: "https://example.com/apex-logo.png",
      primaryColor: "#1E40AF",
      studentAppName: "Apex Student App",
      mockbookAppName: "Apex Mock Tests",
      adminDomain: "admin.apex-academy.com",
      faviconUrl: "https://example.com/apex-favicon.ico",
    },
    dns: {
      status: "verified",
      sslStatus: "active",
      expiresOn: "Dec 2026",
      autoRenew: true,
    },
    lastUpdated: "Feb 28, 2026",
    previewEnabled: true,
  },
  {
    id: "GK-ORG-00140",
    organization: "Excel Institute",
    plan: "Large",
    branding: {
      displayName: "Excel Institute",
      logoUrl: "https://example.com/excel-logo.png",
      primaryColor: "#059669",
      studentAppName: "Excel Learning",
      mockbookAppName: "Excel Test Series",
      adminDomain: null,
      faviconUrl: null,
    },
    dns: null,
    lastUpdated: "Feb 25, 2026",
    previewEnabled: true,
  },
  {
    id: "GK-ORG-00137",
    organization: "Prime Tutorials",
    plan: "Enterprise",
    branding: {
      displayName: "Prime Tutorials",
      logoUrl: "https://example.com/prime-logo.png",
      primaryColor: "#7C3AED",
      studentAppName: "Prime Student",
      mockbookAppName: "Prime Mocks",
      adminDomain: "admin.primetutorials.com",
      faviconUrl: "https://example.com/prime-favicon.ico",
    },
    dns: {
      status: "verified",
      sslStatus: "active",
      expiresOn: "Jun 2027",
      autoRenew: true,
    },
    lastUpdated: "Mar 01, 2026",
    previewEnabled: true,
  },
  {
    id: "GK-ORG-00139",
    organization: "Success Classes",
    plan: "Medium",
    branding: {
      displayName: "Success Classes",
      logoUrl: null,
      primaryColor: "#F4511E",
      studentAppName: "Success Learning",
      mockbookAppName: "Success Tests",
      adminDomain: "admin.successclasses.com",
      faviconUrl: null,
    },
    dns: {
      status: "pending",
      sslStatus: null,
      expiresOn: null,
      autoRenew: false,
    },
    lastUpdated: "Feb 20, 2026",
    previewEnabled: false,
  },
  {
    id: "GK-ORG-00136",
    organization: "Knowledge Park",
    plan: "Small",
    branding: {
      displayName: "Knowledge Park",
      logoUrl: null,
      primaryColor: "#2563EB",
      studentAppName: "KP Student App",
      mockbookAppName: "KP Mock Tests",
      adminDomain: null,
      faviconUrl: null,
    },
    dns: null,
    lastUpdated: "Jan 15, 2026",
    previewEnabled: false,
  },
];

// Reseller partners data
const resellerPartners = [
  {
    id: 1,
    name: "EduTech Solutions",
    orgs: 12,
    revenueShare: 20,
    totalGenerated: 480000,
    partnerCut: 96000,
    status: "Active",
  },
  {
    id: 2,
    name: "LearnMax Partners",
    orgs: 8,
    revenueShare: 15,
    totalGenerated: 285000,
    partnerCut: 42750,
    status: "Active",
  },
  {
    id: 3,
    name: "StudyFirst Agency",
    orgs: 5,
    revenueShare: 20,
    totalGenerated: 165000,
    partnerCut: 33000,
    status: "Inactive",
  },
];

// Stats data
const stats = [
  { label: "Custom Brandings", value: 35, icon: Palette, color: "purple" },
  { label: "Custom Domains", value: 12, icon: Globe, color: "blue" },
  { label: "SSL Certificates", value: 12, icon: CheckCircle, color: "green" },
  { label: "Reseller Partners", value: 3, icon: Building2, color: "orange" },
];

// Plan Badge
function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    Small: "badge-small",
    Medium: "badge-medium",
    Large: "badge-large",
    Enterprise: "badge-enterprise",
  };
  return <span className={`badge ${styles[plan] || ""}`}>{plan}</span>;
}

// DNS Status Badge
function DNSStatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-sm text-gray-400">Not configured</span>;
  const styles: Record<string, string> = {
    verified: "badge-active",
    pending: "bg-yellow-50 text-yellow-700",
    failed: "badge-suspended",
  };
  return <span className={`badge ${styles[status] || ""}`}>{status}</span>;
}

// SSL Badge
function SSLBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-sm text-gray-400">—</span>;
  const styles: Record<string, string> = {
    active: "badge-active",
    expired: "badge-suspended",
    pending: "bg-yellow-50 text-yellow-700",
  };
  return <span className={`badge ${styles[status] || ""}`}>SSL {status}</span>;
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

export default function WhiteLabelPage() {
    const { isOpen } = useSidebarStore();
const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [selectedOrg, setSelectedOrg] = useState<typeof whiteLabelData[0] | null>(null);
  const [showEditorDialog, setShowEditorDialog] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // Form state
  const [formData, setFormData] = useState({
    displayName: "",
    logoUrl: "",
    primaryColor: "#F4511E",
    studentAppName: "",
    mockbookAppName: "",
    adminDomain: "",
    faviconUrl: "",
  });

  const clearFilters = () => {
    setSearchQuery("");
    setPlanFilter("all");
    setDomainFilter("all");
  };

  const hasActiveFilters = searchQuery || planFilter !== "all" || domainFilter !== "all";

  // Filter organizations
  const filteredData = whiteLabelData.filter((org) => {
    const matchesSearch = org.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = planFilter === "all" || org.plan === planFilter;
    const matchesDomain = domainFilter === "all" ||
      (domainFilter === "custom" && org.branding.adminDomain) ||
      (domainFilter === "default" && !org.branding.adminDomain);
    return matchesSearch && matchesPlan && matchesDomain;
  });

  const handleOpenEditor = (org: typeof whiteLabelData[0]) => {
    setSelectedOrg(org);
    setFormData({
      displayName: org.branding.displayName,
      logoUrl: org.branding.logoUrl || "",
      primaryColor: org.branding.primaryColor,
      studentAppName: org.branding.studentAppName,
      mockbookAppName: org.branding.mockbookAppName,
      adminDomain: org.branding.adminDomain || "",
      faviconUrl: org.branding.faviconUrl || "",
    });
    setShowEditorDialog(true);
  };

  const handleSaveBranding = () => {
    toast.success(`Branding saved for ${selectedOrg?.organization}`);
    setShowEditorDialog(false);
  };

  const handleResetToDefaults = () => {
    toast.success("Branding reset to defaults");
  };

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
                <h1 className="text-2xl font-bold text-gray-900">White-Label</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Manage per-organization branding and custom domains
                </p>
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

            {/* Tabs */}
            <Tabs defaultValue="branding" className="w-full">
              <TabsList className="bg-white border border-gray-200 rounded-lg p-1">
                <TabsTrigger value="branding" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  <Palette className="w-4 h-4 mr-2" />
                  Organization Branding
                </TabsTrigger>
                <TabsTrigger value="domains" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  <Globe className="w-4 h-4 mr-2" />
                  Custom Domains
                </TabsTrigger>
                <TabsTrigger value="resellers" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  <Building2 className="w-4 h-4 mr-2" />
                  Reseller Partners
                </TabsTrigger>
              </TabsList>

              {/* Branding Tab */}
              <TabsContent value="branding" className="mt-6 space-y-4">
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
                      <Select value={domainFilter} onValueChange={setDomainFilter}>
                        <SelectTrigger className="w-[160px] input-field">
                          <SelectValue placeholder="Domain Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Domains</SelectItem>
                          <SelectItem value="custom">Custom Domain</SelectItem>
                          <SelectItem value="default">Default Domain</SelectItem>
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

                {/* Organizations Table */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Organization</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Plan</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Display Name</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Primary Color</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Custom Domain</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">DNS</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">SSL</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.map((org) => (
                          <TableRow key={org.id} className="hover:bg-brand-primary-tint">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                                  style={{ backgroundColor: org.branding.primaryColor }}
                                >
                                  {org.branding.displayName.charAt(0)}
                                </div>
                                <div>
                                  <Link
                                    href={`/organizations/${org.id}`}
                                    className="text-sm font-medium text-gray-900 hover:text-brand-primary"
                                  >
                                    {org.organization}
                                  </Link>
                                  <div className="text-xs text-gray-500 mono">{org.id}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <PlanBadge plan={org.plan} />
                            </TableCell>
                            <TableCell className="text-sm text-gray-900">{org.branding.displayName}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded border border-gray-200"
                                  style={{ backgroundColor: org.branding.primaryColor }}
                                />
                                <span className="text-sm text-gray-600 mono">{org.branding.primaryColor}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {org.branding.adminDomain ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-sm text-gray-600">{org.branding.adminDomain}</span>
                                  <ExternalLink className="w-3 h-3 text-gray-400" />
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">Default</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <DNSStatusBadge status={org.dns?.status || null} />
                            </TableCell>
                            <TableCell>
                              <SSLBadge status={org.dns?.sslStatus || null} />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => handleOpenEditor(org)}
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                                {org.previewEnabled && (
                                  <Button variant="outline" size="sm" className="text-xs">
                                    <Eye className="w-3 h-3 mr-1" />
                                    Preview
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Custom Domains Tab */}
              <TabsContent value="domains" className="mt-6 space-y-4">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Domain</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Organization</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">DNS Status</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">SSL</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Expires</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Auto-Renew</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {whiteLabelData
                          .filter((org) => org.branding.adminDomain)
                          .map((org) => (
                            <TableRow key={org.id} className="hover:bg-brand-primary-tint">
                              <TableCell className="font-medium text-gray-900">{org.branding.adminDomain}</TableCell>
                              <TableCell>
                                <Link
                                  href={`/organizations/${org.id}`}
                                  className="text-sm text-gray-700 hover:text-brand-primary"
                                >
                                  {org.organization}
                                </Link>
                              </TableCell>
                              <TableCell>
                                <DNSStatusBadge status={org.dns?.status || null} />
                              </TableCell>
                              <TableCell>
                                <SSLBadge status={org.dns?.sslStatus || null} />
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">{org.dns?.expiresOn || "—"}</TableCell>
                              <TableCell>
                                {org.dns?.autoRenew ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-gray-400" />
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="outline" size="sm" className="text-xs">
                                  <RefreshCcw className="w-3 h-3 mr-1" />
                                  Renew SSL
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reseller Partners Tab */}
              <TabsContent value="resellers" className="mt-6 space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Reseller Partners</CardTitle>
                      <CardDescription>Manage partners who resell EduHub to organizations</CardDescription>
                    </div>
                    <Button className="btn-primary">
                      Add Partner
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Partner</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Orgs</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Revenue Share</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Total Generated</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Partner Cut</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resellerPartners.map((partner) => (
                          <TableRow key={partner.id} className="hover:bg-brand-primary-tint">
                            <TableCell className="font-medium text-gray-900">{partner.name}</TableCell>
                            <TableCell className="text-sm text-gray-900">{partner.orgs}</TableCell>
                            <TableCell className="text-sm text-gray-600">{partner.revenueShare}%</TableCell>
                            <TableCell className="text-sm text-gray-900 font-medium">₹{(partner.totalGenerated / 1000).toFixed(0)}K</TableCell>
                            <TableCell className="text-sm text-gray-900 font-medium">₹{(partner.partnerCut / 1000).toFixed(0)}K</TableCell>
                            <TableCell>
                              <span className={`badge ${partner.status === "Active" ? "badge-active" : "bg-gray-100 text-gray-600"}`}>
                                {partner.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" /> Statement
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <XCircle className="w-4 h-4 mr-2" /> Deactivate
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
              </TabsContent>
            </Tabs>

            {/* Branding Editor Dialog */}
            <Dialog open={showEditorDialog} onOpenChange={setShowEditorDialog}>
              <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    White-Label Settings — {selectedOrg?.organization}
                  </DialogTitle>
                  <DialogDescription>
                    Customize branding for this organization
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
                  {/* Form */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Display Name</Label>
                      <Input
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Logo URL</Label>
                      <div className="flex gap-2">
                        <Input
                          value={formData.logoUrl}
                          onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                          placeholder="https://..."
                          className="input-field"
                        />
                        <Button variant="outline" className="shrink-0">
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="w-14 h-10 p-1 border rounded"
                        />
                        <Input
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="input-field mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Student App Name</Label>
                      <Input
                        value={formData.studentAppName}
                        onChange={(e) => setFormData({ ...formData, studentAppName: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>MockBook App Name</Label>
                      <Input
                        value={formData.mockbookAppName}
                        onChange={(e) => setFormData({ ...formData, mockbookAppName: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Custom Admin Domain</Label>
                      <Input
                        value={formData.adminDomain}
                        onChange={(e) => setFormData({ ...formData, adminDomain: e.target.value })}
                        placeholder="admin.example.com"
                        className="input-field"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Favicon URL</Label>
                      <Input
                        value={formData.faviconUrl}
                        onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })}
                        placeholder="https://..."
                        className="input-field"
                      />
                    </div>

                    {/* DNS Status */}
                    {selectedOrg?.dns && (
                      <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                        <h4 className="font-semibold text-gray-900">DNS Status</h4>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{selectedOrg.branding.adminDomain}</span>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-green-700">DNS VERIFIED</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">SSL Certificate</span>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-green-700">SSL ACTIVE</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Expires: {selectedOrg.dns.expiresOn} (Auto-renew {selectedOrg.dns.autoRenew ? "ON" : "OFF"})
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preview */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Preview</Label>
                      <div className="flex items-center gap-1 border rounded-lg p-1">
                        <button
                          onClick={() => setPreviewDevice("desktop")}
                          className={`p-1.5 rounded ${previewDevice === "desktop" ? "bg-gray-100" : ""}`}
                        >
                          <Monitor className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPreviewDevice("tablet")}
                          className={`p-1.5 rounded ${previewDevice === "tablet" ? "bg-gray-100" : ""}`}
                        >
                          <Tablet className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPreviewDevice("mobile")}
                          className={`p-1.5 rounded ${previewDevice === "mobile" ? "bg-gray-100" : ""}`}
                        >
                          <Smartphone className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div
                      className="border rounded-lg bg-gray-100 aspect-video flex items-center justify-center"
                      style={{
                        width: previewDevice === "desktop" ? "100%" : previewDevice === "tablet" ? "80%" : "50%",
                        margin: "0 auto",
                      }}
                    >
                      <div className="text-center text-gray-500">
                        <div
                          className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: formData.primaryColor }}
                        >
                          {formData.displayName.charAt(0) || "O"}
                        </div>
                        <div className="font-semibold text-gray-900">{formData.displayName || "Organization"}</div>
                        <div className="text-sm text-gray-400">Org Admin Panel Preview</div>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex items-center justify-between">
                  <Button variant="outline" onClick={handleResetToDefaults}>
                    Reset to Defaults
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setShowEditorDialog(false)}>
                      Cancel
                    </Button>
                    <Button className="btn-primary" onClick={handleSaveBranding}>
                      Save & Preview
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}
