
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
  const [reportData, setReportData] = useState<any>(null);
  const [allAttempts, setAllAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (attemptId) {
          const attRes = await apiFetch(`/mockbook/attempts/${attemptId}`);
          const data = attRes.data;
          setAttemptData(data || null);

          if (data?.testId) {
            // Fetch leaderboard, my attempts, and detailed report concurrently
            const [lbRes, myAttRes, reportRes] = await Promise.all([
              apiFetch(`/mockbook/${data.testId}/leaderboard`),
              apiFetch(`/mockbook/tests/${data.testId}/my-attempts`),
              apiFetch(`/mockbook/attempts/${attemptId}/report`)
            ]);
            setLeaderboard(lbRes.data || []);
            setAllAttempts(myAttRes.data || []);
            setReportData(reportRes.data || null);
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
                <p className="text-xs text-slate-400 mt-0.5">Attempt #{attemptData?.attemptNumber || 1} • {attemptData?.testName}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="h-9 px-4 rounded-xl text-sm font-semibold bg-white border-slate-200 gap-2">
                  <Download className="h-4 w-4" /> PDF
                </Button>
                {attemptData?.testId && (
                  <Button asChild className="h-9 px-4 rounded-xl text-sm font-bold bg-primary shadow-sm shadow-primary/20">
                    <Link href={`/tests/instructions?testId=${attemptData.testId}`}>Re-attempt Test</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Multiple Attempts Tabs */}
          {allAttempts.length > 1 && (
             <div className="bg-slate-50 border-b overflow-x-auto no-scrollbar">
                <div className="max-w-7xl mx-auto px-4 md:px-5 flex gap-2 py-2">
                   {allAttempts.map((att) => (
                      <Link key={att.id} href={`/tests/results/${att.id}`}>
                         <Badge 
                            variant="outline" 
                            className={cn(
                               "px-3 py-1.5 cursor-pointer text-xs font-bold rounded-lg transition-colors border-transparent",
                               att.id === attemptId 
                                ? "bg-primary text-white" 
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                            )}>
                            Attempt {att.attemptNumber}
                         </Badge>
                      </Link>
                   ))}
                </div>
             </div>
          )}

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

                  {/* Cutoff Alert / Topper Comparison */}
                  <Card className="border-none shadow-sm bg-white rounded-2xl">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shrink-0">
                          <Trophy className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">
                             Topper scored <span className="text-primary italic">{attemptData?.topperScore || 0} marks</span>
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">Top ranker: {attemptData?.topperName || 'Anonymous'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100 self-stretch sm:self-auto">
                        <div className="text-center px-3 border-r">
                           <p className="text-[10px] font-bold text-slate-400 uppercase">Your Gap</p>
                           <p className="text-xl font-bold text-orange-500">
                             -{Math.max(0, (attemptData?.topperScore || 0) - (attemptData?.score || 0)).toFixed(1)}
                           </p>
                        </div>
                        <div className="text-center px-3 border-r">
                           <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Score</p>
                           <p className="text-xl font-bold text-slate-700">{attemptData?.avgScore || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-8 space-y-4">
                      {/* Overall Performance Comparison */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="p-4 border-b bg-slate-50/50">
                          <CardTitle className="text-sm font-bold">Compare with Others</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-slate-50/30">
                                <TableHead className="text-[10px] h-10 font-bold uppercase text-slate-400">Metric</TableHead>
                                <TableHead className="text-[10px] h-10 font-bold uppercase text-slate-400">You</TableHead>
                                <TableHead className="text-[10px] h-10 font-bold uppercase text-center text-slate-400 text-amber-600">Topper</TableHead>
                                <TableHead className="text-[10px] h-10 font-bold uppercase text-right text-slate-400">Average</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow className="hover:bg-slate-50/50">
                                <TableCell className="text-sm font-semibold py-3.5 text-slate-700">Score</TableCell>
                                <TableCell className="text-sm font-bold text-primary">{attemptData?.score}</TableCell>
                                <TableCell className="text-center text-sm font-bold text-amber-600">{attemptData?.topperScore}</TableCell>
                                <TableCell className="text-right text-sm font-semibold text-slate-500">{attemptData?.avgScore}</TableCell>
                              </TableRow>
                              <TableRow className="hover:bg-slate-50/50">
                                <TableCell className="text-sm font-semibold py-3.5 text-slate-700">Correct Qs</TableCell>
                                <TableCell className="text-sm font-bold text-emerald-600">{attemptData?.correct}</TableCell>
                                <TableCell className="text-center text-sm font-bold text-slate-500">--</TableCell>
                                <TableCell className="text-right text-sm font-semibold text-slate-500">--</TableCell>
                              </TableRow>
                              <TableRow className="hover:bg-slate-50/50">
                                <TableCell className="text-sm font-semibold py-3.5 text-slate-700">Accuracy</TableCell>
                                <TableCell className="text-sm font-bold text-blue-600">{attemptData?.accuracy}%</TableCell>
                                <TableCell className="text-center text-sm font-bold text-slate-500">--</TableCell>
                                <TableCell className="text-right text-sm font-semibold text-slate-500">--</TableCell>
                              </TableRow>
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
                              {attemptData?.marksDistribution?.length > 0 ? (
                                <LineChart data={attemptData.marksDistribution}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.08} />
                                  <XAxis dataKey="marks" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                  <YAxis dataKey="students" allowDecimals={false} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', fontSize: '11px' }} formatter={(value) => [value, "Students"]} labelFormatter={(label) => `Score: ${label}`} />
                                  <Line type="monotone" dataKey="students" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'white' }} />
                                </LineChart>
                              ) : (
                                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold italic">
                                  Not enough data for marks distribution.
                                </div>
                              )}
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
                              <AlertCircle className="h-3 w-3" /> Needs Improvement
                            </p>
                            <h4 className="text-sm font-bold text-slate-800">Incorrect Attempts</h4>
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 bg-red-100 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.round((attemptData?.incorrect || 0)/(attemptData?.totalQuestions || 1)*100)}%` }} />
                              </div>
                              <span className="text-xs font-bold text-red-500">{attemptData?.incorrect || 0} Qs</span>
                            </div>
                          </div>
                          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 space-y-2">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1.5">
                              <CheckCircle2 className="h-3 w-3" /> Area of Strength
                            </p>
                            <h4 className="text-sm font-bold text-slate-800">Correct Answers</h4>
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 bg-emerald-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round((attemptData?.correct || 0)/(attemptData?.totalQuestions || 1)*100)}%` }} />
                              </div>
                              <span className="text-xs font-bold text-emerald-500">{attemptData?.correct || 0} Qs</span>
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
                            <div className="absolute top-1/2 left-[14%] -translate-y-1/2 w-5 h-5 bg-primary rounded-full border-3 border-white shadow-lg z-10" style={{ left: `${Math.max(5, 100 - (attemptData?.percentile || 0))}%` }} />
                            <div className="absolute -top-8 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap" style={{ left: `${Math.max(5, 100 - (attemptData?.percentile || 0))}%` }}>
                              Rank {attemptData?.rank || "--"}
                            </div>
                          </div>
                          <p className="text-xs text-center text-slate-400 italic">
                            Projected standing: Top {100 - (attemptData?.percentile || 100)}% of {attemptData?.totalStudents || 1} aspirants
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
                      { id: "all", label: "All", count: reportData?.solutions?.length || 0 },
                      { id: "CORRECT", label: "Correct", count: reportData?.ringStats?.correct || 0 },
                      { id: "INCORRECT", label: "Incorrect", count: reportData?.ringStats?.incorrect || 0 },
                      { id: "UNATTEMPTED", label: "Unattempted", count: reportData?.ringStats?.unattempted || 0 },
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

                  <div className="space-y-6 mt-4">
                    {loading ? (
                         <div className="py-20 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></div>
                    ) : (reportData?.solutions || [])
                      .filter((sol: any) => activeSolutionFilter === "all" || sol.status === activeSolutionFilter)
                      .map((sol: any, idx: number) => {
                        const q = sol.question;
                        const isSelected = (optId: string) => sol.selectedOptions?.includes(optId);
                        const isCorrect = (opt: any) => opt.isCorrect;

                        return (
                          <Card key={sol.id} className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <div className="p-4 bg-slate-50/50 border-b flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black",
                                  sol.status === 'CORRECT' ? "bg-emerald-100 text-emerald-700" : 
                                  sol.status === 'INCORRECT' ? "bg-red-100 text-red-700" : "bg-slate-200 text-slate-500"
                                )}>
                                  Q{idx + 1}
                                </span>
                                <Badge variant="outline" className={cn(
                                  "text-[10px] font-bold border-none",
                                  sol.status === 'CORRECT' ? "bg-emerald-50 text-emerald-700" : 
                                  sol.status === 'INCORRECT' ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-500"
                                )}>
                                  {sol.status}
                                </Badge>
                              </div>
                              <div className="text-[10px] font-bold text-slate-500">
                                {sol.marksAwarded > 0 ? `+${sol.marksAwarded}` : sol.marksAwarded} Marks
                              </div>
                            </div>
                            <CardContent className="p-5 space-y-4">
                              <div className="text-sm font-medium text-slate-800 leading-relaxed q-content" dangerouslySetInnerHTML={{ __html: q?.textEn || '' }} />
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {q?.options?.map((opt: any, optIdx: number) => {
                                  const selected = isSelected(opt.id);
                                  const correct = isCorrect(opt);
                                  
                                  let state = "neutral";
                                  if (selected && correct) state = "correct";
                                  else if (selected && !correct) state = "incorrect";
                                  else if (!selected && correct) state = "should-have";

                                  return (
                                    <div 
                                      key={opt.id} 
                                      className={cn(
                                        "p-3.5 rounded-xl border-2 transition-all flex items-start gap-3",
                                        state === "correct" ? "bg-emerald-50 border-emerald-500" :
                                        state === "incorrect" ? "bg-red-50 border-red-500" :
                                        state === "should-have" ? "bg-emerald-50/30 border-dashed border-emerald-300" :
                                        "bg-white border-slate-100"
                                      )}
                                    >
                                      <div className={cn(
                                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5",
                                        state === "correct" ? "bg-emerald-500 text-white" :
                                        state === "incorrect" ? "bg-red-500 text-white" :
                                        state === "should-have" ? "bg-emerald-100 text-emerald-600" :
                                        "bg-slate-100 text-slate-500"
                                      )}>
                                        {String.fromCharCode(65 + optIdx)}
                                      </div>
                                      <div className="text-[13px] font-medium text-slate-700 flex-1 leading-normal" dangerouslySetInnerHTML={{ __html: opt.textEn || '' }} />
                                      {state === "correct" && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                                      {state === "incorrect" && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
                                    </div>
                                  );
                                })}
                              </div>

                              {(q?.explanationEn || q?.explanationHi) && (
                                <div className="mt-4 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/50">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-3.5 h-3.5 text-indigo-600" />
                                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Step-by-step Solution</span>
                                  </div>
                                  <div className="text-[13px] text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: q.explanationEn || q.explanationHi || '' }} />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    {(!reportData?.solutions || reportData.solutions.length === 0) && !loading && (
                      <div className="py-12 bg-white rounded-2xl border-dashed border border-slate-200 text-center">
                        <p className="text-sm font-semibold text-slate-400 font-medium">No solutions found for this attempt.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* LEADERBOARD TAB */}
                <TabsContent value="leaderboard" className="m-0 flex flex-col relative pb-20">
                  <div className="p-4 md:p-5 space-y-5">
                    <Button
                      variant="outline"
                      className="w-full max-w-lg mx-auto flex rounded-full h-11 bg-white border-slate-100 shadow-sm items-center justify-center gap-2 group"
                      asChild
                    >
                      <Link href={attemptData?.testId ? `/tests/instructions?testId=${attemptData.testId}` : "#"}>
                          <span className="text-blue-600 font-bold text-sm">Reattempt Test</span>
                          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                            <ArrowRight className="h-3.5 w-3.5 text-white" />
                          </div>
                      </Link>
                    </Button>

                    {/* Podium */}
                    <div className="relative pt-8 pb-4 px-6 rounded-3xl bg-gradient-to-b from-amber-50 to-yellow-50 border border-amber-100 shadow-sm max-w-xl mx-auto">
                      <div className="flex items-end justify-center gap-6 md:gap-12 min-h-[140px]">
                        {leaderboard.length >= 3 ? (
                           <>
                             {/* Rank 2 */}
                             <div className="flex flex-col items-center justify-end w-24">
                                <Avatar className="h-12 w-12 border-2 border-slate-200 mb-2 shadow-sm"><AvatarFallback className="bg-slate-100 font-bold text-slate-500">{(leaderboard[1]?.student?.name || '?').charAt(0)}</AvatarFallback></Avatar>
                                <span className="text-[10px] font-bold text-slate-600 truncate w-full text-center px-1">{leaderboard[1]?.student?.name?.split(' ')[0] || 'Aspirant'}</span>
                                <span className="text-xs font-bold text-slate-800 mb-2">{leaderboard[1].score} <span className="text-[10px] text-slate-400">pts</span></span>
                                <div className="w-full h-16 bg-slate-200/50 rounded-t-xl flex items-start justify-center pt-2">
                                  <span className="text-sm font-black text-slate-400">2</span>
                                </div>
                             </div>
                             {/* Rank 1 */}
                             <div className="flex flex-col items-center justify-end w-28 z-10 relative -mt-4">
                                <div className="absolute -top-3 w-8 h-8 rounded-full bg-amber-100 text-amber-500 border border-amber-200 flex items-center justify-center shadow-sm z-20">
                                   <Trophy className="h-4 w-4" />
                                </div>
                                <Avatar className="h-16 w-16 border-2 border-amber-300 mb-2 shadow-md relative z-10"><AvatarFallback className="bg-amber-50 font-bold text-amber-600 text-lg">{(leaderboard[0]?.student?.name || '?').charAt(0)}</AvatarFallback></Avatar>
                                <span className="text-xs font-bold text-amber-700 truncate w-full text-center px-1">{leaderboard[0]?.student?.name?.split(' ')[0] || 'Aspirant'}</span>
                                <span className="text-sm font-black text-slate-900 mb-2">{leaderboard[0].score} <span className="text-[10px] text-slate-500 font-bold">pts</span></span>
                                <div className="w-full h-24 bg-gradient-to-t from-amber-300 to-amber-200 rounded-t-xl shadow-inner flex items-start justify-center pt-2">
                                  <span className="text-xl font-black text-amber-700">1</span>
                                </div>
                             </div>
                             {/* Rank 3 */}
                             <div className="flex flex-col items-center justify-end w-24">
                                <Avatar className="h-10 w-10 border-2 border-orange-200 mb-2 shadow-sm"><AvatarFallback className="bg-orange-50 font-bold text-orange-600">{(leaderboard[2]?.student?.name || '?').charAt(0)}</AvatarFallback></Avatar>
                                <span className="text-[10px] font-bold text-slate-600 truncate w-full text-center px-1">{leaderboard[2]?.student?.name?.split(' ')[0] || 'Aspirant'}</span>
                                <span className="text-xs font-bold text-slate-800 mb-2">{leaderboard[2].score} <span className="text-[10px] text-slate-400">pts</span></span>
                                <div className="w-full h-12 bg-orange-100/50 rounded-t-xl flex items-start justify-center pt-2">
                                  <span className="text-sm font-black text-orange-400">3</span>
                                </div>
                             </div>
                           </>
                        ) : (
                           <div className="text-center text-sm font-semibold text-amber-600/50 pt-10">We need at least 3 aspirants to generate the podium. Keep practicing!</div>
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
