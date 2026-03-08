"use client";
import { useSidebarStore } from "@/store/sidebarStore";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Sparkles,
  BookOpen,
  Clock,
  Gift,
  Copy,
  Archive,
  Play,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { MockBookOrgSwitcher } from "@/components/mockbook/MockBookOrgSwitcher";
import { MockBookOrgBanner, MockBookOrg } from "@/components/mockbook/MockBookOrgBanner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mock packs data
const packsData = [
  {
    id: "PACK-001",
    name: "JEE Gold Pack",
    shortDesc: "Complete JEE prep with AI analysis",
    thumbnail: null,
    badge: "Most Popular",
    monthlyPrice: 999,
    yearlyPrice: 8999,
    yearlyMRP: 11988,
    students: 342,
    mockTests: 45,
    studyPlans: 2,
    dailyPractice: true,
    aiPoints: 500,
    status: "active",
    trialDays: 3,
    inAppPurchase: true,
    adminAssign: true,
    createdAt: "Jan 15, 2026",
  },
  {
    id: "PACK-002",
    name: "JEE Platinum Pack",
    shortDesc: "Premium JEE prep with unlimited AI",
    thumbnail: null,
    badge: "Best Value",
    monthlyPrice: 1499,
    yearlyPrice: 12999,
    yearlyMRP: 17988,
    students: 189,
    mockTests: 85,
    studyPlans: 5,
    dailyPractice: true,
    aiPoints: 1000,
    status: "active",
    trialDays: 7,
    inAppPurchase: true,
    adminAssign: true,
    createdAt: "Jan 20, 2026",
  },
  {
    id: "PACK-003",
    name: "NEET Complete",
    shortDesc: "Full NEET preparation package",
    thumbnail: null,
    badge: "New",
    monthlyPrice: 799,
    yearlyPrice: 6999,
    yearlyMRP: 9588,
    students: 156,
    mockTests: 32,
    studyPlans: 3,
    dailyPractice: true,
    aiPoints: 400,
    status: "active",
    trialDays: 3,
    inAppPurchase: true,
    adminAssign: true,
    createdAt: "Feb 1, 2026",
  },
  {
    id: "PACK-004",
    name: "SSC GD Special",
    shortDesc: "SSC GD exam preparation",
    thumbnail: null,
    badge: null,
    monthlyPrice: 499,
    yearlyPrice: 3999,
    yearlyMRP: 5988,
    students: 87,
    mockTests: 20,
    studyPlans: 1,
    dailyPractice: true,
    aiPoints: 200,
    status: "active",
    trialDays: 0,
    inAppPurchase: true,
    adminAssign: true,
    createdAt: "Feb 10, 2026",
  },
  {
    id: "PACK-005",
    name: "Free Trial Pack",
    shortDesc: "Basic access for new students",
    thumbnail: null,
    badge: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlyMRP: 0,
    students: 523,
    mockTests: 5,
    studyPlans: 0,
    dailyPractice: false,
    aiPoints: 50,
    status: "active",
    trialDays: 0,
    inAppPurchase: false,
    adminAssign: true,
    createdAt: "Dec 1, 2025",
  },
  {
    id: "PACK-006",
    name: "Board Exam Prep",
    shortDesc: "Class 10 & 12 board preparation",
    thumbnail: null,
    badge: null,
    monthlyPrice: 299,
    yearlyPrice: 2499,
    yearlyMRP: 3588,
    students: 0,
    mockTests: 15,
    studyPlans: 2,
    dailyPractice: true,
    aiPoints: 100,
    status: "draft",
    trialDays: 0,
    inAppPurchase: true,
    adminAssign: true,
    createdAt: "Feb 28, 2026",
  },
];

// Stats
const stats = [
  { label: "Total Packs", value: 6, icon: Gift, color: "purple" },
  { label: "Active Packs", value: 5, icon: CheckCircle2, color: "green" },
  { label: "Total Subscribers", value: 1297, icon: Users, color: "blue" },
  { label: "Monthly Revenue", value: "₹9.2L", icon: DollarSign, color: "orange" },
];

// Subscribers data
const subscribersData = [
  { id: "STU-001", name: "Rahul Sharma", pack: "JEE Gold Pack", plan: "Monthly", purchased: "Feb 15, 2026", expires: "Mar 15, 2026", status: "active" },
  { id: "STU-002", name: "Priya Verma", pack: "JEE Platinum Pack", plan: "Yearly", purchased: "Jan 1, 2026", expires: "Jan 1, 2027", status: "active" },
  { id: "STU-003", name: "Amit Kumar", pack: "JEE Gold Pack", plan: "Assigned", purchased: "Mar 1, 2026", expires: "Mar 31, 2026", status: "active" },
  { id: "STU-004", name: "Sunita Patel", pack: "NEET Complete", plan: "Monthly", purchased: "Feb 20, 2026", expires: "Mar 20, 2026", status: "active" },
  { id: "STU-005", name: "Vikash Singh", pack: "JEE Gold Pack", plan: "Monthly", purchased: "Jan 10, 2026", expires: "Feb 10, 2026", status: "expired" },
];

