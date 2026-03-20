"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, BookOpen, Clock, Zap, HelpCircle, BookMarked,
  Users, Flame, Loader2, ChevronRight, Filter, Sparkles,
  Lock, PlayCircle, ChevronLeft, BarChart3, Target,
  FileText, Trophy, Bookmark, Layers, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useUser } from "@/firebase";

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "MOCKVEDA-001";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// ── Default fallback quick links ──────────────────────────────────────────────
const DEFAULT_QUICK_LINKS = [
  { id: "free-test", label: "Free Tests", icon: "📝", linkUrl: "/tests?filter=free" },
  { id: "previous-papers", label: "Prev. Papers", icon: "📄", linkUrl: "/tests?filter=previous" },
  { id: "full-length", label: "Full Length", icon: "🏆", linkUrl: "/tests?filter=full" },
  { id: "sectional", label: "Sectional", icon: "🎯", linkUrl: "/tests?filter=sectional" },
  { id: "daily-quiz", label: "Daily Quiz", icon: "📅", linkUrl: "/tests?filter=daily" },
  { id: "analytics", label: "My Analytics", icon: "📊", linkUrl: "/analytics" },
];

// ── Default fallback promo banners ────────────────────────────────────────────
const DEFAULT_BANNERS = [
  {
    id: "1",
    title: "Attempt Today's Free Mock",
    subtitle: "Challenge 5,000+ students in today's live quiz. No registration needed.",
    badgeText: "FREE TODAY",
    ctaText: "Attempt Now",
    linkUrl: "/tests",
    gradient: "from-violet-600 via-purple-600 to-blue-600",
  },
  {
    id: "2",
    title: "Build Your Exam Strategy",
    subtitle: "Our AI studies your weak areas and creates a personalized day-by-day plan.",
    badgeText: "AI POWERED",
    ctaText: "Create My Plan",
    linkUrl: "/study-plans",
    gradient: "from-orange-500 via-red-500 to-rose-600",
  },
  {
    id: "3",
    title: "All SSC & Bank Exams",
    subtitle: "500+ full-length, sectional, and topic-wise mocks. Updated for 2026.",
    badgeText: "POPULAR",
    ctaText: "Explore Tests",
    linkUrl: "/tests",
    gradient: "from-teal-500 via-cyan-500 to-blue-600",
  },
];

