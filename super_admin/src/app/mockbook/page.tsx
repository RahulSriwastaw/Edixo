"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Plus,
  MoreHorizontal,
  RotateCcw,
  Clock,
  History,
  Building2,
  Sparkles,
  BookOpen,
  Settings,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { MockBookOrgSwitcher } from "@/components/mockbook/MockBookOrgSwitcher";

// AI Quota data
const aiQuotaData = [
  {
    orgId: "GK-ORG-00142",
    organization: "Apex Academy",
    plan: "Medium",
    monthlyLimit: 500,
    usedThisMonth: 342,
    resetsOn: "Mar 15, 2026",
  },
  {
    orgId: "GK-ORG-00141",
    organization: "Brilliant Coaching",
    plan: "Small",
    monthlyLimit: 200,
    usedThisMonth: 156,
    resetsOn: "Mar 10, 2026",
  },
  {
    orgId: "GK-ORG-00140",
    organization: "Excel Institute",
    plan: "Large",
    monthlyLimit: 1000,
    usedThisMonth: 623,
    resetsOn: "Apr 01, 2026",
  },
  {
    orgId: "GK-ORG-00139",
    organization: "Success Classes",
    plan: "Medium",
    monthlyLimit: 500,
    usedThisMonth: 487,
    resetsOn: "Mar 25, 2026",
  },
  {
    orgId: "GK-ORG-00137",
    organization: "Prime Tutorials",
    plan: "Enterprise",
    monthlyLimit: 2000,
    usedThisMonth: 892,
    resetsOn: "May 15, 2026",
  },
  {
    orgId: "GK-ORG-00136",
    organization: "Knowledge Park",
    plan: "Medium",
    monthlyLimit: 500,
    usedThisMonth: 234,
    resetsOn: "Mar 30, 2026",
  },
];

// Taxonomy data
const taxonomyData = [
  {
    id: "sub-1",
    name: "Physics",
    chapters: [
      {
        id: "ch-1",
        name: "Kinematics",
        topics: [
          { id: "t-1", name: "Uniform Motion", questionCount: 45 },
          { id: "t-2", name: "Non-uniform Motion", questionCount: 38 },
          { id: "t-3", name: "Projectile Motion", questionCount: 52 },
        ],
      },
      {
        id: "ch-2",
        name: "Laws of Motion",
        topics: [
          { id: "t-4", name: "Newton's First Law", questionCount: 28 },
          { id: "t-5", name: "Newton's Second Law", questionCount: 35 },
          { id: "t-6", name: "Newton's Third Law", questionCount: 22 },
        ],
      },
      {
        id: "ch-3",
        name: "Work, Energy and Power",
        topics: [
          { id: "t-7", name: "Work Done", questionCount: 41 },
          { id: "t-8", name: "Kinetic Energy", questionCount: 33 },
        ],
      },
    ],
  },
  {
    id: "sub-2",
    name: "Chemistry",
    chapters: [
      {
        id: "ch-4",
        name: "Chemical Bonding",
        topics: [
          { id: "t-9", name: "Ionic Bonding", questionCount: 29 },
          { id: "t-10", name: "Covalent Bonding", questionCount: 36 },
        ],
      },
      {
        id: "ch-5",
        name: "Acids and Bases",
        topics: [
          { id: "t-11", name: "pH Scale", questionCount: 24 },
          { id: "t-12", name: "Neutralization", questionCount: 18 },
        ],
      },
    ],
  },
  {
    id: "sub-3",
    name: "Mathematics",
    chapters: [
      {
        id: "ch-6",
        name: "Calculus",
        topics: [
          { id: "t-13", name: "Derivatives", questionCount: 48 },
          { id: "t-14", name: "Integrals", questionCount: 42 },
        ],
      },
      {
        id: "ch-7",
        name: "Algebra",
        topics: [
          { id: "t-15", name: "Quadratic Equations", questionCount: 37 },
          { id: "t-16", name: "Complex Numbers", questionCount: 28 },
        ],
      },
    ],
  },
  {
    id: "sub-4",
    name: "Biology",
    chapters: [
      {
        id: "ch-8",
        name: "Cell Structure",
        topics: [
          { id: "t-17", name: "Cell Organelles", questionCount: 32 },
          { id: "t-18", name: "Cell Division", questionCount: 26 },
        ],
      },
    ],
  },
];

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

// Quota Progress Component
function QuotaProgress({ used, limit }: { used: number; limit: number }) {
  const percentage = Math.round((used / limit) * 100);
  let colorClass = "bg-green-500";
  if (percentage >= 90) colorClass = "bg-red-500";
  else if (percentage >= 70) colorClass = "bg-yellow-500";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-gray-600 font-mono w-20 text-right">
        {used} / {limit}
      </span>
    </div>
  );
}

// Tree Item Component
function TreeItem({
  name,
  type,
  questionCount,
  children,
  level = 0,
}: {
  name: string;
  type: "subject" | "chapter" | "topic";
  questionCount?: number;
  children?: React.ReactNode;
  level?: number;
}) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = children && Array.isArray(children) && children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 rounded group"
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <span className="w-5 h-5 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          </span>
        )}
        <span className={`flex-1 ${type === "subject" ? "font-semibold text-gray-900" : type === "chapter" ? "font-medium text-gray-800" : "text-gray-700"}`}>
          {name}
        </span>
        {questionCount !== undefined && (
          <span className="text-xs text-gray-400">{questionCount} questions</span>
        )}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-brand-primary">
            <Edit className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-500">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      {hasChildren && expanded && <div>{children}</div>}
    </div>
  );
}