// Plan Badge
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    active: { label: "Active", className: "bg-green-50 text-green-700 border-green-200" },
    draft: { label: "Draft", className: "bg-gray-50 text-gray-600 border-gray-200" },
    archived: { label: "Archived", className: "bg-red-50 text-red-700 border-red-200" },
  };
  const { label, className } = config[status] || config.draft;
  return <Badge variant="outline" className={cn("text-[10px]", className)}>{label}</Badge>;
}

// Badge Component
function PackBadge({ badge }: { badge: string | null }) {
  if (!badge) return null;
  const styles: Record<string, string> = {
    "Most Popular": "bg-orange-100 text-orange-700",
    "Best Value": "bg-green-100 text-green-700",
    "New": "bg-blue-100 text-blue-700",
    "Free": "bg-purple-100 text-purple-700",
  };
  return <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", styles[badge] || "bg-gray-100 text-gray-700")}>{badge}</span>;
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

export default function PacksPage() {
    const { isOpen } = useSidebarStore();
const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;
  
  const [mounted, setMounted] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<MockBookOrg | null>(null);
  const [showOrgSwitcher, setShowOrgSwitcher] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [selectedPack, setSelectedPack] = useState<typeof packsData[0] | null>(null);
  const [showSubscribersDialog, setShowSubscribersDialog] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // Mock: Load org from ID
    const mockOrg: MockBookOrg = {
      id: orgId,
      name: "Apex Academy",
      plan: "Medium",
      status: "Active",
      students: 847,
      mockTests: 24,
    };
    setSelectedOrg(mockOrg);
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [orgId]);

  const handleOrgSelect = (org: MockBookOrg) => {
    setSelectedOrg(org);
    setShowOrgSwitcher(false);
    router.push(`/mockbook/org/${org.id}/packs`);
  };

  const handleExitOrg = () => {
    setSelectedOrg(null);
    router.push("/mockbook");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all";

  // Filter packs
  const filteredPacks = packsData.filter((pack) => {
    const matchesSearch = pack.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || pack.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePack = () => {
    toast.success("Pack created successfully!");
    setShowCreateDialog(false);
    setCreateStep(1);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-neutral-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!selectedOrg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 flex items-center justify-center p-4">
        <MockBookOrgSwitcher open={true} onSelect={handleOrgSelect} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <MockBookOrgBanner
          org={selectedOrg}
          onSwitch={() => setShowOrgSwitcher(true)}
          onExit={handleExitOrg}
        >
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

              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Pack System</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Manage subscription packs for students
                  </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)} className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Pack
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index} className="kpi-card">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${getIconBgColor(stat.color)} flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${getIconColor(stat.color)}`} />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase">{stat.label}</div>
                            <div className="text-xl font-bold text-gray-900">{stat.value}</div>
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
                        placeholder="Search packs..."
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
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    {hasActiveFilters && (
                      <Button variant="ghost" onClick={clearFilters}>
                        Clear
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Packs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPacks.map((pack) => (
                  <Card key={pack.id} className={cn(
                    "kpi-card cursor-pointer transition-all hover:shadow-md",
                    pack.status === "draft" && "opacity-75"
                  )}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-lg">
                            {pack.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{pack.name}</span>
                              <PackBadge badge={pack.badge} />
                            </div>
                            <div className="text-xs text-gray-500 font-mono">{pack.id}</div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedPack(pack); setShowSubscribersDialog(true); }}>
                              <Users className="w-4 h-4 mr-2" /> View Subscribers
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" /> Edit Pack
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-orange-600">
                              <Gift className="w-4 h-4 mr-2" /> Assign to Student
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {pack.status === "active" ? (
                              <DropdownMenuItem className="text-red-600">
                                <Archive className="w-4 h-4 mr-2" /> Archive
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-green-600">
                                <Play className="w-4 h-4 mr-2" /> Activate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{pack.shortDesc}</p>

                      {/* Pricing */}
                      <div className="flex items-end gap-2 mb-4">
                        {pack.monthlyPrice > 0 ? (
                          <>
                            <span className="text-2xl font-bold text-gray-900">₹{pack.monthlyPrice}</span>
                            <span className="text-gray-500 text-sm mb-1">/month</span>
                            <span className="text-gray-400 text-sm mb-1 ml-2">
                              or ₹{pack.yearlyPrice}/year
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-green-600">FREE</span>
                        )}
                      </div>

                      {/* Features */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <BookOpen className="w-4 h-4 text-orange-500" />
                          <span>{pack.mockTests} Mock Tests</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>{pack.studyPlans} Study Plans</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <span>{pack.aiPoints} AI Points/month</span>
                        </div>
                        {pack.dailyPractice && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span>Daily Practice</span>
                          </div>
                        )}
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{pack.students}</span>
                          <span className="text-gray-500">students</span>
                        </div>
                        <StatusBadge status={pack.status} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </MockBookOrgBanner>
      </div>

      {/* Org Switcher */}
      <MockBookOrgSwitcher
        open={showOrgSwitcher}
        onSelect={handleOrgSelect}
        recentOrgs={selectedOrg ? [selectedOrg] : []}
      />

      {/* Create Pack Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Pack</DialogTitle>
            <DialogDescription>
              Step {createStep} of 4 — {createStep === 1 && "Basic Info"}
              {createStep === 2 && "Pricing & Duration"}
              {createStep === 3 && "Content Access"}
              {createStep === 4 && "AI Features & Settings"}
            </DialogDescription>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 py-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={cn(
                  "flex-1 h-1 rounded-full",
                  step <= createStep ? "bg-orange-500" : "bg-gray-200"
                )}
              />
            ))}
          </div>

          {createStep === 1 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Pack Name *</Label>
                <Input placeholder="e.g., JEE Gold Pack" className="input-field" />
              </div>
              <div className="space-y-2">
                <Label>Short Description *</Label>
                <Input placeholder="Brief description shown to students" className="input-field" />
              </div>
              <div className="space-y-2">
                <Label>Full Description</Label>
                <Textarea placeholder="Detailed pack description..." className="input-field" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Badge/Tag</Label>
                  <Select>
                    <SelectTrigger className="input-field">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="value">Best Value</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Thumbnail</Label>
                  <Button variant="outline" className="w-full">
                    Upload Image
                  </Button>
                </div>
              </div>
            </div>
          )}

          {createStep === 2 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Pack Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="h-auto py-3 flex-col">
                    <DollarSign className="w-4 h-4 mb-1" />
                    <span className="text-sm">Paid Pack</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-3 flex-col">
                    <Gift className="w-4 h-4 mb-1" />
                    <span className="text-sm">Free Pack</span>
                  </Button>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-4">
                <div className="font-medium">Monthly Plan</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <Input type="number" placeholder="999" className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <Label>MRP (₹) <span className="text-gray-400 font-normal">(strikethrough)</span></Label>
                    <Input type="number" placeholder="1299" className="input-field" />
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-4">
                <div className="font-medium">Yearly Plan</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <Input type="number" placeholder="8999" className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <Label>MRP (₹)</Label>
                    <Input type="number" placeholder="11988" className="input-field" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Trial Duration (days)</Label>
                <Input type="number" placeholder="3" className="input-field" />
                <p className="text-xs text-gray-500">Set 0 for no trial</p>
              </div>
            </div>
          )}

          {createStep === 3 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Included MockTests</Label>
                <Select>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Select tests or folders..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tests</SelectItem>
                    <SelectItem value="folder">Select by Folder</SelectItem>
                    <SelectItem value="specific">Select Specific Tests</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Included Study Plans</Label>
                <div className="flex flex-wrap gap-2">
                  {["90 Day JEE Plan", "60 Day Crash Course", "NEET Prep Plan"].map((plan) => (
                    <Badge
                      key={plan}
                      variant="outline"
                      className="cursor-pointer hover:bg-orange-50"
                    >
                      {plan}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Daily Practice</div>
                  <div className="text-sm text-gray-500">Enable daily practice questions</div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>Questions per Day</Label>
                <Input type="number" defaultValue="20" className="input-field w-24" />
              </div>
            </div>
          )}

          {createStep === 4 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>AI Points per Month</Label>
                <Input type="number" defaultValue="500" className="input-field w-32" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">AI Analysis</div>
                    <div className="text-sm text-gray-500">Performance analysis and insights</div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">AI Doubt Solver</div>
                    <div className="text-sm text-gray-500">AI-powered doubt resolution</div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Purchase Methods</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pl-4">
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">In-App Purchase</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Admin Assign</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Status</div>
                </div>
                <Select defaultValue="draft">
                  <SelectTrigger className="w-32 input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {createStep > 1 && (
              <Button variant="outline" onClick={() => setCreateStep(createStep - 1)} className="w-full sm:w-auto">
                Back
              </Button>
            )}
            {createStep < 4 ? (
              <Button onClick={() => setCreateStep(createStep + 1)} className="btn-primary w-full sm:w-auto">
                Next
              </Button>
            ) : (
              <Button onClick={handleCreatePack} className="btn-primary w-full sm:w-auto">
                Create Pack
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscribers Dialog */}
      <Dialog open={showSubscribersDialog} onOpenChange={setShowSubscribersDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPack?.name} — Subscribers</DialogTitle>
            <DialogDescription>
              {selectedPack?.students} students enrolled
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 py-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search subscribers..." className="pl-9 input-field" />
            </div>
            <Button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Assign
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Student</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Plan</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Expires</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribersData.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{sub.name}</div>
                      <div className="text-xs text-gray-500">{sub.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{sub.plan}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{sub.expires}</TableCell>
                  <TableCell>
                    <Badge className={sub.status === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm">Extend</Button>
                      <Button variant="ghost" size="sm" className="text-red-600">Revoke</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}