export default function TestSeriesPage() {
  const { org } = useOrganization();
  const { user } = useUser();
  const [categorySearch, setCategorySearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("");
  const [activeBanner, setActiveBanner] = useState(0);
  const [frontendConfig, setFrontendConfig] = useState<any>(null);

  // Data
  const [folders, setFolders] = useState<any[]>([]);
  const [seriesByFolder, setSeriesByFolder] = useState<Record<string, any[]>>({});
  const [liveTests, setLiveTests] = useState<any[]>([]);
  const [enrolledSeries, setEnrolledSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const bannerInterval = useRef<any>(null);

  // Load frontend config + data
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);

        // 1. Org frontend config
        const cfgRes = await fetch(`${API_URL}/organizations/public/${ORG_ID}`);
        const cfgData = await cfgRes.json();
        if (cfgData.success && cfgData.data.frontendConfig) {
          setFrontendConfig(cfgData.data.frontendConfig);
        }

        // 2. Folders
        const fRes = await apiFetch("/mockbook/folders");
        const fetchedFolders = fRes.data || [];
        setFolders(fetchedFolders);
        if (fetchedFolders.length > 0) setActiveTab(fetchedFolders[0].id);

        // 3. Series
        const sRes = await apiFetch("/mockbook/categories");
        const grouped = (sRes.data || []).reduce((acc: any, s: any) => {
          if (!acc[s.folderId]) acc[s.folderId] = [];
          acc[s.folderId].push(s);
          return acc;
        }, {});
        setSeriesByFolder(grouped);

        // 4. Live/Free Tests
        const pubRes = await apiFetch("/mockbook/public");
        setLiveTests(pubRes.data || []);

        // 5. Enrolled (mock data for now)
        setEnrolledSeries([
          { id: "1", name: "SSC CGL Tier 1 Mock Tests 2026", progress: 45, testsLeft: 18, image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80" },
          { id: "2", name: "Reasoning Special Sectional Series", progress: 12, testsLeft: 24, image: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=400&q=80" },
        ]);
      } catch (err) {
        console.error("Failed to load tests data", err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // Auto-rotate banners
  const banners: any[] = frontendConfig?.promoBanners?.length ? frontendConfig.promoBanners : DEFAULT_BANNERS;
  useEffect(() => {
    bannerInterval.current = setInterval(() => {
      setActiveBanner(p => (p + 1) % banners.length);
    }, 4500);
    return () => clearInterval(bannerInterval.current);
  }, [banners.length]);

  const quickLinks: any[] = frontendConfig?.quickLinks?.length ? frontendConfig.quickLinks : DEFAULT_QUICK_LINKS;
  const heroText: string = frontendConfig?.heroText || "Ready to level up? 🚀";
  const heroSubText: string = frontendConfig?.heroSubText || "We've analyzed your performance. Today is a great day to attempt a Full-Length Mock.";
  const stats: any[] = frontendConfig?.stats?.length ? frontendConfig.stats : [
    { label: "Active Students", value: "0+" },
    { label: "Mock Tests", value: "0+" },
    { label: "Success Rate", value: "0%" },
    { label: "AI Study Plans", value: "0+" },
  ];

  const filteredFolders = folders.filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase()));

  const displayName = (user as any)?.displayName || "Student";

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#F0F2F8" }}>
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">

          {/* ── PROMO BANNER CAROUSEL ─────────────────────────────────────── */}
          <div className="relative overflow-hidden" style={{ minHeight: "220px" }}>
            {banners.map((banner, i) => (
              <div
                key={banner.id}
                className={cn(
                  "absolute inset-0 transition-all duration-700",
                  i === activeBanner ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8 pointer-events-none"
                )}
              >
                <div className={cn("h-full w-full bg-gradient-to-br relative flex items-center", banner.gradient)}>
                  {/* Geometric decorations */}
                  <div className="absolute right-0 top-0 bottom-0 w-1/3 overflow-hidden opacity-20 pointer-events-none">
                    <div className="absolute -right-16 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full border-[40px] border-white" />
                    <div className="absolute -right-8 -top-20 w-48 h-48 rounded-full border-[20px] border-white/50" />
                  </div>
                  <div className="absolute top-4 left-4 bottom-4 w-1 rounded-full bg-white/30 hidden md:block" />

                  <div className="relative z-10 px-8 md:px-14 py-8 space-y-3 max-w-2xl">
                    {banner.badgeText && (
                      <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur text-white px-4 py-1.5 rounded-full border border-white/20">
                        ✦ {banner.badgeText}
                      </span>
                    )}
                    <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
                      {banner.title}
                    </h2>
                    <p className="text-white/80 text-sm md:text-base font-medium max-w-md leading-relaxed">
                      {banner.subtitle}
                    </p>
                    {banner.ctaText && (
                      <Link href={banner.linkUrl || "/tests"}>
                        <Button className="mt-1 h-11 px-7 rounded-2xl bg-white text-slate-900 font-bold hover:bg-white/90 hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95 border-none shadow-lg shadow-black/20">
                          {banner.ctaText} <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Dots & arrows */}
            <div className="absolute bottom-4 right-6 flex items-center gap-3 z-20">
              <button
                onClick={() => setActiveBanner(p => (p - 1 + banners.length) % banners.length)}
                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-white" />
              </button>
              <div className="flex gap-1.5">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveBanner(i)}
                    className={cn("h-2 rounded-full transition-all", i === activeBanner ? "w-6 bg-white" : "w-2 bg-white/40")}
                  />
                ))}
              </div>
              <button
                onClick={() => setActiveBanner(p => (p + 1) % banners.length)}
                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {/* ── CONTENT ─────────────────────────────────────────────────────── */}
          <div className="p-4 md:p-6 space-y-7">

            {/* ── QUICK LINKS ───────────────────────────────────────────────── */}
            {quickLinks.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm px-4 py-4">
                <ScrollArea className="w-full">
                  <div className="flex gap-4 pb-1">
                    {quickLinks.map(ql => (
                      <Link key={ql.id} href={ql.linkUrl || "/tests"}>
                        <div className="flex flex-col items-center gap-2 min-w-[72px] group cursor-pointer">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center text-2xl group-hover:from-indigo-50 group-hover:to-violet-100 group-hover:border-violet-200 transition-all duration-300 group-hover:scale-110 shadow-sm">
                            {ql.icon}
                          </div>
                          <span className="text-[11px] font-bold text-slate-600 text-center leading-tight group-hover:text-violet-700 transition-colors">
                            {ql.label}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            )}

            {/* ── WELCOME / STREAK BANNER ──────────────────────────────── */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-xl">
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
              <div className="absolute right-0 top-0 bottom-0 w-48 overflow-hidden opacity-5 pointer-events-none">
                <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-[50px] border-white" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 px-8 py-7">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1">
                    <Sparkles className="h-3 w-3" /> Your Daily Target
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                    Hello, {displayName.split(" ")[0]}! &nbsp;<span className="text-violet-300 italic">Let's ace today.</span>
                  </h2>
                  <p className="text-slate-400 text-sm font-medium max-w-md">{heroSubText}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden md:flex flex-col items-center px-5 py-3 rounded-2xl bg-white/5 border border-white/10">
                    <Flame className="h-5 w-5 text-orange-400" />
                    <span className="text-2xl font-black text-white mt-1">24</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Day Streak</span>
                  </div>
                  <Button className="h-12 px-7 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-xl shadow-violet-900/40 transition-all hover:-translate-y-0.5 active:scale-95 border-none">
                    Resume Last Test
                  </Button>
                </div>
              </div>
            </div>

            {/* ── STATS STRIP ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/70 shadow-sm px-5 py-4 text-center">
                  <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* ── MY LEARNING PATH ──────────────────────────────────────── */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  My Learning Path
                </h2>
                <Button variant="ghost" className="text-violet-600 font-bold hover:bg-violet-50 rounded-xl text-sm gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {enrolledSeries.map(series => (
                  <Link key={series.id} href={`/tests/series/${series.id}`} className="group">
                    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 p-4 flex gap-4 items-start">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100 shadow-inner">
                        <Image src={series.image} alt={series.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0 py-0.5 space-y-2">
                        <div>
                          <p className="font-bold text-slate-900 leading-tight line-clamp-2 text-sm group-hover:text-violet-700 transition-colors">{series.name}</p>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{series.testsLeft} tests left</p>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-black">
                            <span className="text-slate-400">PROGRESS</span>
                            <span className="text-violet-600">{series.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-700" style={{ width: `${series.progress}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {enrolledSeries.length === 0 && (
                  <div className="col-span-full py-10 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                    <p className="text-sm text-slate-400 font-medium">No active enrolments. Explore categories below!</p>
                  </div>
                )}
              </div>
            </section>

            {/* ── LIVE ARENA ──────────────────────────────────────────────── */}
            {liveTests.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                      <Flame className="h-4 w-4" />
                    </div>
                    Live Arena
                    <span className="ml-1 flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  </h2>
                  <Button variant="ghost" className="text-violet-600 font-bold hover:bg-violet-50 rounded-xl text-sm gap-1">
                    View All <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="w-full">
                  <div className="flex gap-4 pb-4">
                    {liveTests.map(quiz => (
                      <Link key={quiz.id} href={`/tests/instructions/${quiz.id}`} className="group block shrink-0">
                        <div className="w-72 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-400 border border-slate-200/70">
                          <div className="relative h-36 overflow-hidden bg-slate-100">
                            <Image src={`https://picsum.photos/seed/${quiz.id}/576/288`} alt={quiz.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                            <div className="absolute top-3 left-3 flex gap-2">
                              <Badge className="bg-red-500 text-[9px] font-black px-3 rounded-full border-none animate-pulse">🔴 LIVE</Badge>
                              <Badge className="bg-white/90 text-slate-900 text-[9px] font-black px-3 rounded-full border-none">FREE</Badge>
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-violet-700 transition-colors">{quiz.name}</h3>
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-violet-500" /> {quiz.durationMins}m</span>
                              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-blue-500" /> 1.2K+ Live</span>
                            </div>
                            <Button size="sm" className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold border-none h-9 text-xs">
                              Join Now
                            </Button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </section>
            )}

            {/* ── EXPLORE EXAM SERIES ─────────────────────────────────────── */}
            <section className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                    <Layers className="h-4 w-4" />
                  </div>
                  Explore Exam Series
                </h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search SSC, JEE, NEET..."
                      value={categorySearch}
                      onChange={e => setCategorySearch(e.target.value)}
                      className="pl-10 h-10 bg-white border-slate-200 rounded-xl text-sm w-52 focus-visible:ring-violet-500"
                    />
                  </div>
                  <Button variant="outline" className="h-10 w-10 rounded-xl p-0 border-slate-200 bg-white">
                    <Filter className="h-4 w-4 text-slate-500" />
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden min-h-[480px]">
                {loading ? (
                  <div className="py-40 text-center">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto text-violet-500 mb-4" />
                    <p className="text-sm text-slate-500 font-bold tracking-widest uppercase">Loading Catalog...</p>
                  </div>
                ) : (
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col lg:flex-row h-full">
                    {/* Category tab list */}
                    <div className="w-full lg:w-56 bg-slate-50/80 lg:border-r border-b lg:border-b-0 border-slate-200 p-3 shrink-0">
                      <p className="hidden lg:block text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-3">Categories</p>
                      <TabsList className="flex lg:flex-col items-stretch justify-start h-auto bg-transparent gap-1 overflow-x-auto no-scrollbar">
                        {filteredFolders.length > 0 ? filteredFolders.map(cat => (
                          <TabsTrigger
                            key={cat.id}
                            value={cat.id}
                            className="flex-shrink-0 lg:w-full justify-start text-sm font-bold px-4 py-3 data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-violet-100 border border-transparent rounded-xl whitespace-nowrap transition-all duration-200 group"
                          >
                            <span className="lg:flex-1 text-left">{cat.name}</span>
                            <ChevronRight className="hidden lg:block h-3.5 w-3.5 opacity-0 group-data-[state=active]:opacity-100 transition-opacity text-violet-400" />
                          </TabsTrigger>
                        )) : (
                          <div className="p-8 text-center w-full">
                            <HelpCircle className="h-6 w-6 text-slate-200 mx-auto mb-1" />
                            <p className="text-xs text-slate-400 font-bold">No results</p>
                          </div>
                        )}
                      </TabsList>
                    </div>

                    {/* Content area */}
                    <div className="flex-1 p-5 md:p-7 bg-white">
                      {folders.map(cat => (
                        <TabsContent key={cat.id} value={cat.id} className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-1.5 duration-300">
                          {seriesByFolder[cat.id]?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                              {seriesByFolder[cat.id].map((series: any) => (
                                <Link key={series.id} href={`/tests/series/${series.id}`} className="group block">
                                  <div className="relative bg-white rounded-2xl border border-slate-200/80 hover:border-violet-200 transition-all duration-300 overflow-hidden flex flex-col h-full hover:shadow-lg hover:-translate-y-1">
                                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                                      <Image
                                        src={series.icon || `https://picsum.photos/seed/${series.id}/640/360`}
                                        alt={series.name} fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />
                                      {series.isFeatured && (
                                        <div className="absolute top-3 right-3">
                                          <Badge className="bg-amber-400 text-slate-900 text-[9px] font-black px-3 h-5 rounded-full border-none">⭐ FEATURED</Badge>
                                        </div>
                                      )}
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col space-y-3">
                                      <div className="flex items-center justify-between">
                                        <Badge className="bg-violet-50 text-violet-700 text-[10px] font-black px-3 h-5 rounded-full border-none">Mock Series</Badge>
                                        {series.isFree ? (
                                          <Badge className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 h-5 rounded-full border-none">FREE</Badge>
                                        ) : (
                                          <Badge className="bg-slate-900 text-white text-[10px] font-black px-3 h-5 rounded-full border-none flex items-center gap-1">
                                            <Lock className="h-2.5 w-2.5" /> PRO
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="space-y-1">
                                        <h4 className="font-bold text-slate-900 line-clamp-2 text-sm group-hover:text-violet-700 transition-colors">{series.name}</h4>
                                        <p className="text-xs text-slate-500 line-clamp-2">{series.description || "Comprehensive mock series with full analytics and rank tracking."}</p>
                                      </div>
                                      <div className="pt-2 mt-auto border-t border-slate-50 flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                                          <PlayCircle className="h-3.5 w-3.5 text-violet-500" /> 24 Tests
                                        </span>
                                        <span className="text-violet-600 font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                                          Explore <ChevronRight className="h-3.5 w-3.5" />
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                              <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                                <BookOpen className="h-8 w-8 text-slate-200" />
                              </div>
                              <div className="space-y-1 max-w-xs">
                                <p className="text-base font-black text-slate-900">Coming Soon</p>
                                <p className="text-sm text-slate-500">Our experts are crafting premium content for <span className="text-violet-600 font-bold">{cat.name}</span>. Stay tuned!</p>
                              </div>
                              <Button variant="outline" className="rounded-xl font-bold border-slate-200 text-sm">Notify Me</Button>
                            </div>
                          )}
                        </TabsContent>
                      ))}
                    </div>
                  </Tabs>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