export default function MockBookPage() {
    const { isOpen } = useSidebarStore();
const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showOrgSwitcher, setShowOrgSwitcher] = useState(false);

  // Filter quota data
  const filteredQuotaData = aiQuotaData.filter((item) =>
    item.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOrgSelect = (org: { id: string; name: string }) => {
    setShowOrgSwitcher(false);
    router.push(`/mockbook/org/${org.id}`);
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
                <h1 className="text-2xl font-bold text-gray-900">MockBook</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Global oversight, AI quotas, and taxonomy management
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => setShowOrgSwitcher(true)}
                  className="btn-primary"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Select Organization
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Org Management Card */}
            <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Manage Organization MockBook</div>
                      <div className="text-sm text-gray-500">Select an organization to manage their MockTests, Packs, Students, and more</div>
                    </div>
                  </div>
                  <Button onClick={() => setShowOrgSwitcher(true)} className="btn-primary">
                    Select Organization
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Total Exams</div>
                      <div className="text-xl font-bold text-gray-900">1,247</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase">AI Credits Used</div>
                      <div className="text-xl font-bold text-gray-900">8,421</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Active Orgs</div>
                      <div className="text-xl font-bold text-gray-900">48</div>
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
                      <div className="text-xs text-gray-500 uppercase">Tests This Month</div>
                      <div className="text-xl font-bold text-gray-900">34,291</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="ai-quotas" className="w-full">
              <TabsList className="bg-white border border-gray-200 rounded-lg p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="ai-quotas" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  AI Quotas
                </TabsTrigger>
                <TabsTrigger value="taxonomy" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  Taxonomy
                </TabsTrigger>
                <TabsTrigger value="marketplace" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  Marketplace
                </TabsTrigger>
                <TabsTrigger value="results" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  Results
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    Overview dashboard coming soon...
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai-quotas" className="mt-6 space-y-4">
                {/* Search and Actions */}
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
                      <Button variant="outline" className="btn-secondary">
                        Bulk Update Plans
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Quotas Table */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Organization</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Plan</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Monthly Limit</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase w-[250px]">Usage</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Resets On</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredQuotaData.map((item) => {
                          const percentage = Math.round((item.usedThisMonth / item.monthlyLimit) * 100);
                          return (
                            <TableRow key={item.orgId} className="hover:bg-brand-primary-tint">
                              <TableCell>
                                <div>
                                  <Link
                                    href={`/organizations/${item.orgId}`}
                                    className="text-sm font-medium text-gray-900 hover:text-brand-primary"
                                  >
                                    {item.organization}
                                  </Link>
                                  <div className="text-xs text-gray-500">{item.orgId}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <PlanBadge plan={item.plan} />
                              </TableCell>
                              <TableCell>
                                <span className="text-sm font-mono">{item.monthlyLimit.toLocaleString()}</span>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <QuotaProgress used={item.usedThisMonth} limit={item.monthlyLimit} />
                                  <div className="text-xs text-gray-500 text-right">{percentage}% used</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">{item.resetsOn}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Edit className="w-4 h-4 mr-2" /> Edit Limit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <RotateCcw className="w-4 h-4 mr-2" /> Reset Quota
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <History className="w-4 h-4 mr-2" /> View History
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="taxonomy" className="mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Subject Hierarchy</CardTitle>
                      <CardDescription>Manage global Subject → Chapter → Topic structure</CardDescription>
                    </div>
                    <Button className="btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Subject
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {taxonomyData.map((subject) => (
                        <TreeItem key={subject.id} name={subject.name} type="subject">
                          {subject.chapters.map((chapter) => (
                            <TreeItem key={chapter.id} name={chapter.name} type="chapter">
                              {chapter.topics.map((topic) => (
                                <TreeItem
                                  key={topic.id}
                                  name={topic.name}
                                  type="topic"
                                  questionCount={topic.questionCount}
                                />
                              ))}
                              <button
                                className="flex items-center gap-2 py-1.5 px-2 text-sm text-brand-primary hover:bg-brand-primary-tint rounded ml-10"
                              >
                                <Plus className="w-3 h-3" />
                                Add Topic
                              </button>
                            </TreeItem>
                          ))}
                          <button
                            className="flex items-center gap-2 py-1.5 px-2 text-sm text-brand-primary hover:bg-brand-primary-tint rounded ml-6"
                          >
                            <Plus className="w-3 h-3" />
                            Add Chapter
                          </button>
                        </TreeItem>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="marketplace" className="mt-6">
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    Premium content marketplace coming soon...
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="results" className="mt-6">
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    Cross-org results analytics coming soon...
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Org Switcher Dialog */}
      <MockBookOrgSwitcher
        open={showOrgSwitcher}
        onSelect={handleOrgSelect}
      />
    </div>
  );
}
