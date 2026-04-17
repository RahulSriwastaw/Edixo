"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  ChevronRight, Clock, Lock, PlayCircle, BarChart3, CheckCircle2,
  BookOpen, Loader2, Star, Zap, FileText, ArrowRight, Globe2,
  Users, ChevronDown, ChevronUp, Bell, X, Shield, Award
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<string, { gradient: string; icon: string }> = {
  default:     { gradient: "from-[#0f1b2d] to-[#1a73e8]",   icon: "📚" },
  railways:    { gradient: "from-[#1e2a3b] to-[#1a73e8]",   icon: "🚂" },
  rrb:         { gradient: "from-[#1e2a3b] to-[#1a73e8]",   icon: "🚂" },
  ssc:         { gradient: "from-[#0f1b2d] to-[#1a73e8]",   icon: "📋" },
  banking:     { gradient: "from-[#064e3b] to-[#1a73e8]",   icon: "🏦" },
  insurance:   { gradient: "from-[#064e3b] to-[#1a73e8]",   icon: "🏦" },
  defence:     { gradient: "from-[#064e3b] to-[#1a73e8]",   icon: "🎖️" },
  police:      { gradient: "from-[#064e3b] to-[#1a73e8]",   icon: "🛡️" },
  state:       { gradient: "from-[#92400e] to-[#1a73e8]",   icon: "🏛️" },
  teaching:    { gradient: "from-[#831843] to-[#1a73e8]",   icon: "🎓" },
  civil:       { gradient: "from-[#3730a3] to-[#1a73e8]",   icon: "⚖️" },
  upsc:        { gradient: "from-[#3730a3] to-[#1a73e8]",   icon: "⚖️" },
  engineering: { gradient: "from-[#0f172a] to-[#1a73e8]",   icon: "🔧" },
  gate:        { gradient: "from-[#0f172a] to-[#1a73e8]",   icon: "🔧" },
};

function getCatMeta(name: string) {
  const lower = name?.toLowerCase() || "";
  for (const [k, v] of Object.entries(CATEGORY_META)) {
    if (lower.includes(k)) return v;
  }
  return CATEGORY_META.default;
}

const TABS = ["All Tests", "Free", "Mock Tests", "Chapter Tests", "Sectional"] as const;

const DEFAULT_FAQS = [
  { q: "Can I attempt tests on my phone?", a: "Yes! Our platform is fully optimized for mobile browsers. All tests work seamlessly on Android and iOS." },
  { q: "Are the mock tests free?", a: "We offer both free and premium tests. Free tests are available to all registered users without any payment." },
  { q: "How is my percentile calculated?", a: "Based on real-time comparison with all students who attempted the same test on our platform." },
  { q: "Can I review answers after submission?", a: "Yes, a detailed solution review with explanations is available immediately after you submit your test." },
  { q: "What is negative marking?", a: "Some tests apply negative marking for wrong answers (e.g., -0.33 marks for MCQs). Check the test instructions for the exact scheme." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        className="w-full flex items-center justify-between py-3.5 text-left hover:text-[#1a73e8] transition-colors gap-4"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <span className="text-[#1a73e8] font-black">?</span>
          {q}
        </span>
        {open
          ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
          : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
        }
      </button>
      {open && (
        <div className="pb-4 px-5 bg-[#F8FAFC] rounded-lg mb-2">
          <p className="text-sm text-gray-600 leading-relaxed pt-2">{a}</p>
        </div>
      )}
    </div>
  );
}

function PaywallModal({ onClose, seriesName }: { onClose: () => void; seriesName: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-br from-[#0f1b2d] to-[#1a73e8] p-8 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 p-1.5 rounded-full transition-colors">
            <X className="h-4 w-4" />
          </button>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/10">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-black mb-1">Unlock Full Access</h2>
          <p className="text-white/80 text-sm font-medium">Get access to all premium tests in {seriesName}</p>
        </div>

        <div className="p-8">
          <div className="space-y-4 mb-8">
            {[
              "All mock tests + chapter tests",
              "Detailed solutions & analytics",
              "Rank predictor & leaderboard",
              "Compare with toppers",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <div className="p-1 bg-blue-50 rounded-full">
                   <CheckCircle2 className="h-3.5 w-3.5 text-[#1a73e8] shrink-0" />
                </div>
                {item}
              </div>
            ))}
          </div>

          <button className="w-full h-12 bg-[#1a73e8] text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:opacity-90 active:scale-95 transition-all mb-4">
            Purchase Pass
          </button>
          <button
            onClick={onClose}
            className="w-full h-11 border-2 border-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all"
          >
            Start with free tests first
          </button>
        </div>
      </div>
    </div>
  );
}

