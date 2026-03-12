"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  BookOpen,
  Clock,
  Zap,
  TrendingUp,
  HelpCircle,
  Award,
  BarChart3,
  Users,
  Flame,
  Loader2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function TestSeriesPage() {
  const [categorySearch, setCategorySearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("");
  
  // Real Data States
  const [folders, setFolders] = useState<any[]>([]);
  const [seriesByFolder, setSeriesByFolder] = useState<Record<string, any[]>>({});
  const [liveQuizzes, setLiveQuizzes] = useState<any[]>([]);
  const [enrolledSeries, setEnrolledSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // 1. Folders (Categories)
        const fRes = await apiFetch('/mockbook/folders');
        const fetchedFolders = fRes.data || [];
        setFolders(fetchedFolders);
        if (fetchedFolders.length > 0) {
          setActiveTab(fetchedFolders[0].id);
        }

        // 2. Series (Categories inside Folders)
        const sRes = await apiFetch('/mockbook/categories');
        const grouped = (sRes.data || []).reduce((acc: any, s: any) => {
          if (!acc[s.folderId]) acc[s.folderId] = [];
          acc[s.folderId].push(s);
          return acc;
        }, {});
        setSeriesByFolder(grouped);

        // 3. Live/Free Tests 
        const pubRes = await apiFetch('/mockbook/public');
        setLiveQuizzes(pubRes.data || []);

        // 4. Student Enrolments (mock empty for now until DB model is fixed)
        // const meRes = await apiFetch('/students/me');
        setEnrolledSeries([]);

      } catch (err) {
        console.error("Failed to load tests data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredCategories = folders.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto thin-scrollbar">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Test Series</h1>
              <p className="text-sm text-slate-500 mt-1">Find and attempt your target exam mocks</p>
            </div>
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search exams (JEE, NEET, SSC)..."
                className="pl-10 h-10 bg-white border-slate-200 rounded-xl shadow-sm text-sm focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 hover:border-slate-300"
              />
            </div>
          </div>

          {/* Enrolled Series */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" /> Enrolled Series
              </h2>
              <Button variant="link" size="sm" className="text-primary text-xs font-semibold h-auto p-0 hover:no-underline" asChild>
                <Link href="/tests/my-series">View All →</Link>
              </Button>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex w-max gap-3 pb-3 min-h-[150px] items-center">
                {enrolledSeries.length > 0 ? enrolledSeries.map((series) => (
                  <Link key={series.id} href={`/tests/series/${series.id}`} className="block group">
                     {/* Existing series card content */}
                     <Card className="w-[220px] md:w-[260px] shadow-sm hover:shadow-md transition-all border-none bg-white overflow-hidden rounded-2xl h-full card-hover">
                      <div className="relative aspect-video w-full overflow-hidden">
                        <Image src={series.image || "https://picsum.photos/seed/rrb1/640/360"} alt={series.name} fill className="object-cover" />
                      </div>
                      <CardContent className="p-4"><h3 className="font-bold">{series.name}</h3></CardContent>
                     </Card>
                  </Link>
                )) : (
                  <div className="text-sm text-slate-400 italic px-4">No active enrolments found. Explore categories below to start solving!</div>
                )}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>

          {/* Live & Free Quizzes */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flame className="h-4 w-4 text-accent" /> Live & Free
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {loading ? (
                    <div className="col-span-full py-8 text-center text-slate-400">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                        <p className="text-xs font-semibold">Loading Live Tests...</p>
                    </div>
                ) : liveQuizzes.length > 0 ? liveQuizzes.map((quiz) => (
                  <Link key={quiz.id} href={`/tests/instructions/${quiz.id}`} className="group block">
                    <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all border-none bg-white flex flex-col h-full rounded-2xl card-hover">
                      <div className="relative aspect-video w-full shrink-0 overflow-hidden">
                        <Image src={`https://picsum.photos/seed/${quiz.id}/640/360`} alt={quiz.name} fill className="object-cover transition-transform group-hover:scale-105 duration-500" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                          <Badge className="bg-red-500 text-[10px] h-5 px-2 font-bold animate-pulse rounded-lg">
                            🔴 LIVE NOW
                          </Badge>
                          <Badge className="bg-emerald-500 border-none text-[10px] h-5 px-2 font-bold rounded-lg text-white">
                            FREE
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-bold leading-snug group-hover:text-primary transition-colors">{quiz.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-between gap-3">
                        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {quiz.durationMins}m</span>
                        </div>
                        <div className="w-full h-10 flex items-center justify-center rounded-xl bg-accent text-white text-sm font-bold shadow-sm shadow-accent/20 group-hover:bg-accent/90 transition-colors">
                          Register Free
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )) : (
                    <div className="col-span-full py-8 text-center text-slate-400 bg-white rounded-2xl border border-dashed">
                        No live free tests available at the moment.
                    </div>
                )}
            </div>
          </section>

          {/* Browse Categories */}
          <section className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-900">Browse Categories</h2>
              <div className="relative w-full sm:w-52">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Filter category..."
                  className="pl-9 h-9 bg-white border-slate-100 rounded-xl text-sm"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
              </div>
            </div>

            <Card className="shadow-sm overflow-hidden border-none bg-white rounded-2xl">
              {loading ? (
                <div className="py-24 text-center">
                   <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
                   <p className="text-sm text-slate-500 font-semibold">Loading Exam Categories...</p>
                </div>
              ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col md:flex-row min-h-[280px]">
                <TabsList className="flex md:flex-col items-start justify-start h-auto w-full md:w-48 bg-slate-50 p-2 md:border-r gap-1 overflow-x-auto no-scrollbar border-b md:border-b-0">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                      <TabsTrigger
                        key={cat.id}
                        value={cat.id}
                        className="flex-shrink-0 md:w-full justify-start text-sm font-semibold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-xl whitespace-nowrap transition-all"
                      >
                        {cat.name}
                      </TabsTrigger>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-slate-400 font-medium italic text-center w-full">No results</div>
                  )}
                </TabsList>

                <div className="flex-1 p-4 md:p-6">
                  {folders.map(cat => (
                    <TabsContent key={cat.id} value={cat.id} className="mt-0 outline-none">
                      {seriesByFolder[cat.id] && seriesByFolder[cat.id].length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {seriesByFolder[cat.id].map((series: any) => (
                                <Link key={series.id} href={`/tests/series/${series.id}`} className="group block">
                                <Card className="hover:border-primary/30 border border-slate-100 transition-all cursor-pointer bg-white overflow-hidden flex flex-col h-full shadow-sm rounded-2xl card-hover">
                                    <div className="relative aspect-video w-full overflow-hidden">
                                    <Image
                                        src={series.icon || `https://picsum.photos/seed/${series.id}/640/360`}
                                        alt={series.name}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105 duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                                    {series.isFeatured && (
                                      <div className="absolute top-2.5 right-2.5">
                                          <Badge className="text-[10px] h-5 bg-white/90 backdrop-blur font-bold rounded-lg text-slate-700 border-none shadow-sm">
                                            🌟 Featured
                                          </Badge>
                                      </div>
                                    )}
                                    </div>
                                    <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <Zap className="h-4 w-4" />
                                        </div>
                                        {series.isFree ? (
                                           <Badge className="bg-emerald-500 text-[10px] font-bold rounded-lg border-none text-white">FREE</Badge>
                                        ) : (
                                           <Badge className="bg-slate-900 text-[10px] font-bold rounded-lg text-white">PREMIUM</Badge> 
                                        )}
                                    </div>
                                    <h4 className="text-sm font-bold line-clamp-2 text-slate-800 group-hover:text-primary transition-colors leading-snug">
                                        {series.name}
                                    </h4>
                                    <p className="text-xs text-slate-400 font-medium line-clamp-1">{series.description}</p>
                                    <div className="w-full h-9 flex items-center justify-center rounded-xl bg-primary text-white text-sm font-bold shadow-sm mt-auto group-hover:bg-primary/90 transition-colors">
                                        View Details
                                    </div>
                                    </CardContent>
                                </Card>
                                </Link>
                            ))}
                        </div>
                      ) : (
                         <div className="text-center py-16 space-y-3">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto">
                            <BookOpen className="h-8 w-8 text-slate-200" />
                            </div>
                            <div className="space-y-1">
                            <p className="text-base font-bold text-slate-800">Explore {cat.name}</p>
                            <p className="text-sm text-slate-400">Content for this category is coming soon.</p>
                            </div>
                         </div>
                      )}
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
              )}
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}