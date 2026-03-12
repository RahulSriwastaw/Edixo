"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart3, ChevronRight, Loader2, Trophy, Users,
  TrendingUp, TrendingDown, CheckCircle2, XCircle,
  Clock, Target, Star, Download, Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { MockBookOrgBanner, MockBookOrg } from "@/components/mockbook/MockBookOrgBanner";
import { MockBookOrgSwitcher } from "@/components/mockbook/MockBookOrgSwitcher";
import { cn } from "@/lib/utils";

const getToken = () => {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return m ? m[1] : "";
};

const SCORE_RANGES = [
  { range: "90-100%", count: 0, color: "bg-green-500" },
  { range: "75-89%", count: 0, color: "bg-blue-500" },
  { range: "60-74%", count: 0, color: "bg-yellow-500" },
  { range: "40-59%", count: 0, color: "bg-orange-500" },
  { range: "Below 40%", count: 0, color: "bg-red-500" },
];

const SUBJECTS_PERF = [
  { subject: "Mathematics", avgScore: 0, attempts: 0, color: "blue" },
  { subject: "English Language", avgScore: 0, attempts: 0, color: "green" },
  { subject: "Logical Reasoning", avgScore: 0, attempts: 0, color: "purple" },
  { subject: "General Knowledge", avgScore: 0, attempts: 0, color: "orange" },
  { subject: "Quantitative Aptitude", avgScore: 0, attempts: 0, color: "teal" },
];

