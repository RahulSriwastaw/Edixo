
"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Award,
  Clock,
  Zap,
  CheckCircle2,
  AlertCircle,
  Trophy,
  ChevronRight,
  ArrowRight,
  BarChart3,
  Bookmark,
  Smile,
  Frown,
  User as UserIcon,
  BookOpen,
  Target,
  Download,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function TestResultAnalyticsPage() {
  const [activeSolutionFilter, setActiveSolutionFilter] = useState("all");
  const params = useParams();
  const attemptId = params?.id as string;

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [attemptData, setAttemptData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (attemptId) {
          const attRes = await apiFetch(`/mockbook/attempts/${attemptId}`);
          const data = attRes.data;
          setAttemptData(data || null);

          // Once we have attempt data, we know the testId to fetch the leaderboard
          if (data?.testId) {
            const lbRes = await apiFetch(`/mockbook/${data.testId}/leaderboard`);
            setLeaderboard(lbRes.data || []);
          }
        }
      } catch (err) {
        console.error("Could not fetch attempt analysis:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [attemptId]);


  const overallStats = [
    { label: "Rank", value: attemptData?.rank || "--/--", icon: Trophy, color: "bg-red-500", text: "text-red-500" },
    { label: "Score", value: attemptData?.score ? `${attemptData.score}/${attemptData?.totalMarks}` : "--", icon: Award, color: "bg-purple-500", text: "text-purple-600" },
    { label: "Attempted", value: attemptData?.attempted ? `${attemptData.attempted}/${attemptData?.totalQuestions}` : "--", icon: Zap, color: "bg-blue-500", text: "text-blue-600" },
    { label: "Accuracy", value: attemptData?.accuracy ? `${attemptData.accuracy}%` : "--", icon: CheckCircle2, color: "bg-emerald-500", text: "text-emerald-600" },
    { label: "Percentile", value: attemptData?.percentile ? `${attemptData.percentile}%` : "--", icon: TrendingUp, color: "bg-indigo-500", text: "text-indigo-600" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 md:p-5 bg-white border-b shrink-0">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Analysis & Performance</h1>
                <p className="text-xs text-slate-400 mt-0.5">Detailed sectional summary and rank prediction</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="h-9 px-4 rounded-xl text-sm font-semibold bg-white border-slate-200 gap-2">
                  <Download className="h-4 w-4" /> PDF
                </Button>
                <Button className="h-9 px-4 rounded-xl text-sm font-bold bg-primary shadow-sm shadow-primary/20" onClick={() => window.history.back()}>
                  Re-attempt Test
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="analysis" className="flex-1 flex flex-col overflow-hidden">
            {/* Tab bar */}
            <div className="bg-white border-b sticky top-0 z-30">
              <div className="max-w-7xl mx-auto px-4 md:px-5">
                <TabsList className="h-12 w-full justify-start bg-transparent p-0 gap-6 md:gap-8">
                  {["analysis", "solutions", "leaderboard"].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="h-full rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary font-bold text-sm px-0 uppercase tracking-wider capitalize"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto thin-scrollbar">
              <div className="max-w-7xl mx-auto w-full">

                {/* ANALYSIS TAB */}
                <TabsContent value="analysis" className="m-0 p-4 md:p-5 space-y-5">
                  {loading ? (
                       <div className="py-24 text-center">
                            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
                            <p className="text-sm text-slate-500 font-semibold">Generating Real-time Analysis...</p>
                        </div>
                  ) : !attemptData ? (
                       <div className="py-24 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
                                <BarChart3 className="h-8 w-8 text-slate-300" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">No Attempt Data Found</h3>
                                <p className="text-sm text-slate-500">You haven't completed this test yet or the attempt ID is missing.</p>
                            </div>
                            <Button asChild><Link href="/tests">Go to Tests</Link></Button>
                       </div>
                  ) : (
                  <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {overallStats.map((stat) => (
                      <Card key={stat.label} className="border-none shadow-sm bg-white rounded-2xl">
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className={cn("p-2 rounded-xl text-white shrink-0", stat.color)}>
                            <stat.icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{stat.label}</p>
                            <p className={cn("text-sm font-bold leading-none truncate", stat.text)}>{stat.value}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Cutoff Alert */}
                  <Card className="border-none shadow-sm bg-white rounded-2xl">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
                          <Zap className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">You scored <span className="text-primary italic">23.5 Marks</span> less than cutoff!</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Cutoff: 35.0 | Your Score: 11.5</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100 self-stretch sm:self-auto">
                        <div className="text-center px-3 border-r">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Gap</p>
                          <p className="text-xl font-bold text-red-500">-23.5</p>
                        </div>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl px-4">
                          Unlock Coaching
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-8 space-y-4">
                      {/* Sectional Summary */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="p-4 border-b bg-slate-50/50">
                          <CardTitle className="text-sm font-bold">Sectional Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-slate-50/30">
                                <TableHead className="text-[10px] h-10 font-bold uppercase text-slate-400">Section</TableHead>
                                <TableHead className="text-[10px] h-10 font-bold uppercase text-slate-400">Score</TableHead>
                                <TableHead className="text-[10px] h-10 font-bold uppercase text-center text-slate-400">Accuracy</TableHead>
                                <TableHead className="text-[10px] h-10 font-bold uppercase text-right text-slate-400">Time</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {[
                                { name: "Quantitative Aptitude", score: "11.5/50", accuracy: "85.7%", time: "19:54 / 30m", color: "text-red-500" },
                                { name: "General Intelligence", score: "24.0/50", accuracy: "92.1%", time: "22:10 / 30m", color: "text-emerald-600" },
                                { name: "General Science", score: "18.5/50", accuracy: "78.4%", time: "12:45 / 30m", color: "text-blue-600" },
                              ].map((row) => (
                                <TableRow key={row.name} className="hover:bg-slate-50/50">
                                  <TableCell className="text-sm font-semibold py-3.5 text-slate-700">{row.name}</TableCell>
                                  <TableCell className={cn("text-sm font-bold", row.color)}>{row.score}</TableCell>
                                  <TableCell className="text-center">
                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-[10px] h-5 px-2 font-bold">{row.accuracy}</Badge>
                                  </TableCell>
                                  <TableCell className="text-right text-xs font-mono text-slate-400">{row.time}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>

                      {/* Marks Distribution */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-primary" /> Marks Distribution
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[200px] p-4 pt-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={attemptData?.marksDistribution || []}>

                              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.08} />
                              <XAxis dataKey="marks" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', fontSize: '11px' }} />
                              <Line type="monotone" dataKey="students" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'white' }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="lg:col-span-4 space-y-4">
                      {/* Strengths & Weaknesses */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-bold">Strengths & Weaknesses</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-3">
                          <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 space-y-2">
                            <p className="text-[10px] font-bold text-red-600 uppercase flex items-center gap-1.5">
                              <AlertCircle className="h-3 w-3" /> Critical Weakness
                            </p>
                            <h4 className="text-sm font-bold text-slate-800">Trigonometric Ratios</h4>
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 bg-red-100 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 rounded-full" style={{ width: '12%' }} />
                              </div>
                              <span className="text-xs font-bold text-red-500">12%</span>
                            </div>
                          </div>
                          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 space-y-2">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1.5">
                              <CheckCircle2 className="h-3 w-3" /> Area of Strength
                            </p>
                            <h4 className="text-sm font-bold text-slate-800">Time & Speed</h4>
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 bg-emerald-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
                              </div>
                              <span className="text-xs font-bold text-emerald-500">92%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Rank Predictor */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-bold">Rank Predictor</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="w-full h-9 bg-gradient-to-r from-red-200 via-amber-200 to-emerald-200 rounded-xl relative mb-8">
                            <div className="absolute top-1/2 left-[14%] -translate-y-1/2 w-5 h-5 bg-primary rounded-full border-3 border-white shadow-lg z-10" />
                            <div className="absolute -top-8 left-[14%] -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap">
                              Rank 22972
                            </div>
                          </div>
                          <p className="text-xs text-center text-slate-400 italic">
                            Projected rank: Top 88% of all aspirants
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  </>
                  )}
                </TabsContent>

                {/* SOLUTIONS TAB */}
                <TabsContent value="solutions" className="m-0 p-4 md:p-5 space-y-4">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {[
                      { id: "all", label: "All", count: 25 },
                      { id: "incorrect", label: "Incorrect", count: 2 },
                      { id: "unattempted", label: "Unattempted", count: 23 },
                    ].map((filter) => (
                      <Button
                        key={filter.id}
                        size="sm"
                        onClick={() => setActiveSolutionFilter(filter.id)}
                        className={cn(
                          "rounded-full h-9 px-5 text-sm font-bold transition-all shrink-0",
                          activeSolutionFilter === filter.id ? "bg-primary text-white shadow-sm" : "bg-white text-slate-500 border border-slate-200 hover:border-primary/30"
                        )}
                      >
                        {filter.label} ({filter.count})
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800">Section Name</h3>
                    <p className="text-xs text-slate-400 font-semibold">-- Questions</p>
                  </div>
                  <div className="space-y-3 mt-3">
                    <div className="py-12 bg-white rounded-2xl border-dashed border border-slate-200 text-center">
                      <p className="text-sm font-semibold text-slate-400">Complete the test to view detailed solutions and explanations.</p>
                    </div>
                  </div>

                </TabsContent>

                {/* LEADERBOARD TAB */}
                <TabsContent value="leaderboard" className="m-0 flex flex-col relative pb-20">
                  <div className="p-4 md:p-5 space-y-5">
                    <Button
                      variant="outline"
                      className="w-full max-w-lg mx-auto flex rounded-full h-11 bg-white border-slate-100 shadow-sm items-center justify-center gap-2 group"
                      onClick={() => window.location.reload()}
                    >
                      <span className="text-blue-600 font-bold text-sm">Reattempt Test</span>
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                        <ArrowRight className="h-3.5 w-3.5 text-white" />
                      </div>
                    </Button>

                    {/* Podium */}
                    <div className="relative pt-8 pb-4 px-6 rounded-3xl bg-gradient-to-b from-amber-50 to-yellow-50 border border-amber-100 shadow-sm max-w-xl mx-auto">
                      <div className="flex items-end justify-center gap-6 md:gap-12 min-h-[140px]">
                        {leaderboard.length > 0 ? (
                           <div className="w-full text-center text-sm font-bold text-amber-700">Podium generated from real data...</div>
                        ) : (
                           <div className="text-center text-sm font-semibold text-amber-600/50">Podium data not available yet</div>
                        )}
                      </div>
                    </div>

                    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border-none overflow-hidden mt-4">
                      <div className="divide-y divide-slate-50 relative min-h-[100px]">
                        {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
                        
                        {leaderboard.length === 0 && !loading && (
                            <div className="p-8 text-center text-slate-400 text-sm">No one has completed this test yet. Be the first!</div>
                        )}

                        {leaderboard.map((item, idx) => (
                          <div key={item.id} className="flex items-center justify-between py-3 px-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-300 w-5 text-center">{idx + 1}</span>
                              <Avatar className="h-9 w-9 border border-slate-100">
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{(item.student?.name || '?').charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-semibold text-slate-700">{item.student?.name || 'Anonymous'}</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900">{item.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sticky bottom: Your rank */}
                  <div className="fixed bottom-0 left-0 right-0 p-3 bg-blue-50 border-t border-blue-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-40">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-slate-900">{attemptData?.rank || "--"}</span>
                        <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                          <AvatarFallback className="bg-slate-300 text-white"><UserIcon className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-sm font-bold text-slate-800">Aspirant (You)</span>
                          <div><span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{attemptData?.percentile ? `Top ${100 - attemptData.percentile}%` : "--"}</span></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">{attemptData?.score || "0.0"}/{attemptData?.totalMarks || "0.0"}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Score</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

              </div>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
