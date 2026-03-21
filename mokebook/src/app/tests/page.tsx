"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Search, BookOpen, Clock, Zap, HelpCircle, BookMarked,
  Users, Flame, Loader2, ChevronRight, Filter, Sparkles,
  Lock, PlayCircle, ChevronLeft, BarChart3, Target,
  FileText, Trophy, Bookmark, Layers, ArrowRight, CheckCircle2,
  Star, ChevronDown, ChevronUp, Quote, Award, TrendingUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useUser } from "@/firebase";

// ── My Series static data (enrolled series) ──────────────────────────────────
const MY_SERIES = [
  { id: "1", name: "RRB Group D Mock Test Series", progress: 45, tests: 45, totalTests: 100, icon: Zap, color: "bg-red-500", status: "active", lastActivity: "2h ago" },
  { id: "2", name: "SSC CGL Tier-I Mega Pack", progress: 12, tests: 12, totalTests: 45, icon: Award, color: "bg-blue-500", status: "active", lastActivity: "1d ago" },
  { id: "3", name: "Current Affairs 2024 Daily", progress: 88, tests: 88, totalTests: 100, icon: TrendingUp, color: "bg-orange-500", status: "active", lastActivity: "3h ago" },
  { id: "4", name: "Physics: Laws of Motion", progress: 100, tests: 20, totalTests: 20, icon: Zap, color: "bg-green-500", status: "completed", lastActivity: "5d ago" },
];

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

const DEFAULT_WHY_ITEMS = [
  { icon: "🎯", title: "Real Exam Pattern", desc: "Every test mirrors the exact pattern and difficulty of the actual exam." },
  { icon: "📊", title: "Your Performance Analysis", desc: "Get detailed analytics with percentile, rank, and topic-wise breakdown." },
  { icon: "🤖", title: "AI-Powered Prep", desc: "Personalized weak-area identification and adaptive practice sessions." },
];

const DEFAULT_FAQS = [
  { q: "Can I attempt tests on my phone?", a: "Yes! Our platform is fully optimized for mobile browsers. No app download needed." },
  { q: "Are the mock tests free?", a: "We offer both free and premium tests. Free tests are available to all registered users." },
  { q: "How is my percentile calculated?", a: "Your percentile is calculated based on real-time comparison with all students who attempted the same test." },
  { q: "Can I review my answers after submission?", a: "Yes, a detailed solution review with explanations is available immediately after submission." },
];