export default function ResultsPage() {
  const { isOpen } = useSidebarStore();
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;

  const [mounted, setMounted] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<MockBookOrg | null>(null);
  const [showOrgSwitcher, setShowOrgSwitcher] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  // Real data from backend
  const [stats, setStats] = useState({
    totalAttempts: 0, avgScore: 0, passRate: 0,
    avgDuration: 0, totalStudents: 0, topScore: 0,
  });
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [scoreRanges, setScoreRanges] = useState(SCORE_RANGES);

  useEffect(() => {
    setMounted(true);
    const init = async () => {
      try {
        const token = getToken();
        const [orgRes, leaderboardRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/super-admin/organizations/${orgId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/mockbook/leaderboard?orgId=${orgId}&limit=10`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const orgData = await orgRes.json();
        if (orgData.success) {
          const o = orgData.data;
          setSelectedOrg({ id: o.orgId, name: o.name, plan: o.plan || "SMALL", status: o.status || "ACTIVE", students: o._count?.students || 0, mockTests: o._count?.testAttempts || 0, aiCredits: o.aiCredits || 0 });
          setStats({
            totalAttempts: o._count?.testAttempts || 0,
            avgScore: 0,
            passRate: 0,
            avgDuration: 0,
            totalStudents: o._count?.students || 0,
            topScore: 0,
          });
        } else {
          router.push("/mockbook");
          return;
        }
        if (leaderboardRes.ok) {
          const lb = await leaderboardRes.json();
          if (lb.success) setLeaderboard(lb.data || []);
        }
      } catch { router.push("/mockbook"); }
      finally { setIsLoading(false); }
    };
    init();
  }, [orgId]);

  if (!mounted) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
  if (!selectedOrg) return <div className="min-h-screen flex items-center justify-center p-4"><MockBookOrgSwitcher open={true} onSelect={o => { setSelectedOrg(o); router.push(`/mockbook/org/${o.id}/results`); }} /></div>;

  const MEDAL = ["🥇", "🥈", "🥉"];

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
                <span className="text-gray-900 font-medium">Results & Analytics</span>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Results & Analytics</h1>
                  <p className="text-gray-500 text-sm mt-1">MockTest performance insights for {selectedOrg.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-[140px] input-field"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 3 months</SelectItem>
                      <SelectItem value="365">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="btn-secondary"><Download className="w-4 h-4 mr-2" />Export</Button>
                </div>
              </div>

              {isLoading ? (
                <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" /></div>
              ) : (
                <>
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                      { label: "Total Attempts", value: stats.totalAttempts || selectedOrg.mockTests || 0, icon: Target, color: "purple" },
                      { label: "Active Students", value: stats.totalStudents || selectedOrg.students || 0, icon: Users, color: "blue" },
                      { label: "Avg Score", value: stats.avgScore ? `${stats.avgScore}%` : "—", icon: BarChart3, color: "orange" },
                      { label: "Pass Rate", value: stats.passRate ? `${stats.passRate}%` : "—", icon: CheckCircle2, color: "green" },
                      { label: "Avg Duration", value: stats.avgDuration ? `${stats.avgDuration}m` : "—", icon: Clock, color: "teal" },
                      { label: "Top Score", value: stats.topScore ? `${stats.topScore}%` : "—", icon: Trophy, color: "yellow" },
                    ].map((s, i) => {
                      const Icon = s.icon;
                      const bg: Record<string, string> = { purple: "bg-purple-50", blue: "bg-blue-50", orange: "bg-orange-50", green: "bg-green-50", teal: "bg-teal-50", yellow: "bg-yellow-50" };
                      const tc: Record<string, string> = { purple: "text-purple-600", blue: "text-blue-600", orange: "text-orange-600", green: "text-green-600", teal: "text-teal-600", yellow: "text-yellow-600" };
                      return (
                        <Card key={i} className="kpi-card">
                          <CardContent className="p-4">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", bg[s.color])}>
                              <Icon className={cn("w-4 h-4", tc[s.color])} />
                            </div>
                            <div className="text-xl font-bold text-gray-900">{s.value}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Leaderboard */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500" />Top Performers — Leaderboard</CardTitle>
                        <CardDescription>Students with highest scores this period</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {leaderboard.length === 0 ? (
                          <div className="py-10 text-center text-gray-400">
                            <Trophy className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                            <p className="text-sm">No test attempts yet. Leaderboard will populate as students take tests.</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {leaderboard.map((entry: any, i: number) => (
                              <div key={entry.id || i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-orange-50 text-orange-700">
                                  {i < 3 ? MEDAL[i] : i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 text-sm truncate">{entry.studentName || entry.name || "Student"}</div>
                                  <div className="text-xs text-gray-500">{entry.attempts || 0} attempts</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-gray-900">{entry.avgScore || entry.score || 0}%</div>
                                  <div className="text-xs text-gray-500">avg score</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Score Distribution */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-500" />Score Distribution</CardTitle>
                        <CardDescription>How students performed across score ranges</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {scoreRanges.map((range, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">{range.range}</span>
                              <span className="font-medium text-gray-900">{range.count} students</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={cn("h-2 rounded-full", range.color)}
                                style={{ width: `${range.count > 0 ? (range.count / Math.max(...scoreRanges.map(r => r.count), 1)) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        ))}
                        {scoreRanges.every(r => r.count === 0) && (
                          <div className="py-8 text-center text-sm text-gray-400">
                            Score distribution will appear here as students attempt tests.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Subject Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Subject-wise Performance</CardTitle>
                      <CardDescription>Average scores by subject area across all MockTests</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {SUBJECTS_PERF.map((sub, i) => {
                          const tc: Record<string, string> = { blue: "text-blue-600", green: "text-green-600", purple: "text-purple-600", orange: "text-orange-600", teal: "text-teal-600" };
                          const bg: Record<string, string> = { blue: "bg-blue-50", green: "bg-green-50", purple: "bg-purple-50", orange: "bg-orange-50", teal: "bg-teal-50" };
                          return (
                            <div key={i} className="flex items-center gap-4">
                              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", bg[sub.color])}>
                                <Target className={cn("w-4 h-4", tc[sub.color])} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="font-medium text-gray-900">{sub.subject}</span>
                                  <span className="text-gray-500">{sub.avgScore}% avg</span>
                                </div>
                                <Progress value={sub.avgScore} className="h-1.5" />
                              </div>
                              <div className="text-xs text-gray-400 w-20 text-right">{sub.attempts} attempts</div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-xl text-center text-sm text-gray-400">
                        Subject-wise breakdown will populate after students attempt MockTests in this organization.
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </main>
        </MockBookOrgBanner>
      </div>

      <MockBookOrgSwitcher open={showOrgSwitcher} onSelect={o => { setSelectedOrg(o); setShowOrgSwitcher(false); router.push(`/mockbook/org/${o.id}/results`); }} recentOrgs={selectedOrg ? [selectedOrg] : []} />
    </div>
  );
}
