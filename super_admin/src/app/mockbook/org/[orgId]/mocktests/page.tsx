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
  Calendar,
  Users,
  Clock,
  ChevronRight,
  FileText,
  CheckCircle2,
  Play,
  Pause,
  Copy,
  BarChart3,
  Download,
  KeyRound,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { MockBookOrgSwitcher } from "@/components/mockbook/MockBookOrgSwitcher";
import { MockBookOrgBanner, MockBookOrg } from "@/components/mockbook/MockBookOrgBanner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mock tests data
const mockTestsData = [
  {
    id: "MT-001",
    name: "JEE Full Mock Test - Series 1",
    type: "Full Mock",
    setCode: "482931",
    password: "738291",
    questions: 90,
    marks: 360,
    duration: 180,
    attempts: 1247,
    avgScore: 68,
    status: "published",
    accessType: "free",
    scheduledStart: null,
    scheduledEnd: null,
    negativeMarking: true,
    createdAt: "Feb 15, 2026",
  },
  {
    id: "MT-002",
    name: "Physics Chapter Test - Kinematics",
    type: "Chapter Test",
    setCode: "582931",
    password: "838291",
    questions: 30,
    marks: 120,
    duration: 60,
    attempts: 342,
    avgScore: 72,
    status: "published",
    accessType: "pack",
    packs: ["JEE Gold Pack", "JEE Platinum Pack"],
    scheduledStart: null,
    scheduledEnd: null,
    negativeMarking: true,
    createdAt: "Feb 20, 2026",
  },
  {
    id: "MT-003",
    name: "JEE PYQ 2024 Paper",
    type: "PYQ",
    setCode: "682931",
    password: "938291",
    questions: 90,
    marks: 300,
    duration: 180,
    attempts: 892,
    avgScore: 58,
    status: "published",
    accessType: "free",
    scheduledStart: null,
    scheduledEnd: null,
    negativeMarking: false,
    createdAt: "Feb 25, 2026",
  },
  {
    id: "MT-004",
    name: "NEET Biology Special",
    type: "Mini Mock",
    setCode: "782931",
    password: "048291",
    questions: 20,
    marks: 80,
    duration: 30,
    attempts: 0,
    avgScore: 0,
    status: "scheduled",
    accessType: "free",
    scheduledStart: "Mar 10, 2026 10:00 AM",
    scheduledEnd: "Mar 10, 2026 2:00 PM",
    negativeMarking: true,
    createdAt: "Mar 1, 2026",
  },
  {
    id: "MT-005",
    name: "Math Speed Test - Calculus",
    type: "Speed Test",
    setCode: "882931",
    password: "158291",
    questions: 50,
    marks: 200,
    duration: 45,
    attempts: 0,
    avgScore: 0,
    status: "draft",
    accessType: "pack",
    packs: ["JEE Platinum Pack"],
    scheduledStart: null,
    scheduledEnd: null,
    negativeMarking: true,
    createdAt: "Mar 3, 2026",
  },
];

// Stats
const stats = [
  { label: "Total MockTests", value: 45, icon: FileText, color: "purple" },
  { label: "Published", value: 32, icon: CheckCircle2, color: "green" },
  { label: "Total Attempts", value: "8.2K", icon: Users, color: "blue" },
  { label: "Avg Score", value: "68%", icon: BarChart3, color: "orange" },
];

// Type Badge
function TypeBadge({ type }: { type: string }) {
  const config: Record<string, { className: string }> = {
    "Full Mock": { className: "bg-purple-50 text-purple-700" },
    "Chapter Test": { className: "bg-blue-50 text-blue-700" },
    "PYQ": { className: "bg-green-50 text-green-700" },
    "Mini Mock": { className: "bg-orange-50 text-orange-700" },
    "Speed Test": { className: "bg-red-50 text-red-700" },
    "Practice": { className: "bg-gray-50 text-gray-700" },
  };
  const { className } = config[type] || config["Practice"];
  return <Badge className={cn("text-[10px]", className)}>{type}</Badge>;
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    published: { label: "Published", className: "bg-green-50 text-green-700 border-green-200" },
    scheduled: { label: "Scheduled", className: "bg-blue-50 text-blue-700 border-blue-200" },
    draft: { label: "Draft", className: "bg-gray-50 text-gray-600 border-gray-200" },
    archived: { label: "Archived", className: "bg-red-50 text-red-700 border-red-200" },
  };
  const { label, className } = config[status] || config.draft;
  return <Badge variant="outline" className={cn("text-[10px]", className)}>{label}</Badge>;
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