function TestCard({
  test,
  index,
  isAccessible,
  onLockedClick,
}: {
  test: any;
  index: number;
  isAccessible: boolean;
  onLockedClick: () => void;
}) {
  const router = useRouter();
  const hasAttempt = test.attempts && test.attempts > 0;
  const inProgress = test.inProgressAttempts && test.inProgressAttempts > 0;
  const isFree = test.isPublic;
  const isLive = test.status === "LIVE";

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden hover:shadow-md hover:border-blue-100 transition-all group">
      <div className="p-3 md:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            {isLive && (
              <span className="bg-rose-500 text-white text-[8px] font-bold tracking-widest px-1.5 py-0.5 rounded flex items-center gap-1 uppercase">
                <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                Live
              </span>
            )}
            {isFree ? (
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-bold tracking-widest px-1.5 py-0.5 rounded uppercase">Free</span>
            ) : !isAccessible ? (
              <span className="bg-slate-50 text-slate-400 text-[8px] font-bold tracking-widest px-1.5 py-0.5 rounded flex items-center gap-1 uppercase">
                <Lock className="h-2 w-2" /> Locked
              </span>
            ) : null}
            {hasAttempt && isAccessible && (
              <span className="bg-blue-50 text-blue-600 text-[8px] font-bold tracking-widest px-1.5 py-0.5 rounded flex items-center gap-1 uppercase">
                <CheckCircle2 className="h-2 w-2" /> Completed
              </span>
            )}
          </div>

          <h3 className="font-bold text-[13px] text-slate-800 leading-tight group-hover:text-blue-600 transition-colors mb-1.5 line-clamp-1">{test.name}</h3>

          <div className="flex items-center gap-3.5 text-[10px] font-semibold text-slate-400">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {test.durationMins}m</span>
            <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> {test.totalMarks} Marks</span>
            <span className="flex items-center gap-1"><Globe2 className="h-3 w-3" /> EN/HI</span>
          </div>

          {hasAttempt && isAccessible && (
            <div className="mt-3 flex items-center gap-3 text-[10px] font-black uppercase tracking-tighter">
               <span className="text-slate-400">Last Score:</span>
               <span className={cn(
                  "px-2 py-0.5 rounded",
                  test.lastScore >= (test.totalMarks * 0.6) ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
               )}>
                  {test.lastScore}/{test.totalMarks}
               </span>
               <span className="bg-slate-50 text-slate-400 px-2 py-0.5 rounded">Rank #{test.lastRank || "-"}</span>
            </div>
          )}
        </div>

        {/* Right: CTA */}
        <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2.5 md:pt-0">
          {isAccessible ? (
            <>
              {inProgress ? (
                <button
                  onClick={() => router.push(`/tests/instructions/${test.testId}`)}
                  className="flex-1 md:w-28 h-8.5 bg-amber-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all hover:bg-amber-600 active:scale-95 flex items-center justify-center gap-1"
                >
                  Resume <PlayCircle className="h-3 w-3" />
                </button>
              ) : hasAttempt ? (
                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    onClick={() => router.push(`/tests/instructions/${test.testId}`)}
                    className="flex-1 md:w-28 h-8.5 bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-500/10"
                  >
                    Attempt
                  </button>
                  <button
                    onClick={() => router.push(`/tests/solutions/latest?testId=${test.testId}`)}
                    className="h-8.5 px-3 border border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all bg-slate-50/50"
                  >
                    Solutions
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => router.push(`/tests/instructions/${test.testId}`)}
                  className="flex-1 md:w-32 h-8.5 bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
                >
                  Start Test <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={onLockedClick}
              className="flex-1 md:w-40 h-8.5 bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 hover:bg-slate-100 transition-all border border-slate-200"
            >
              <Lock className="h-3 w-3" /> Unlock Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SeriesDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All Tests");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    const fetchData = async (showLoader = false) => {
      try {
        if (showLoader) setLoading(true);
        const res = await apiFetch(`/mockbook/categories/${id}?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
        });
        if (isMounted) setData(res.data);
      } catch (err) {
        console.error("Failed to load series:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData(true);
    const onFocus = () => fetchData(false);
    window.addEventListener('focus', onFocus);
    const interval = setInterval(() => fetchData(false), 10000);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [id]);

  const allTests: any[] = data?.subCategories?.flatMap((sc: any) =>
    sc.mockTests.map((t: any) => ({ ...t, subCategoryName: sc.name }))
  ) || [];

  const freeTests = allTests.filter(t => t.isPublic);
  const totalTests = allTests.length;
  const freeCount = freeTests.length;

  const filteredTests = activeTab === "All Tests" ? allTests
    : activeTab === "Free" ? freeTests
    : allTests.filter(t => t.subCategoryName?.toLowerCase().includes(activeTab.toLowerCase()));

  const catMeta = getCatMeta(data?.name || "");

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F2F8] text-[#0f1b2d] font-sans antialiased">
      <Navbar />
      <div className="flex-1 flex overflow-hidden w-full">
        <Sidebar />
        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 lg:pb-12">

          {loading ? (
            <div className="py-40 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-[#1a73e8] opacity-20" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Initialising Test Series...</p>
            </div>
          ) : !data ? (
            <div className="py-24 text-center px-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                <FileText className="h-8 w-8 text-slate-200" />
              </div>
              <h1 className="text-xl font-black text-slate-800 mb-2">Series not found</h1>
              <p className="text-sm text-slate-400 mb-8 max-w-xs mx-auto">This test series might have been moved or doesn't exist anymore.</p>
              <Link href="/tests" className="inline-flex h-11 px-8 bg-[#1a73e8] text-white rounded-xl items-center justify-center text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:opacity-90 transition-all">
                Browse All Exams
              </Link>
            </div>
          ) : (
            <>
              {/* Breadcrumb - Compact */}
              <div className="bg-white border-b border-slate-100 px-6 py-2 flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest sticky top-0 z-20">
                <Link href="/tests" className="hover:text-blue-600 transition-colors">Test Series</Link>
                <ChevronRight className="h-2.5 w-2.5" />
                <span className="text-slate-500 truncate">{data.name}</span>
              </div>

              {/* HERO SECTION - Compact & Premium */}
              <div className={cn("w-full bg-gradient-to-br relative overflow-hidden", catMeta.gradient)} style={{ minHeight: 180 }}>
                {/* Decorative circles */}
                <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute left-1/4 bottom-[-100px] w-48 h-48 bg-white/5 rounded-full blur-3xl" />

                <div className="relative px-6 py-8 md:px-10 flex flex-col md:flex-row items-center md:items-center justify-between gap-6 max-w-6xl mx-auto">
                  <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
                    {/* Logo - Refined */}
                    <div className="w-20 h-20 rounded-2xl bg-white shadow-2xl flex items-center justify-center shrink-0 text-4xl">
                      {catMeta.icon}
                    </div>
                    <div>
                      <div className="flex flex-wrap justify-center md:justify-start items-center gap-1.5 mb-2">
                        {data.isFree ? (
                          <span className="text-[8px] font-bold tracking-widest bg-emerald-500 text-white px-2 py-0.5 rounded uppercase">Free Series</span>
                        ) : (
                          <span className="text-[8px] font-bold tracking-widest bg-white/10 text-white px-2 py-0.5 rounded flex items-center gap-1 uppercase border border-white/10 backdrop-blur-md">
                            <Lock className="h-2 w-2" /> Premium
                          </span>
                        )}
                        <span className="text-[8px] font-bold tracking-widest bg-white text-blue-600 px-2 py-0.5 rounded uppercase flex items-center gap-1 shadow-sm">
                           <Shield className="h-2.5 w-2.5" /> Verified
                        </span>
                      </div>
                      <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight tracking-tight">{data.name}</h1>
                      <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-white/70 text-[10px] font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-300 text-amber-300" /> 4.8</span>
                        <span className="opacity-30">|</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 12.5k Enrolled</span>
                      </div>
                    </div>
                  </div>

                  {!data.isFree && (
                    <button
                      onClick={() => setPaywallOpen(true)}
                      className="shrink-0 h-10 px-6 bg-white text-blue-600 font-bold text-[11px] uppercase tracking-widest rounded-xl hover:bg-slate-50 active:scale-95 transition-all shadow-xl shadow-black/10 flex items-center gap-2"
                    >
                      Unlock Full Access
                    </button>
                  )}
                </div>

                {/* Quick stats bar - Slimmer */}
                <div className="relative bg-[#000]/20 backdrop-blur-md px-6 py-2.5 flex items-center justify-center md:justify-start gap-8 text-white text-[9px] font-bold uppercase tracking-widest border-t border-white/5 overflow-x-auto no-scrollbar">
                  <span className="flex items-center gap-1.5 whitespace-nowrap opacity-90"><FileText className="h-3.5 w-3.5 opacity-50" /> <span>{totalTests}</span> Tests</span>
                  <span className="flex items-center gap-1.5 whitespace-nowrap text-emerald-300"><Zap className="h-3.5 w-3.5 opacity-50" /> <span>{freeCount}</span> Free</span>
                  <span className="flex items-center gap-1.5 whitespace-nowrap opacity-90"><Globe2 className="h-3.5 w-3.5 opacity-50" /> EN/HI Mixed</span>
                </div>
              </div>

              {/* Main content */}
              <div className="p-4 md:p-8 flex flex-col lg:flex-row gap-8 items-start max-w-7xl mx-auto">
                <div className="w-full lg:flex-1 min-w-0 space-y-6">

                  {/* TAB NAV - Slimmer */}
                  <div className="bg-white border border-slate-100 rounded-xl overflow-x-auto no-scrollbar shadow-sm sticky top-14 z-10">
                    <div className="flex items-center px-2">
                      {TABS.map(tab => {
                        const count = tab === "All Tests" ? totalTests
                          : tab === "Free" ? freeCount
                          : allTests.filter(t => t.subCategoryName?.toLowerCase().includes(tab.toLowerCase())).length;
                        return (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                              "px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider transition-all relative whitespace-nowrap",
                              activeTab === tab
                                ? "text-blue-600"
                                : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            <span className="flex items-center gap-1.5">
                              {tab}
                              {count > 0 && (
                                <span className={cn(
                                  "text-[9px] px-1 py-0.5 rounded font-bold",
                                  activeTab === tab ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400"
                                )}>
                                  {count}
                                </span>
                              )}
                            </span>
                            {activeTab === tab && (
                               <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* TEST LIST */}
                  {filteredTests.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-2xl py-20 text-center shadow-sm">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-50">
                        <FileText className="h-8 w-8 text-slate-200" />
                      </div>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No tests available in this section</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTests.map((test, i) => (
                        <TestCard
                          key={test.id}
                          test={test}
                          index={i}
                          isAccessible={data.isFree || test.isPublic}
                          onLockedClick={() => setPaywallOpen(true)}
                        />
                      ))}
                    </div>
                  )}

                  {/* ABOUT & FAQ ACCORDION */}
                  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setAboutOpen(o => !o)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-black text-sm text-slate-800 flex items-center gap-3 uppercase tracking-widest">
                        <div className="p-1.5 bg-blue-50 rounded-lg">
                           <BookOpen className="h-4 w-4 text-[#1a73e8]" />
                        </div>
                        About This Test Series
                      </span>
                      {aboutOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                    </button>

                    {aboutOpen && (
                      <div className="px-6 pb-8 border-t border-slate-50">
                        <div className="prose prose-slate prose-sm max-w-none pt-6 mb-8 text-slate-600 font-medium">
                          <p className="leading-relaxed">
                            {data.description || "Prepare for your exam with our comprehensive mock test series. Each test is carefully crafted by subject matter experts to match the exact pattern and difficulty of the actual examination. Detailed performance analytics and solutions are provided to help you improve your score with every attempt."}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                           <div className="h-[2px] w-8 bg-[#1a73e8]" />
                           <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-[2px]">Frequently Asked Questions</h4>
                        </div>
                        <div className="space-y-1">
                          {DEFAULT_FAQS.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Right sidebar */}
                <aside className="w-full lg:w-[350px] shrink-0 space-y-6">
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-[2px] text-[#1a73e8] flex items-center gap-2 mb-6">
                      <Zap className="h-4 w-4" /> Why Study With Us?
                    </p>
                    <div className="space-y-6">
                      {[
                        { icon: Award, label: "Latest Exam Pattern", desc: "Updated for 2025 exam formats and syllabus changes." },
                        { icon: Shield, label: "Real Exam Interface", desc: "Experience the actual CBT exam environment." },
                        { icon: BarChart3, label: "Detailed Analytics", desc: "Rank predictor and subject-wise score analytics." },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-50">
                            <item.icon className="h-5 w-5 text-[#1a73e8]" />
                          </div>
                          <div>
                            <p className="text-[13px] font-black text-slate-800 leading-tight mb-1">{item.label}</p>
                            <p className="text-[11px] text-slate-400 font-bold leading-normal">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!data.isFree && (
                    <div className="bg-gradient-to-br from-[#0f1b2d] to-[#1a73e8] rounded-2xl p-6 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden group">
                       <div className="absolute right-[-20%] top-[-20%] w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                      <div className="relative z-10">
                        <Shield className="h-8 w-8 mb-4 opacity-50" />
                        <h4 className="text-lg font-black leading-tight mb-2">Get Full Pro Access</h4>
                        <p className="text-[11px] text-white/70 font-bold mb-6">Unlock all {totalTests} premium tests and detailed chapter-wise analytics.</p>
                        <button
                          onClick={() => setPaywallOpen(true)}
                          className="w-full h-11 bg-white text-[#1a73e8] font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all shadow-lg active:scale-95"
                        >
                          Unlock All Now
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                     <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Community Choice</p>
                     <p className="text-[12px] text-slate-700 font-bold leading-relaxed mb-4">"The best mock tests I've found so far. The interface is exactly like the real SSC exam."</p>
                     <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center border border-emerald-100">
                           <Users className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-tighter">— Rahul S., SSC Topper 2024</p>
                     </div>
                  </div>
                </aside>
              </div>
            </>
          )}
        </main>
      </div>

      {paywallOpen && (
        <PaywallModal onClose={() => setPaywallOpen(false)} seriesName={data?.name || "this series"} />
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
