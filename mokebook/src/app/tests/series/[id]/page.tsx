"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronRight,
  Clock,
  HelpCircle,
  Calendar,
  Globe,
  Zap,
  Star,
  ShieldCheck,
  ChevronLeft,
  Loader2,
  FileText,
  Lock,
  PlayCircle,
  Trophy,
  BarChart3,
  Sparkles,
  Info,
  CheckCircle2,
  BookOpen,
  Users,
  ArrowRight
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

interface MockTestItem {
  id: string;
  testId: string;
  name: string;
  durationMins: number;
  totalMarks: number;
  status: string;
  isPublic: boolean;
  scheduledAt?: string;
  attempts?: number;
}

interface SubCategory {
  id: string;
  name: string;
  mockTests: MockTestItem[];
}

interface CategoryDetail {
  id: string;
  name: string;
  description?: string;
  isFree: boolean;
  subCategories: SubCategory[];
}

export default function SeriesDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`/mockbook/categories/${id}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to load series:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Flatten all tests across subcategories
  const allTests: (MockTestItem & { subCategoryName: string })[] = data?.subCategories?.flatMap(
    sc => sc.mockTests.map(t => ({ ...t, subCategoryName: sc.name }))
  ) || [];

  const filteredTests = activeTab === "all"
    ? allTests
    : allTests.filter(t => t.subCategoryName.toLowerCase().includes(activeTab.toLowerCase()));

  const totalTests = allTests.length;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="flex-1 flex overflow-hidden w-full max-w-full">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 space-y-8 w-full max-w-full overflow-y-auto selection:bg-primary/10">

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-9 px-0 text-xs font-bold text-slate-400 hover:bg-transparent hover:text-primary transition-colors group"
          >
            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </Button>

          {loading ? (
            <div className="py-40 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
              <p className="text-sm font-bold text-slate-500 tracking-widest uppercase">Loading Series Data...</p>
            </div>
          ) : !data ? (
            <div className="py-24 text-center space-y-6 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Info className="h-10 w-10 text-slate-300" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-black text-slate-900">Series not found</p>
                <p className="text-slate-500 font-medium">The test series you're looking for might have been moved or deleted.</p>
              </div>
              <Button onClick={() => router.push("/tests")} className="rounded-2xl font-bold h-12 px-8">Browse All Tests</Button>
            </div>
          ) : (
            <>
              {/* Premium Header */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-500 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                <header className="relative bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        {data.isFree && (
                          <Badge className="bg-emerald-50 text-emerald-600 border-none text-[10px] font-black tracking-widest px-3 h-6 rounded-full">
                            FREE ACCESS
                          </Badge>
                        )}
                        {!data.isFree && (
                          <Badge className="bg-slate-900 text-white border-none text-[10px] font-black tracking-widest px-3 h-6 rounded-full flex items-center gap-1">
                            <Lock className="h-2.5 w-2.5" /> PREMIUM
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                          {data.name}
                        </h1>
                        <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
                          {data.description || "Master your target exam with this comprehensive mock series. Designed by experts based on the latest 2025 exam patterns."}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 pt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                            <Zap className="h-4 w-4 fill-orange-600" />
                          </div>
                          <span className="text-sm font-bold text-slate-700">{totalTests} Tests</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <Users className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-bold text-slate-700">12K+ Aspirants</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Star className="h-4 w-4 fill-emerald-600" />
                          </div>
                          <span className="text-sm font-bold text-slate-700">4.9 Rating</span>
                        </div>
                      </div>
                    </div>

                    {!data.isFree && (
                      <div className="shrink-0">
                        <Button className="bg-primary hover:bg-primary/90 text-white font-black shadow-2xl shadow-primary/30 h-16 px-10 rounded-2xl text-lg hover:-translate-y-1 transition-all active:scale-95 group">
                          Unlock Full Series
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Decorative pattern */}
                  <div className="absolute top-0 right-0 w-1/3 h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                </header>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Modern Filter Tabs */}
                  <div className="bg-white p-2 rounded-2xl border border-slate-200/60 shadow-sm inline-flex w-full md:w-auto overflow-x-auto no-scrollbar">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="bg-transparent h-auto p-0 flex gap-1">
                        <TabsTrigger
                          value="all"
                          className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-xs font-bold px-6 py-2.5 transition-all duration-300"
                        >
                          All Tests ({totalTests})
                        </TabsTrigger>
                        {data.subCategories.map((sc) => (
                          <TabsTrigger
                            key={sc.id}
                            value={sc.name}
                            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-xs font-bold px-6 py-2.5 transition-all duration-300 whitespace-nowrap"
                          >
                            {sc.name}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>

                  <div className="space-y-4">
                    {filteredTests.length === 0 ? (
                      <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <FileText className="h-8 w-8 text-slate-200" />
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Empty Section</p>
                      </div>
                    ) : (
                      filteredTests.map((test, i) => {
                        const isLive = test.status === "LIVE";
                        const isAccessible = data.isFree || test.isPublic;
                        return (
                          <div 
                            key={test.id} 
                            className="group relative bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                              <div className="flex gap-5 items-start">
                                <div className={cn(
                                  "w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center font-black text-lg shadow-inner",
                                  isAccessible ? "bg-slate-50 text-slate-400" : "bg-slate-100 text-slate-300"
                                )}>
                                  {String(i + 1).padStart(2, '0')}
                                </div>
                                <div className="space-y-2 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {isLive ? (
                                      <Badge className="bg-red-500 text-white border-none text-[9px] font-black tracking-widest h-5 px-2.5 rounded-full animate-pulse">LIVE NOW</Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-[9px] font-black tracking-widest h-5 px-2.5 rounded-full text-slate-400 border-slate-200 uppercase">{test.status}</Badge>
                                    )}
                                    {!isAccessible && (
                                      <Badge className="bg-amber-50 text-amber-600 border-none text-[9px] font-black tracking-widest h-5 px-2.5 rounded-full flex items-center gap-1">
                                        <Lock className="h-2.5 w-2.5" /> LOCKED
                                      </Badge>
                                    )}
                                    {test.attempts && test.attempts > 0 && (
                                      <Badge className="bg-blue-50 text-blue-600 border-none text-[9px] font-black tracking-widest h-5 px-2.5 rounded-full flex items-center gap-1">
                                        <CheckCircle2 className="h-2.5 w-2.5" /> COMPLETED
                                      </Badge>
                                    )}
                                  </div>
                                  <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-primary transition-colors truncate">
                                    {test.name}
                                  </h3>
                                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" /> {test.durationMins}m</span>
                                    <span className="flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5 text-blue-500" /> {test.totalMarks} Marks</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                {isAccessible ? (
                                  <Button
                                    className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                                    onClick={() => router.push(`/tests/instructions/${test.testId}`)}
                                  >
                                    {test.attempts && test.attempts > 0 ? "Retake Test" : "Start Test"}
                                    <PlayCircle className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    className="h-12 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                                    onClick={() => {}}
                                  >
                                    Unlock Test
                                    <Lock className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            {test.scheduledAt && (
                              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                <span>Release Date: {new Date(test.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Modern Premium Sidebar */}
                <aside className="lg:col-span-4 space-y-8">
                  <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                    <div className="relative z-10 space-y-6">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary text-[10px] font-black uppercase tracking-widest">
                          <Sparkles className="h-3 w-3" />
                          Platform Benefits
                        </div>
                        <h3 className="text-xl font-black tracking-tight">Why study with us?</h3>
                      </div>
                      
                      <div className="space-y-5">
                        {[
                          { icon: Zap, label: "Latest Exam Pattern", desc: "Updated for 2025 exam formats.", color: "text-orange-400", bg: "bg-orange-400/10" },
                          { icon: ShieldCheck, label: "AIR Prediction", desc: "Know your nationwide rank instantly.", color: "text-emerald-400", bg: "bg-emerald-400/10" },
                          { icon: BarChart3, label: "AI Doubt Solver", desc: "Instant explanations for every question.", color: "text-blue-400", bg: "bg-blue-400/10" }
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-4">
                            <div className={cn("p-2.5 rounded-xl shrink-0 mt-0.5", item.bg)}>
                              <item.icon className={cn("h-5 w-5", item.color)} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white leading-tight">{item.label}</p>
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Button variant="outline" className="w-full h-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold transition-all">
                        View Sample Analysis
                      </Button>
                    </div>
                    
                    {/* Background glow */}
                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-[80px]" />
                  </div>

                  <Card className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 text-center space-y-6 shadow-sm">
                    <div className="relative mx-auto">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto border-2 border-dashed border-slate-200">
                        <HelpCircle className="h-10 w-10 text-slate-300" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-xl shadow-lg flex items-center justify-center">
                        <Zap className="h-4 w-4 text-white fill-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-black text-slate-900 text-lg">Need Guidance?</h4>
                      <p className="text-xs font-medium text-slate-500 leading-relaxed px-2">Our expert mentors are available 24/7 to help you with your preparation strategy.</p>
                    </div>
                    <Button variant="outline" className="w-full h-12 rounded-2xl border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition-all">
                      Talk to a Mentor
                    </Button>
                  </Card>
                </aside>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