// ── FAQ Item Component ────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-sm font-bold text-slate-800">{q}</span>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function TestSeriesPage() {
  const { org } = useOrganization();
  const { user } = useUser();
  const [categorySearch, setCategorySearch] = useState("");
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("");
  const [activeBanner, setActiveBanner] = useState(0);
  const [frontendConfig, setFrontendConfig] = useState<any>(null);

  // Data
  const [folders, setFolders] = useState<any[]>([]);
  const [seriesByFolder, setSeriesByFolder] = useState<Record<string, any[]>>({});
  const [liveTests, setLiveTests] = useState<any[]>([]);
  const [enrolledSeries, setEnrolledSeries] = useState<any[]>([]);
  const [recentSeries, setRecentSeries] = useState<any[]>([]);
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
        if (fetchedFolders.length > 0) setActiveCategoryTab(fetchedFolders[0].id);

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

        // 5. Recent tests (use first 4 from public for demo)
        const allSeries = (sRes.data || []).slice(0, 4);
        setRecentSeries(allSeries);

        // 6. Enrolled (mock data)
        setEnrolledSeries([
          { id: "1", name: "SSC CGL Tier 1 Mock Tests 2026", progress: 45, testsLeft: 18, image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80" },
          { id: "2", name: "Reasoning Special Sectional Series", progress: 12, testsLeft: 24, image: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=400&q=80" },
          { id: "3", name: "Banking & SSC GK Capsule 2026", progress: 67, testsLeft: 8, image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80" },
          { id: "4", name: "English Grammar & Comprehension", progress: 30, testsLeft: 12, image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80" },
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
    { label: "Active Students", value: "50K+" },
    { label: "Mock Tests", value: "12K+" },
    { label: "Success Rate", value: "92%" },
    { label: "AI Study Plans", value: "25K+" },
  ];
  const whyItems: any[] = frontendConfig?.whySection?.items?.length ? frontendConfig.whySection.items : DEFAULT_WHY_ITEMS;
  const whyTitle: string = frontendConfig?.whySection?.title || "Why Choose Our Test Series?";
  const testimonials: any[] = frontendConfig?.testimonials || [];
  const faqs: any[] = frontendConfig?.faqs?.length ? frontendConfig.faqs : DEFAULT_FAQS;

  const filteredFolders = folders.filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase()));
  const displayName = (user as any)?.displayName || "Student";
  const [activeTab, setActiveTab] = useState<"discover" | "my-series">("discover");
  const [mySeriesSearch, setMySeriesSearch] = useState("");
  const filteredMySeries = MY_SERIES.filter(s => s.name.toLowerCase().includes(mySeriesSearch.toLowerCase()));

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#F0F2F8" }}>
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">

          {/* ── TAB SWITCHER ──────────────────────────────────────────────── */}
          <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 md:px-8">
            <div className="flex gap-1 pt-1">
              {(["discover", "my-series"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-5 py-3 text-sm font-bold capitalize border-b-2 transition-all",
                    activeTab === tab
                      ? "border-violet-600 text-violet-700"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  )}
                >
                  {tab === "discover" ? "Discover" : "My Series"}
                </button>
              ))}
            </div>
          </div>

          {/* ── MY SERIES TAB ─────────────────────────────────────────────── */}
          {activeTab === "my-series" && (
            <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    placeholder="Search your enrolled series..."
                    className="w-full pl-10 pr-4 h-11 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400"
                    value={mySeriesSearch}
                    onChange={e => setMySeriesSearch(e.target.value)}
                  />
                </div>
              </div>
              {filteredMySeries.length === 0 ? (
                <div className="py-24 text-center space-y-4">
                  <BookOpen className="h-12 w-12 text-slate-200 mx-auto" />
                  <p className="text-slate-500 font-semibold">No enrolled series found.</p>
                  <button onClick={() => setActiveTab("discover")} className="text-violet-600 font-bold text-sm hover:underline">
                    Browse Test Series →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredMySeries.map(series => (
                    <Link key={series.id} href={`/tests/series/${series.id}`} className="group block">
                      <Card className="hover:shadow-lg transition-all border-none bg-white overflow-hidden flex flex-col shadow-sm h-full">
                        <div className={cn("h-1.5 w-full", series.color)} />
                        <CardContent className="p-5 space-y-4 flex-1 flex flex-col">
                          <div className="flex justify-between items-start">
                            <Badge className={cn("text-[9px] font-bold uppercase h-5 px-2", series.status === "completed" ? "bg-green-50 text-green-700 border-green-100" : "bg-blue-50 text-blue-700 border-blue-100")}>
                              {series.status === "completed" ? <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Completed</span> : "In Progress"}
                            </Badge>
                            <span className="text-[10px] font-bold text-slate-400">{series.lastActivity}</span>
                          </div>
                          <h3 className="text-sm font-bold leading-snug group-hover:text-violet-600 transition-colors flex-1 line-clamp-2">{series.name}</h3>
                          <div className="space-y-1.5 mt-auto">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-slate-500">{series.tests}/{series.totalTests} Tests</span>
                              <span className="text-violet-600">{series.progress}%</span>
                            </div>
                            <Progress value={series.progress} className="h-1.5 bg-slate-100" />
                          </div>
                          <div className="w-full h-9 flex items-center justify-center text-xs font-bold rounded-xl bg-slate-900 text-white group-hover:bg-violet-600 transition-all">
                            {series.status === "completed" ? "Review Analysis" : "Continue Test"}
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── DISCOVER TAB ─────────────────────────────────────────────── */}
          {activeTab === "discover" && <>

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

            {/* ── YOUR RECENT TEST SERIES ──────────────────────────────────── */}
            {recentSeries.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Clock className="h-4 w-4" />
                    </div>
                    Your Recent Test Series
                  </h2>
                  <Button variant="ghost" className="text-violet-600 font-bold hover:bg-violet-50 rounded-xl text-sm gap-1">
                    View All <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="w-full">
                  <div className="flex gap-4 pb-4">
                    {recentSeries.map((series: any) => (
                      <Link key={series.id} href={`/tests/series/${series.id}`} className="group block shrink-0">
                        <div className="w-64 bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                          <div className="relative h-28 bg-gradient-to-br from-violet-100 to-violet-200">
                            {series.icon ? (
                              <Image src={series.icon} alt={series.name} fill className="object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <BookOpen className="h-10 w-10 text-violet-400" />
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <p className="font-bold text-sm text-slate-900 line-clamp-2 group-hover:text-violet-700 transition-colors">{series.name}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className="bg-violet-50 text-violet-700 text-[10px] font-black px-2 h-4 rounded-full border-none">
                                {series.isFree ? "FREE" : "PREMIUM"}
                              </Badge>
                            </div>
                            <Button size="sm" className="w-full mt-3 h-8 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold border-none text-xs">
                              Continue
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

            {/* ── MY LEARNING PATH ──────────────────────────────────────── */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  Your Enrolled Series
                </h2>
                <Button variant="ghost" className="text-violet-600 font-bold hover:bg-violet-50 rounded-xl text-sm gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {enrolledSeries.map(series => (
                  <Link key={series.id} href={`/tests/series/${series.id}`} className="group">
                    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 p-4 flex gap-4 items-start">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 shadow-inner">
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
                    Live Tests & Free Quizzes
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

            {/* ── TEST SERIES BY CATEGORIES ────────────────────────────────── */}
            <section className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                    <Layers className="h-4 w-4" />
                  </div>
                  Test Series by Categories
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
                  <div className="flex flex-col lg:flex-row h-full">
                    {/* Vertical Category Sidebar */}
                    <div className="w-full lg:w-56 bg-slate-50/80 lg:border-r border-b lg:border-b-0 border-slate-200 p-3 shrink-0">
                      <p className="hidden lg:block text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-3">Categories</p>
                      <div className="flex lg:flex-col items-stretch justify-start gap-1 overflow-x-auto no-scrollbar">
                        {filteredFolders.length > 0 ? filteredFolders.map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => setActiveCategoryTab(cat.id)}
                            className={cn(
                              "flex-shrink-0 lg:w-full flex items-center justify-between text-sm font-bold px-4 py-3 rounded-xl whitespace-nowrap transition-all duration-200",
                              activeCategoryTab === cat.id
                                ? "bg-white text-violet-700 shadow-md border border-violet-100"
                                : "text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent"
                            )}
                          >
                            <span className="lg:flex-1 text-left">{cat.name}</span>
                            <ChevronRight className={cn("hidden lg:block h-3.5 w-3.5 transition-opacity text-violet-400", activeCategoryTab === cat.id ? "opacity-100" : "opacity-0")} />
                          </button>
                        )) : (
                          <div className="p-8 text-center w-full">
                            <HelpCircle className="h-6 w-6 text-slate-200 mx-auto mb-1" />
                            <p className="text-xs text-slate-400 font-bold">No results</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content area */}
                    <div className="flex-1 p-5 md:p-7 bg-white">
                      {folders.filter(c => c.id === activeCategoryTab).map(cat => (
                        <div key={cat.id} className="animate-in fade-in slide-in-from-bottom-1.5 duration-300">
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
                        </div>
                      ))}
                      {folders.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                          <Loader2 className="h-8 w-8 text-slate-200" />
                          <p className="text-sm text-slate-400 font-medium">No categories found.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ── WHY CHOOSE US ───────────────────────────────────────────── */}
            {whyItems.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-black text-slate-900">{whyTitle}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {whyItems.map((item: any, i: number) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 flex flex-col items-start gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                      <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-2xl">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-sm mb-1">{item.title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── TESTIMONIALS ────────────────────────────────────────────── */}
            {testimonials.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-black text-slate-900">Hear directly from our students</h2>
                <ScrollArea className="w-full">
                  <div className="flex gap-4 pb-4">
                    {testimonials.map((t: any, i: number) => (
                      <div key={i} className="w-80 shrink-0 bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5 space-y-3">
                        <Quote className="h-6 w-6 text-violet-200" />
                        <p className="text-sm text-slate-600 leading-relaxed italic">"{t.text}"</p>
                        <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
                          {t.avatar ? (
                            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-100">
                              <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-black text-sm">
                              {t.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-black text-slate-900">{t.name}</p>
                            {t.role && <p className="text-[10px] text-slate-400 font-bold">{t.role}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </section>
            )}

            {/* ── FAQ ─────────────────────────────────────────────────────── */}
            <section className="space-y-4">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3 space-y-3">
                  <h2 className="text-lg font-black text-slate-900">Frequently Asked Questions</h2>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Everything you need to know about our test series platform. Can't find what you're looking for? <Link href="/profile" className="text-violet-600 font-bold hover:underline">Contact support.</Link>
                  </p>
                </div>
                <div className="md:flex-1 space-y-3">
                  {faqs.map((faq: any, i: number) => (
                    <FaqItem key={i} q={faq.q} a={faq.a} />
                  ))}
                </div>
              </div>
            </section>

          </div>
          </> /* end discover tab */}

        </main>
      </div>
    </div>
  );
}