export default function MockTestsPage() {
    const { isOpen } = useSidebarStore();
const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;
  
  const [mounted, setMounted] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<MockBookOrg | null>(null);
  const [showOrgSwitcher, setShowOrgSwitcher] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createStep, setCreateStep] = useState(1);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedOrg(mockOrg);
  }, [orgId]);

  const handleOrgSelect = (org: MockBookOrg) => {
    setSelectedOrg(org);
    setShowOrgSwitcher(false);
    router.push(`/mockbook/org/${org.id}/mocktests`);
  };

  const handleExitOrg = () => {
    setSelectedOrg(null);
    router.push("/mockbook");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || typeFilter !== "all";

  // Filter tests
  const filteredTests = mockTestsData.filter((test) => {
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || test.status === statusFilter;
    const matchesType = typeFilter === "all" || test.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateTest = () => {
    toast.success("MockTest created successfully!");
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
                <span className="text-gray-900 font-medium">MockTests</span>
              </div>

              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">MockTests</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Create and manage mock tests from Question Sets
                  </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)} className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create MockTest
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
                        placeholder="Search mock tests..."
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
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-[140px] input-field">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Full Mock">Full Mock</SelectItem>
                        <SelectItem value="Chapter Test">Chapter Test</SelectItem>
                        <SelectItem value="PYQ">PYQ</SelectItem>
                        <SelectItem value="Mini Mock">Mini Mock</SelectItem>
                        <SelectItem value="Speed Test">Speed Test</SelectItem>
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

              {/* MockTests Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase">Test Name</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase">Type</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase">Set Code</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase text-center">Questions</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase text-center">Duration</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase text-center">Attempts</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTests.map((test) => (
                        <TableRow key={test.id} className="hover:bg-orange-50">
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{test.name}</div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="font-mono">{test.id}</span>
                                <span>•</span>
                                <span>{test.marks} marks</span>
                                {test.accessType === "pack" && (
                                  <Badge variant="outline" className="text-[10px]">Pack Only</Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <TypeBadge type={test.type} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">{test.setCode}</span>
                              <span className="text-gray-400">/</span>
                              <span className="font-mono text-sm text-gray-500">••••••</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-medium">{test.questions}</TableCell>
                          <TableCell className="text-center text-sm text-gray-600">{test.duration} min</TableCell>
                          <TableCell className="text-center">
                            <div>
                              <span className="font-medium">{test.attempts.toLocaleString()}</span>
                              {test.avgScore > 0 && (
                                <div className="text-xs text-gray-500">Avg: {test.avgScore}%</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={test.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {test.status === "published" && (
                                <Button variant="outline" size="sm" className="h-8">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Results
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" /> Edit Test
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Copy className="w-4 h-4 mr-2" /> Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <KeyRound className="w-4 h-4 mr-2" /> View Set ID/Password
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {test.status === "published" && (
                                    <DropdownMenuItem>
                                      <Pause className="w-4 h-4 mr-2" /> Unpublish
                                    </DropdownMenuItem>
                                  )}
                                  {test.status === "draft" && (
                                    <DropdownMenuItem>
                                      <Play className="w-4 h-4 mr-2" /> Publish
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem>
                                    <Download className="w-4 h-4 mr-2" /> Export Results
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
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

      {/* Create MockTest Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New MockTest</DialogTitle>
            <DialogDescription>
              Step {createStep} of 4 — {createStep === 1 && "Basic Info"}
              {createStep === 2 && "Question Source"}
              {createStep === 3 && "Exam Settings"}
              {createStep === 4 && "Access & Schedule"}
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
                <Label>Test Name *</Label>
                <Input placeholder="e.g., JEE Full Mock Test - Series 1" className="input-field" />
              </div>
              <div className="space-y-2">
                <Label>Test Type *</Label>
                <Select>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full Mock">Full Mock Test</SelectItem>
                    <SelectItem value="Chapter Test">Chapter Test</SelectItem>
                    <SelectItem value="PYQ">Previous Year Paper</SelectItem>
                    <SelectItem value="Mini Mock">Mini Mock</SelectItem>
                    <SelectItem value="Speed Test">Speed Test</SelectItem>
                    <SelectItem value="Practice">Practice Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Brief description of the test..." className="input-field" rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Instructions (shown before test)</Label>
                <Textarea 
                  placeholder="Read carefully, negative marking applies..." 
                  className="input-field" 
                  rows={3} 
                />
              </div>
            </div>
          )}

          {createStep === 2 && (
            <div className="space-y-4 py-4">
              <div className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
                <div className="font-medium mb-3">Link Question Set</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Set ID *</Label>
                    <Input placeholder="482931" className="input-field font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label>Password *</Label>
                    <Input placeholder="738291" className="input-field font-mono" type="password" />
                  </div>
                </div>
                <Button variant="outline" className="mt-3" size="sm">
                  Verify Set
                </Button>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                <div className="text-sm font-medium mb-1">Or browse from Question Sets</div>
                <Button variant="outline" size="sm">
                  Browse Q-Bank
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="text-sm font-medium mb-2">Questions Loaded</div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>30 Questions</span>
                  <span>•</span>
                  <span>120 Marks</span>
                  <span>•</span>
                  <span>Physics: Kinematics</span>
                </div>
              </div>
            </div>
          )}

          {createStep === 3 && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (minutes) *</Label>
                  <Input type="number" defaultValue="180" className="input-field" />
                </div>
                <div className="space-y-2">
                  <Label>Total Marks</Label>
                  <Input type="number" defaultValue="360" className="input-field" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Negative Marking</div>
                  <div className="text-sm text-gray-500">Deduct marks for wrong answers</div>
                </div>
                <Select defaultValue="yes">
                  <SelectTrigger className="w-28 input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes (-1)</SelectItem>
                    <SelectItem value="0.25">Yes (-0.25)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Shuffle Questions</div>
                </div>
                <Select defaultValue="yes">
                  <SelectTrigger className="w-24 input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Show Result</div>
                </div>
                <Select defaultValue="immediate">
                  <SelectTrigger className="w-32 input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="deadline">After Deadline</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Max Attempts</Label>
                <Select defaultValue="unlimited">
                  <SelectTrigger className="input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                    <SelectItem value="1">1 Attempt</SelectItem>
                    <SelectItem value="2">2 Attempts</SelectItem>
                    <SelectItem value="3">3 Attempts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {createStep === 4 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Access Type *</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="h-auto py-3 flex-col">
                    <span className="text-sm font-medium">Free</span>
                    <span className="text-xs text-gray-500">All org students</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-3 flex-col border-orange-300 bg-orange-50">
                    <span className="text-sm font-medium">Pack Only</span>
                    <span className="text-xs text-gray-500">Select packs below</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Include in Packs</Label>
                <div className="flex flex-wrap gap-2">
                  {["JEE Gold Pack", "JEE Platinum Pack", "NEET Complete"].map((pack) => (
                    <Badge
                      key={pack}
                      variant="outline"
                      className="cursor-pointer hover:bg-orange-50"
                    >
                      {pack}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Schedule</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">Start Date/Time</Label>
                    <Input type="datetime-local" className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">End Date/Time</Label>
                    <Input type="datetime-local" className="input-field" />
                  </div>
                </div>
                <p className="text-xs text-gray-500">Leave empty for always available</p>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue="draft">
                  <SelectTrigger className="input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Save as Draft</SelectItem>
                    <SelectItem value="published">Publish Now</SelectItem>
                    <SelectItem value="scheduled">Schedule</SelectItem>
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
              <Button onClick={handleCreateTest} className="btn-primary w-full sm:w-auto">
                Create MockTest
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
