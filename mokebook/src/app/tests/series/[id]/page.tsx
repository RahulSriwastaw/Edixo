"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  Lock
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface MockTestItem {
  id: string;
  testId: string;
  name: string;
  durationMins: number;
  totalMarks: number;
  status: string;
  isPublic: boolean;
  scheduledAt?: string;
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
    <div className="flex flex-col min-h-screen bg-[#f8fafc] overflow-x-hidden">
      <Navbar />
      <div className="flex-1 flex w-full max-w-full">
        <Sidebar />
        <main className="flex-1 p-3 md:p-6 space-y-6 w-full max-w-full overflow-hidden">

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-7 px-0 text-[11px] font-bold text-muted-foreground hover:bg-transparent hover:text-primary"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back
          </Button>

          {loading ? (
            <div className="py-24 text-center">
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-3" />
              <p className="text-sm font-semibold text-slate-500">Loading series...</p>
            </div>
          ) : !data ? (
            <div className="py-24 text-center space-y-3">
              <p className="text-lg font-bold text-slate-700">Series not found</p>
              <Button onClick={() => router.push("/tests")}>Go to Tests</Button>
            </div>
          ) : (
            <>
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg md:text-2xl font-headline font-bold text-slate-900 leading-tight">
                      {data.name}
                    </h1>
                    {data.isFree && (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-none text-[9px] font-bold h-5 shrink-0">
                        FREE
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] md:text-[11px] font-medium text-muted-foreground">
                    <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-primary fill-primary" /> {totalTests} Total Tests</span>
                    {data.description && <span>{data.description}</span>}
                  </div>
                </div>
                {!data.isFree && (
                  <Button className="bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20 h-10 w-full md:w-auto px-6 rounded-xl">
                    <Lock className="h-4 w-4 mr-2" /> Unlock All Tests
                  </Button>
                )}
              </header>

              {/* Dynamic Tabs based on subcategories */}
              {data.subCategories.length > 1 && (
                <div className="w-full overflow-x-auto no-scrollbar border-b">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex w-full min-w-max">
                      <TabsList className="bg-transparent h-auto p-0 rounded-none mb-0 flex gap-4">
                        <TabsTrigger
                          value="all"
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-[12px] md:text-[13px] font-bold px-4 py-3 whitespace-nowrap transition-all"
                        >
                          All Tests
                        </TabsTrigger>
                        {data.subCategories.map((sc) => (
                          <TabsTrigger
                            key={sc.id}
                            value={sc.name}
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-[12px] md:text-[13px] font-bold px-4 py-3 whitespace-nowrap transition-all"
                          >
                            {sc.name}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>
                  </Tabs>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                <div className="lg:col-span-8 space-y-4 overflow-hidden">
                  {filteredTests.length === 0 ? (
                    <Card className="border-none shadow-sm bg-white rounded-2xl">
                      <CardContent className="p-10 text-center space-y-2">
                        <FileText className="h-10 w-10 text-slate-200 mx-auto" />
                        <p className="text-sm font-semibold text-slate-400">No tests available in this section yet.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredTests.map((test) => {
                      const isLive = test.status === "LIVE";
                      const isAccessible = data.isFree || test.isPublic;
                      return (
                        <Card key={test.id} className="border border-slate-100 shadow-none rounded-2xl overflow-hidden bg-white group hover:border-primary/30 transition-all">
                          <CardContent className="p-4 md:p-5 space-y-4">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {isLive ? (
                                    <Badge className="bg-emerald-100 text-emerald-700 border-none text-[9px] font-bold h-5">LIVE</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[9px] font-bold h-5">{test.status}</Badge>
                                  )}
                                  {!isAccessible && (
                                    <Badge className="bg-amber-100 text-amber-700 border-none text-[9px] font-bold h-5 flex items-center gap-0.5">
                                      <Lock className="h-2.5 w-2.5" /> PAID
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="font-bold text-slate-900 text-[14px] md:text-[15px] leading-snug group-hover:text-primary transition-colors">
                                  {test.name}
                                </h3>
                                <p className="text-[10px] md:text-[11px] font-medium text-slate-400">
                                  {test.durationMins} mins • {test.totalMarks} Marks
                                </p>
                              </div>
                              <Button
                                className={`bg-white text-primary border border-primary/20 hover:bg-primary hover:text-white font-bold h-9 w-full md:w-auto px-6 rounded-xl transition-all shadow-sm shrink-0 ${!isAccessible ? "opacity-50 cursor-not-allowed" : ""}`}
                                onClick={() => isAccessible && router.push(`/tests/instructions/${test.testId}`)}
                                disabled={!isAccessible}
                              >
                                {isAccessible ? "Start Test" : "Unlock"}
                              </Button>
                            </div>
                          </CardContent>
                          {test.scheduledAt && (
                            <div className="bg-slate-50/50 px-4 md:px-5 py-2.5 border-t flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                              <span>Scheduled: {new Date(test.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </div>
                          )}
                        </Card>
                      );
                    })
                  )}
                </div>

                {/* Sticky Sidebar */}
                <aside className="lg:col-span-4 space-y-6 w-full overflow-hidden">
                  <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
                    <CardHeader className="p-4 md:p-5 bg-slate-50 border-b">
                      <CardTitle className="text-sm md:text-base font-headline font-bold">Why Join This Series?</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-5 space-y-4">
                      {[
                        { icon: Zap, label: "Latest Exam Pattern", desc: "Curated by top-rankers and faculty." },
                        { icon: ShieldCheck, label: "Deep AI Analytics", desc: "Detailed sectional summary & insights." },
                        { icon: Globe, label: "Multi-Language Support", desc: "Hindi, English & 8+ local languages." }
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="p-1.5 rounded-lg bg-primary/10 text-primary mt-0.5 shrink-0">
                            <item.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-[12px] md:text-[13px] font-bold text-slate-900 leading-tight">{item.label}</p>
                            <p className="text-[10px] md:text-[11px] text-muted-foreground mt-0.5 leading-tight">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm bg-primary/5 rounded-2xl p-5 text-center space-y-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <HelpCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm">Need Help?</h4>
                      <p className="text-[10px] md:text-[11px] text-muted-foreground px-4 leading-snug">Talk to our exam mentors for personalized guidance.</p>
                    </div>
                    <Button variant="outline" className="w-full border-primary/20 text-primary font-bold h-9 rounded-xl hover:bg-primary/5 text-xs">
                      Chat with Mentor
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