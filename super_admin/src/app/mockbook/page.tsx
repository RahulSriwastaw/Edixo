"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockbookService, MockBookStats, ExamFolder } from "@/services/mockbookService";
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
  TrendingUp,
  ArrowRight,
  FileText,
  Users,
  BarChart3,
  IndianRupee,
  Radio,
  Star,
  Tag,
  CheckCircle2,
  XCircle,
  Play,
  Eye,
  Copy,
  Package,
  Layers,
  Globe,
  LayoutGrid,
  BadgePercent,
  Zap,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";

// ─────────────────────────────────────────────
// Helper Components
// ─────────────────────────────────────────────

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    Small: "badge-small",
    Medium: "badge-medium",
    Large: "badge-large",
    Enterprise: "badge-enterprise",
  };
  return <span className={`badge ${styles[plan] || "bg-gray-50 text-gray-700"} capitalize`}>{plan?.toLowerCase() || 'Small'}</span>;
}

function QuotaProgress({ used, limit }: { used: number; limit: number }) {
  if (limit === 0) return <span>No limit data</span>;
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

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    active: { label: "Active", cls: "bg-green-50 text-green-700 border-green-200" },
    draft: { label: "Draft", cls: "bg-gray-50 text-gray-600 border-gray-200" },
    scheduled: { label: "Scheduled", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    archived: { label: "Archived", cls: "bg-red-50 text-red-600 border-red-200" },
    live: { label: "Live", cls: "bg-red-50 text-red-700 border-red-200" },
  };
  const { label, cls } = cfg[status] || cfg.draft;
  return <Badge variant="outline" className={cn("text-[10px]", cls)}>{label}</Badge>;
}

// ─────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────
interface DashboardSeries {
  id: string;
  folderId: string;
  name: string;
  category?: { name: string };
  _count?: { mockTests: number; attempts: number };
  price: number | null;
  isActive: boolean;
  isFeatured: boolean;
  isFree: boolean;
  createdAt: string;
}



interface DashboardLiveTest {
  id: string;
  name: string;
  subCategory?: { category?: { name: string } };
  _count?: { attempts: number };
  status: string;
  scheduledAt: string | null;
  endsAt: string | null;
  durationMins: number;
  totalMarks: number;
}



// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const examCategories = [
  { id: "C1", name: "SSC", color: "bg-orange-100 text-orange-700 border-orange-200", icon: "📋" },
  { id: "C2", name: "Banking", color: "bg-blue-100 text-blue-700 border-blue-200", icon: "🏦" },
  { id: "C3", name: "Railways", color: "bg-green-100 text-green-700 border-green-200", icon: "🚂" },
  { id: "C4", name: "NEET", color: "bg-red-100 text-red-700 border-red-200", icon: "⚕️" },
  { id: "C5", name: "JEE", color: "bg-purple-100 text-purple-700 border-purple-200", icon: "⚛️" },
  { id: "C6", name: "UPSC", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: "🏛️" },
];


// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function MockBookPage() {
  const { isOpen } = useSidebarStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [seriesSearch, setSeriesSearch] = useState("");
  const [seriesCategoryFilter, setSeriesCategoryFilter] = useState("all");
  const [seriesStatusFilter, setSeriesStatusFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<MockBookStats | null>(null);
  const [folders, setFolders] = useState<ExamFolder[]>([]);
  const [realSeries, setRealSeries] = useState<DashboardSeries[]>([]);
  const [liveTests, setLiveTests] = useState<DashboardLiveTest[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [statsRes, foldersRes, seriesRes, liveRes] = await Promise.all([
          mockbookService.getStats(),
          mockbookService.getFolders(),
          mockbookService.getSeries(),
          mockbookService.getLiveAndScheduledTests()
        ]);
        setStats(statsRes);
        setFolders(foldersRes);
        setRealSeries(seriesRes);
        setLiveTests(liveRes.live || []);
      } catch (error) {
        console.error("Failed to fetch mockbook data:", error);
        toast.error("Failed to load platform data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);


  const dashboardStats = [
    {
      label: "Platform Tests",
      value: stats?.platformTests?.toString() || "0",
      change: "+12%",
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      label: "Total Series",
      value: stats?.totalSeries?.toString() || "0",
      change: "+3 new",
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      label: "Total Attempts",
      value: stats?.totalAttempts?.toLocaleString() || "0",
      change: "+24% vs LW",
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      label: "Active Students",
      value: stats?.activeStudents?.toLocaleString() || "0",
      change: "+1.2k today",
      icon: Users,
      color: "text-orange-600",
      bg: "bg-orange-50"
    },
    {
      label: "Live Right Now",
      value: stats?.liveNow?.toString() || "0",
      change: "Peak 1.2k",
      icon: Zap,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      label: "Revenue (MTD)",
      value: `₹${(stats?.revenueMTD || 0).toLocaleString()}`,
      change: "+18.4%",
      icon: TrendingUp,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
  ];

  const filteredSeries = realSeries.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(seriesSearch.toLowerCase());
    const matchCat = seriesCategoryFilter === "all" || s.category?.name === seriesCategoryFilter;
    const matchStatus = seriesStatusFilter === "all" || 
      (seriesStatusFilter === "active" && s.isActive) || 
      (seriesStatusFilter === "draft" && !s.isActive);
    return matchSearch && matchCat && matchStatus;
  });



  const liveCount = liveTests.length;


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
                <h1 className="text-2xl font-bold text-gray-900">MockBook</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Platform-wide test series, live tests, pricing, and analytics
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" asChild>
                  <Link href="/mockbook/categories">
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    Categories
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/mockbook/featured">
                    <Star className="w-4 h-4 mr-2" />
                    Featured
                  </Link>
                </Button>
                <Button className="btn-primary" asChild>
                  <Link href="/mockbook/test-series/create">
                    <Plus className="w-4 h-4 mr-2" />
                    New Test Series
                  </Link>
                </Button>
              </div>
            </div>


            {/* KPI Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {dashboardStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="kpi-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${stat.color.split(" ")[0]}`}>
                          <Icon className={`w-4 h-4 ${stat.color.split(" ")[1]}`} />
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase leading-tight">{stat.label}</div>
                          <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="test-series" className="w-full">
              <TabsList className="bg-white border border-gray-200 rounded-lg p-1 flex-wrap h-auto gap-1">
                {[
                  { value: "test-series", label: "Test Series" },
                  { value: "live-tests", label: "Live Tests" },
                  { value: "pricing", label: "Pricing" },
                  { value: "analytics", label: "Analytics" },
                ].map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-brand-primary data-[state=active]:text-white text-sm">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* ─── TEST SERIES TAB ─── */}
              <TabsContent value="test-series" className="mt-6 space-y-4">
                {/* Filter Bar */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search series..."
                          value={seriesSearch}
                          onChange={(e) => setSeriesSearch(e.target.value)}
                          className="pl-9 input-field"
                        />
                      </div>
                      <Select value={seriesCategoryFilter} onValueChange={setSeriesCategoryFilter}>
                        <SelectTrigger className="w-[150px] input-field">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {examCategories.map(c => (
                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={seriesStatusFilter} onValueChange={setSeriesStatusFilter}>
                        <SelectTrigger className="w-[130px] input-field">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="ml-auto">
                        <Button className="btn-primary" asChild>
                          <Link href="/mockbook/test-series/create">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Series
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Series List */}
                <div className="space-y-3">
                  {filteredSeries.map((series) => (
                    <Card key={series.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                              <BookOpen className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-900">{series.name}</span>
                                <Badge className={cn(
                                  "text-[10px] px-2 py-0.5",
                                  series.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"
                                )}>
                                  {series.isActive ? "ACTIVE" : "INACTIVE"}
                                </Badge>
                                {series.isFeatured && (
                                  <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px]">
                                    <Star className="w-2.5 h-2.5 mr-1" />Featured
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-[10px]">{series.category?.name || "General"}</Badge>

                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <FileText className="w-3.5 h-3.5" />
                                  {(series._count?.mockTests || 0).toLocaleString()} tests
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5" />
                                  {(series._count?.attempts || 0).toLocaleString()} enrolled
                                </span>
                                <span className={cn("flex items-center gap-1", series.isFree ? "text-green-600 font-medium" : "text-gray-500")}>
                                  <CheckCircle2 className={cn("w-3.5 h-3.5", series.isFree ? "text-green-500" : "text-gray-400")} />
                                  {series.isFree ? "All Free" : "Premium"}
                                </span>

                                <span className="text-gray-400">ID: {series.id}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right mr-2">
                              {series.price === 0 ? (
                                <span className="text-green-600 font-semibold text-sm">Free</span>
                              ) : (
                                <span className="font-semibold text-gray-900">₹{series.price}</span>
                              )}
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/mockbook/test-series/${series.id}`}>
                                <Eye className="w-3.5 h-3.5 mr-1" />
                                Manage
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" /> Edit Series
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="w-4 h-4 mr-2" /> Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Star className="w-4 h-4 mr-2" /> {series.isFeatured ? "Remove from Featured" : "Set as Featured"}
                                </DropdownMenuItem>

                                <DropdownMenuItem>
                                  <BarChart3 className="w-4 h-4 mr-2" /> Analytics
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <IndianRupee className="w-4 h-4 mr-2" /> Pricing
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Globe className="w-4 h-4 mr-2" /> View on Platform
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete Series
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredSeries.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <div className="text-gray-500 font-medium">No series found</div>
                      <div className="text-gray-400 text-sm mt-1">Try adjusting your filters or create a new series</div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* ─── LIVE TESTS TAB ─── */}
              <TabsContent value="live-tests" className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Live Tests</h2>
                    <p className="text-sm text-gray-500">{liveCount} tests currently live</p>
                  </div>
                  <Button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Live Test
                  </Button>
                </div>

                {/* Live Now */}
                {liveTests.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-sm font-semibold text-red-600">LIVE NOW ({liveTests.length})</span>
                    </div>

                    <div className="space-y-3">
                      {liveTests.map((test) => (
                        <Card key={test.id} className="border-red-200 bg-red-50/30">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-red-500 text-white text-[10px] animate-pulse">🔴 LIVE</Badge>
                                  <span className="font-semibold text-gray-900">{test.name}</span>
                                </div>
                                <div className="text-sm text-gray-500 mt-1 flex items-center gap-3">
                                  <span>{test.durationMins} Mins · {test.totalMarks} Marks</span>
                                  <span>·</span>
                                  <span className="text-red-600 font-medium">{(test._count?.attempts || 0).toLocaleString()} attempts</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-0.5">
                                  {test.subCategory?.category?.name || "Series"} · 
                                  {test.scheduledAt ? new Date(test.scheduledAt).toLocaleTimeString() : ""} – 
                                  {test.endsAt ? new Date(test.endsAt).toLocaleTimeString() : ""}
                                </div>

                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/mockbook/mock-tests/${test.id}`}>
                                    <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                  </div>
                )}

                {/* Scheduled */}
                <div>
                  <div className="space-y-3 p-12 text-center bg-gray-50 rounded-lg border border-dashed text-gray-400">
                    <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No upcoming live tests scheduled</p>
                  </div>

                </div>
              </TabsContent>

              {/* ─── FREE QUIZZES TAB ─── */}
              <TabsContent value="free-quizzes" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Free Quizzes</CardTitle>
                    <CardDescription>Manage free quiz tests available on the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { name: "Daily GK Booster — March 11", questions: 10, attempts: 38450, status: "live" },
                        { name: "CA Booster March Week 2", questions: 25, attempts: 29100, status: "active" },
                        { name: "SSC CGL Free Mock 1", questions: 100, attempts: 45230, status: "active" },
                        { name: "NEET Biology Quick Test", questions: 20, attempts: 18900, status: "active" },
                        { name: "RRB NTPC Free CBT 1 Mock", questions: 100, attempts: 61540, status: "active" },
                        { name: "Banking Awareness Weekly", questions: 15, attempts: 12300, status: "draft" },
                      ].map((quiz, i) => (
                        <Card key={i} className="border hover:shadow-sm transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <StatusBadge status={quiz.status} />
                              <Badge variant="outline" className="text-[10px]">Free</Badge>
                            </div>
                            <div className="font-medium text-gray-900 text-sm mt-2">{quiz.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{quiz.questions} questions</div>
                            <div className="text-xs text-orange-600 font-medium mt-1">{quiz.attempts.toLocaleString()} attempts</div>
                            <div className="flex gap-2 mt-3">
                              <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">Edit</Button>
                              <Button variant="ghost" size="sm" className="h-7 text-xs">Analytics</Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ─── PYQ BANK TAB ─── */}
              <TabsContent value="pyq-bank" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">PYQ Bank</CardTitle>
                        <CardDescription>Import and manage Previous Year Question papers</CardDescription>
                      </div>
                      <Button className="btn-primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Import PYQ Paper
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { exam: "SSC CGL", years: ["2025", "2024", "2023", "2022"], papers: 32 },
                        { exam: "IBPS PO", years: ["2024", "2023", "2022"], papers: 18 },
                        { exam: "RRB NTPC", years: ["2022", "2021", "2019"], papers: 24 },
                        { exam: "NEET UG", years: ["2025", "2024", "2023", "2022", "2021"], papers: 15 },
                      ].map((bank, i) => (
                        <Card key={i} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="font-semibold text-gray-900">{bank.exam}</div>
                              <Badge variant="outline">{bank.papers} papers</Badge>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {bank.years.map(y => (
                                <Badge key={y} variant="secondary" className="text-[10px]">{y}</Badge>
                              ))}
                            </div>
                            <Button variant="outline" size="sm" className="mt-3 w-full h-7 text-xs">
                              Manage Papers
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ─── PRICING TAB ─── */}
              <TabsContent value="pricing" className="mt-6 space-y-6">
                {/* Series Pricing */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Series Pricing</CardTitle>
                        <CardDescription>Manage individual series prices and validity</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Series</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Category</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Price</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Validity</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Free Tests</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {realSeries.map((series) => (
                          <TableRow key={series.id} className="hover:bg-orange-50/30">
                            <TableCell>
                              <div className="font-medium text-gray-900 text-sm">{series.name}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px]">{series.category?.name || "General"}</Badge>
                            </TableCell>
                            <TableCell>
                              {series.price === 0 || series.price === null ? (
                                <span className="text-green-600 font-semibold text-sm">Free</span>
                              ) : (
                                <span className="font-semibold text-gray-900">₹{series.price}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">Lifetime</TableCell>
                            <TableCell className="text-sm text-gray-600">{series.isFree ? "All" : "0"}</TableCell>
                            <TableCell className="text-right">

                              <Button variant="outline" size="sm" className="h-7 text-xs">
                                <Edit className="w-3 h-3 mr-1" /> Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Pass Subscription */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="w-5 h-5 text-orange-500" />
                        Pass Subscription
                      </CardTitle>
                      <CardDescription>All-access subscription plans</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { plan: "Monthly Pass", price: 99, unit: "month", saves: null },
                        { plan: "Yearly Pass", price: 799, unit: "year", saves: "Save ₹389 vs monthly" },
                      ].map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:border-orange-300">
                          <div>
                            <div className="font-medium text-gray-900">{p.plan}</div>
                            {p.saves && <div className="text-xs text-green-600 mt-0.5">{p.saves}</div>}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-bold">₹{p.price}<span className="text-sm font-normal text-gray-500">/{p.unit}</span></div>
                            <Button variant="outline" size="sm" className="h-7 text-xs">
                              <Edit className="w-3 h-3 mr-1" /> Edit
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Coupon Codes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BadgePercent className="w-5 h-5 text-blue-500" />
                        Coupon Codes
                      </CardTitle>
                      <CardDescription>Discount codes and offers</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { code: "NEWUSER20", discount: "20% off", usage: "1,234 used", status: "active" },
                        { code: "MARCH15", discount: "₹150 off", usage: "456 used", status: "active" },
                        { code: "SUMMER25", discount: "25% off", usage: "0 used", status: "draft" },
                      ].map((coupon, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-mono font-semibold text-gray-900">{coupon.code}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{coupon.discount} · {coupon.usage}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={coupon.status} />
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full h-8 text-sm mt-1">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Coupon
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* ─── ANALYTICS TAB ─── */}
              <TabsContent value="analytics" className="mt-6 space-y-6">
                {/* Date Range */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Platform Analytics</h2>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-[160px] input-field">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Analytics KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Daily Active Users", value: "12,450", change: "+12%", positive: true },
                    { label: "Tests Attempted", value: "45,230", change: "+8%", positive: true },
                    { label: "New Enrollments", value: "1,234", change: "+23%", positive: true },
                    { label: "Revenue", value: "₹2,34,500", change: "+15%", positive: true },
                  ].map((kpi) => (
                    <Card key={kpi.label} className="kpi-card">
                      <CardContent className="p-4">
                        <div className="text-xs text-gray-500 uppercase">{kpi.label}</div>
                        <div className="text-xl font-bold text-gray-900 mt-1">{kpi.value}</div>
                        <div className={`text-xs mt-1 ${kpi.positive ? "text-green-500" : "text-red-500"}`}>
                          {kpi.change} vs prev period
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top by Enrollment */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Top Series by Enrollment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {realSeries.length === 0 ? (
                        <div className="text-sm text-gray-400 py-6 text-center italic">No series data available</div>
                      ) : (
                        realSeries
                          .slice()
                          .sort((a, b) => (b._count?.attempts || 0) - (a._count?.attempts || 0))
                          .slice(0, 5)
                          .map((s, i) => {
                            const maxEnroll = Math.max(...realSeries.map(rs => rs._count?.attempts || 0)) || 1;
                            const enrollment = s._count?.attempts || 0;
                            return (
                              <div key={s.id} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center shrink-0">
                                  {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">{s.name}</div>
                                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                                    <div
                                      className="bg-orange-400 h-1.5 rounded-full"
                                      style={{ width: `${(enrollment / maxEnroll) * 100}%` }}
                                    />
                                  </div>
                                </div>
                                <div className="text-sm font-semibold text-gray-700 shrink-0">{enrollment.toLocaleString()}</div>
                              </div>
                            );
                          })
                      )}
                    </CardContent>
                  </Card>


                  {/* Revenue Breakdown */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Revenue Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {[
                          { label: "Individual Purchases", amount: "₹1,45,000", pct: 62, color: "bg-orange-400" },
                          { label: "Pass Subscriptions", amount: "₹89,500", pct: 38, color: "bg-blue-400" },
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700">{item.label}</span>
                              <span className="font-semibold">{item.amount} ({item.pct}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3">
                              <div className={`${item.color} h-3 rounded-full`} style={{ width: `${item.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-3">
                        <div className="text-sm font-semibold text-gray-900 flex justify-between">
                          <span>Total Revenue</span>
                          <span>₹2,34,500</span>
                        </div>
                      </div>

                      {/* Top Attempted */}
                      <div className="border-t pt-3">
                        <div className="text-sm font-semibold text-gray-700 mb-2">Top by Attempts</div>
                        {[
                          { name: "SSC CGL Full Mock 1", attempts: 45230 },
                          { name: "Daily GK Booster", attempts: 38450 },
                          { name: "CA Booster March", attempts: 29100 },
                        ].map((t, i) => (
                          <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-50">
                            <span className="text-gray-600 truncate max-w-[200px]">{t.name}</span>
                            <span className="font-medium">{t.attempts.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" asChild>
                    <Link href="/mockbook/analytics">
                      View Full Analytics
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </TabsContent>

            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
