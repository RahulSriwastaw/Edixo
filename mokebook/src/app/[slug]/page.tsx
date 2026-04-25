"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  ChevronRight, Clock, Lock, PlayCircle, BarChart3, CheckCircle2,
  BookOpen, Loader2, Star, Zap, FileText, ArrowRight, Globe2,
  Users, ChevronDown, ChevronUp, X, Shield, Award
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

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
    <div className="last:border-b-0" style={{ borderBottom: "var(--divider)" }}>
      <button
        className="w-full flex items-center justify-between py-3.5 text-left transition-colors gap-4"
        style={{ color: "var(--text-primary)" }}
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-sm font-semibold flex items-center gap-2">
          <span style={{ color: "#FF6B2B" }} className="font-black">?</span>
          {q}
        </span>
        {open
          ? <ChevronUp className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} />
          : <ChevronDown className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} />
        }
      </button>
      {open && (
        <div className="pb-4 px-5 rounded-lg mb-2" style={{ background: "var(--bg-main)" }}>
          <p className="text-sm leading-relaxed pt-2" style={{ color: "var(--text-secondary)" }}>{a}</p>
        </div>
      )}
    </div>
  );
}

function PaywallModal({ onClose, seriesName }: { onClose: () => void; seriesName: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="relative rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
        <div className="p-8 relative" style={{ background: "#FF6B2B" }}>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white p-1.5 rounded-full transition-colors" style={{ background: "rgba(255,255,255,0.1)" }}>
            <X className="h-4 w-4" />
          </button>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.2)" }}>
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-black mb-1 text-white">Unlock Full Access</h2>
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
              <div key={i} className="flex items-center gap-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                <div className="p-1 rounded-full" style={{ background: "var(--badge-success-bg)" }}>
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--badge-success-text)" }} />
                </div>
                {item}
              </div>
            ))}
          </div>

          <button className="w-full h-12 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all mb-4" style={{ background: "#FF6B2B" }}>
            Purchase Pass
          </button>
          <button
            onClick={onClose}
            className="w-full h-11 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
            style={{ border: "1px solid var(--btn-secondary-border)", color: "var(--btn-secondary-text)" }}
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
  isAccessible,
  onLockedClick,
  seriesSlug
}: {
  test: any;
  isAccessible: boolean;
  onLockedClick: () => void;
  seriesSlug: string;
}) {
  const router = useRouter();
  const hasAttempt = test.attempts && test.attempts > 0;
  const inProgress = test.inProgressAttempts && test.inProgressAttempts > 0;
  const isFree = test.isPublic;
  const isLive = test.status === "LIVE";

  return (
    <div className="rounded-xl overflow-hidden transition-all group card-hover"
      style={{ background: "var(--bg-card)", border: "var(--border-card)" }}
    >
      <div className="p-3 md:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">

        {/* Left: Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            {isLive && (
              <span className="text-[8px] font-bold tracking-widest px-1.5 py-0.5 rounded flex items-center gap-1 uppercase text-white" style={{ background: "var(--badge-error-text)" }}>
                <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                Live
              </span>
            )}
            {isFree ? (
              <span className="text-[8px] font-bold tracking-widest px-1.5 py-0.5 rounded uppercase" style={{ background: "var(--badge-success-bg)", color: "var(--badge-success-text)", border: "1px solid rgba(46,125,50,0.15)" }}>Free</span>
            ) : !isAccessible ? (
              <span className="text-[8px] font-bold tracking-widest px-1.5 py-0.5 rounded flex items-center gap-1 uppercase" style={{ background: "var(--bg-main)", color: "var(--text-muted)" }}>
                <Lock className="h-2 w-2" /> Locked
              </span>
            ) : null}
            {hasAttempt && isAccessible && (
              <span className="text-[8px] font-bold tracking-widest px-1.5 py-0.5 rounded flex items-center gap-1 uppercase" style={{ background: "var(--badge-info-bg)", color: "var(--badge-info-text)" }}>
                <CheckCircle2 className="h-2 w-2" /> Completed
              </span>
            )}
          </div>

          <h3 className="font-bold text-[13px] leading-tight transition-colors mb-1.5 line-clamp-1" style={{ color: "var(--text-primary)" }}>{test.name}</h3>

          <div className="flex items-center gap-3.5 text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {test.durationMins}m</span>
            <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> {test.totalMarks} Marks</span>
            <span className="flex items-center gap-1"><Globe2 className="h-3 w-3" /> EN/HI</span>
          </div>

          {hasAttempt && isAccessible && (
            <div className="mt-3 flex items-center gap-3 text-[10px] font-black uppercase tracking-tighter">
              <span style={{ color: "var(--text-muted)" }}>Last Score:</span>
              <span className={cn(
                "px-2 py-0.5 rounded",
                test.lastScore >= (test.totalMarks * 0.6) ? "" : ""
              )}
                style={test.lastScore >= (test.totalMarks * 0.6) ? { background: "var(--badge-success-bg)", color: "var(--badge-success-text)" } : { background: "rgba(255,107,43,0.08)", color: "#FF6B2B" }}
              >
                {test.lastScore}/{test.totalMarks}
              </span>
              <span className="px-2 py-0.5 rounded" style={{ background: "var(--bg-main)", color: "var(--text-muted)" }}>Rank #{test.lastRank || "-"}</span>
            </div>
          )}
        </div>

        {/* Right: CTA */}
        <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2.5 md:pt-0">
          {isAccessible ? (
            <>
              {inProgress ? (
                <button
                  onClick={() => router.push(`/${seriesSlug}/tests/${test.testId}`)}
                  className="flex-1 md:w-28 h-8.5 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1"
                  style={{ background: "#FF6B2B" }}
                >
                  Resume <PlayCircle className="h-3 w-3" />
                </button>
              ) : hasAttempt ? (
                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    onClick={() => router.push(`/${seriesSlug}/tests/${test.testId}`)}
                    className="flex-1 md:w-28 h-8.5 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all active:scale-95 shadow-sm"
                    style={{ background: "#FF6B2B" }}
                  >
                    Attempt
                  </button>
                  <button
                    onClick={() => router.push(`/tests/solutions/latest?testId=${test.testId}`)}
                    className="h-8.5 px-3 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all"
                    style={{ background: "var(--bg-main)", color: "var(--text-secondary)", border: "1px solid var(--btn-secondary-border)" }}
                  >
                    Solutions
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => router.push(`/${seriesSlug}/tests/${test.testId}`)}
                  className="flex-1 md:w-32 h-8.5 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5"
                  style={{ background: "#FF6B2B" }}
                >
                  Start Test <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={onLockedClick}
              className="flex-1 md:w-40 h-8.5 font-bold text-[10px] uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all"
              style={{ background: "var(--bg-main)", color: "var(--text-muted)", border: "1px solid var(--border-card)" }}
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
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All Tests");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let isMounted = true;

    const fetchData = async (showLoader = false) => {
      try {
        if (showLoader) setLoading(true);
        const res = await apiFetch(`/mockbook/categories/${slug}?t=${Date.now()}`, {
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
  }, [slug]);

  const allTests: any[] = data?.subCategories?.flatMap((sc: any) =>
    sc.mockTests.map((t: any) => ({ ...t, subCategoryName: sc.name }))
  ) || [];

  const freeTests = allTests.filter(t => t.isPublic);
  const totalTests = allTests.length;
  const freeCount = freeTests.length;

  const filteredTests = activeTab === "All Tests" ? allTests
    : activeTab === "Free" ? freeTests
      : allTests.filter(t => t.subCategoryName?.toLowerCase().includes(activeTab.toLowerCase()));

  return (
    <div className="flex flex-col min-h-screen font-sans antialiased" style={{ background: "var(--bg-main)", color: "var(--text-primary)" }}>
      <Navbar />
      <div className="flex-1 flex overflow-hidden w-full">
        <Sidebar />
        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 lg:pb-12">

          {loading ? (
            <div className="py-40 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin opacity-20" style={{ color: "#FF6B2B" }} />
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Initialising Test Series...</p>
            </div>
          ) : !data ? (
            <div className="py-24 text-center px-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                <FileText className="h-8 w-8" style={{ color: "var(--text-muted)" }} />
              </div>
              <h1 className="text-xl font-black mb-2" style={{ color: "var(--text-primary)" }}>Series not found</h1>
              <p className="text-sm mb-8 max-w-xs mx-auto" style={{ color: "var(--text-muted)" }}>This test series might have been moved or doesn't exist anymore.</p>
              <Link href="/tests" className="inline-flex h-11 px-8 text-white rounded-xl items-center justify-center text-sm font-black uppercase tracking-widest transition-all"
                style={{ background: "#FF6B2B" }}
              >
                Browse All Exams
              </Link>
            </div>
          ) : (
            <>
              {/* Breadcrumb - Compact */}
              <div className="px-6 py-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest sticky top-0 z-20"
                style={{ background: "var(--bg-sidebar)", borderBottom: "var(--divider)", color: "var(--text-muted)" }}
              >
                <Link href="/tests" className="hover:text-[#FF6B2B] transition-colors">Test Series</Link>
                <ChevronRight className="h-2.5 w-2.5" />
                <span className="truncate">{data.name}</span>
              </div>

              {/* HERO SECTION - Compact & Premium */}
              <div className="w-full relative overflow-hidden" style={{ minHeight: 180, background: "#FF6B2B" }}>
                <div className="absolute right-0 top-0 w-80 h-80 rounded-full -translate-y-1/2 translate-x-1/4" style={{ background: "rgba(255,255,255,0.05)" }} />
                <div className="absolute left-1/4 bottom-[-100px] w-48 h-48 rounded-full blur-3xl" style={{ background: "rgba(255,255,255,0.05)" }} />

                <div className="relative px-6 py-8 md:px-10 flex flex-col md:flex-row items-center md:items-center justify-between gap-6 max-w-6xl mx-auto">
                  <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
                    <div className="w-20 h-20 rounded-2xl shadow-2xl flex items-center justify-center shrink-0 text-4xl" style={{ background: "var(--bg-card)" }}>
                      📚
                    </div>
                    <div>
                      <div className="flex flex-wrap justify-center md:justify-start items-center gap-1.5 mb-2">
                        {data.isFree ? (
                          <span className="text-[8px] font-bold tracking-widest text-white px-2 py-0.5 rounded uppercase" style={{ background: "var(--badge-success-text)" }}>Free Series</span>
                        ) : (
                          <span className="text-[8px] font-bold tracking-widest text-white px-2 py-0.5 rounded flex items-center gap-1 uppercase border border-white/10" style={{ background: "rgba(255,255,255,0.1)" }}>
                            <Lock className="h-2 w-2" /> Premium
                          </span>
                        )}
                        <span className="text-[8px] font-bold tracking-widest px-2 py-0.5 rounded uppercase flex items-center gap-1 shadow-sm" style={{ background: "var(--bg-card)", color: "#FF6B2B" }}>
                          <Shield className="h-2.5 w-2.5" /> Verified
                        </span>
                      </div>
                      <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight tracking-tight">{data.name}</h1>
                      <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-white/70 text-[10px] font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Star className="h-3 w-3" style={{ color: "#FFD700" }} /> 4.8</span>
                        <span className="opacity-30">|</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 12.5k Enrolled</span>
                      </div>
                    </div>
                  </div>

                  {!data.isFree && (
                    <button
                      onClick={() => setPaywallOpen(true)}
                      className="shrink-0 h-10 px-6 font-bold text-[11px] uppercase tracking-widest rounded-xl active:scale-95 transition-all shadow-xl flex items-center gap-2"
                      style={{ background: "var(--bg-card)", color: "#FF6B2B" }}
                    >
                      Unlock Full Access
                    </button>
                  )}
                </div>

                {/* Quick stats bar */}
                <div className="relative px-6 py-2.5 flex items-center justify-center md:justify-start gap-8 text-white text-[9px] font-bold uppercase tracking-widest border-t border-white/5 overflow-x-auto no-scrollbar"
                  style={{ background: "rgba(0,0,0,0.2)" }}
                >
                  <span className="flex items-center gap-1.5 whitespace-nowrap opacity-90"><FileText className="h-3.5 w-3.5 opacity-50" /> <span>{totalTests}</span> Tests</span>
                  <span className="flex items-center gap-1.5 whitespace-nowrap" style={{ color: "#90EE90" }}><Zap className="h-3.5 w-3.5 opacity-50" /> <span>{freeCount}</span> Free</span>
                  <span className="flex items-center gap-1.5 whitespace-nowrap opacity-90"><Globe2 className="h-3.5 w-3.5 opacity-50" /> EN/HI Mixed</span>
                </div>
              </div>

              {/* Main content */}
              <div className="p-4 md:p-8 flex flex-col lg:flex-row gap-8 items-start max-w-7xl mx-auto">
                <div className="w-full lg:flex-1 min-w-0 space-y-6">

                  {/* TAB NAV */}
                  <div className="rounded-xl overflow-x-auto no-scrollbar shadow-sm sticky top-14 z-10" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
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
                              activeTab === tab ? "" : "hover:opacity-80"
                            )}
                            style={{ color: activeTab === tab ? "#FF6B2B" : "var(--text-muted)" }}
                          >
                            <span className="flex items-center gap-1.5">
                              {tab}
                              {count > 0 && (
                                <span className="text-[9px] px-1 py-0.5 rounded font-bold" style={activeTab === tab ? { background: "rgba(255,107,43,0.08)", color: "#FF6B2B" } : { background: "var(--bg-main)", color: "var(--text-muted)" }}>
                                  {count}
                                </span>
                              )}
                            </span>
                            {activeTab === tab && (
                              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full" style={{ background: "#FF6B2B" }} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* TEST LIST */}
                  {filteredTests.length === 0 ? (
                    <div className="rounded-2xl py-20 text-center border-2 border-dashed" style={{ background: "var(--bg-card)", borderColor: "var(--border-input)" }}>
                      <p className="font-semibold mb-3" style={{ color: "var(--text-muted)" }}>No tests available in this section</p>
                      <button onClick={() => setActiveTab("all")} className="font-bold hover:underline" style={{ color: "#FF6B2B" }}>Explore All Exams →</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTests.map((test) => (
                        <TestCard
                          key={test.id}
                          test={test}
                          isAccessible={data.isFree || test.isPublic}
                          onLockedClick={() => setPaywallOpen(true)}
                          seriesSlug={data.slug || slug}
                        />
                      ))}
                    </div>
                  )}

                  {/* ABOUT & FAQ ACCORDION */}
                  <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                    <button
                      onClick={() => setAboutOpen(o => !o)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <span className="font-black text-sm flex items-center gap-3 uppercase tracking-widest">
                        <div className="p-1.5 rounded-lg" style={{ background: "rgba(255,107,43,0.08)" }}>
                          <BookOpen className="h-4 w-4" style={{ color: "#FF6B2B" }} />
                        </div>
                        About This Test Series
                      </span>
                      {aboutOpen ? <ChevronUp className="h-5 w-5" style={{ color: "var(--text-muted)" }} /> : <ChevronDown className="h-5 w-5" style={{ color: "var(--text-muted)" }} />}
                    </button>

                    {aboutOpen && (
                      <div className="px-6 pb-8" style={{ borderTop: "var(--divider)" }}>
                        <div className="prose prose-slate prose-sm max-w-none pt-6 mb-8 font-medium" style={{ color: "var(--text-secondary)" }}>
                          <p className="leading-relaxed">
                            {data.description || "Prepare for your exam with our comprehensive mock test series. Each test is carefully crafted by subject matter experts to match the exact pattern and difficulty of the actual examination. Detailed performance analytics and solutions are provided to help you improve your score with every attempt."}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-[2px] w-8" style={{ background: "#FF6B2B" }} />
                          <h4 className="text-[12px] font-black uppercase tracking-[2px]" style={{ color: "var(--text-primary)" }}>Frequently Asked Questions</h4>
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
                  <div className="rounded-2xl p-6 shadow-sm" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                    <p className="text-[11px] font-black uppercase tracking-[2px] flex items-center gap-2 mb-6" style={{ color: "#FF6B2B" }}>
                      <Zap className="h-4 w-4" /> Why Study With Us?
                    </p>
                    <div className="space-y-6">
                      {[
                        { icon: Award, label: "Latest Exam Pattern", desc: "Updated for 2025 exam formats and syllabus changes." },
                        { icon: Shield, label: "Real Exam Interface", desc: "Experience the actual CBT exam environment." },
                        { icon: BarChart3, label: "Detailed Analytics", desc: "Rank predictor and subject-wise score analytics." },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,107,43,0.08)" }}>
                            <item.icon className="h-5 w-5" style={{ color: "#FF6B2B" }} />
                          </div>
                          <div>
                            <p className="text-[13px] font-black leading-tight mb-1" style={{ color: "var(--text-primary)" }}>{item.label}</p>
                            <p className="text-[11px] font-bold leading-normal" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!data.isFree && (
                    <div className="rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group" style={{ background: "#FF6B2B" }}>
                      <div className="absolute right-[-20%] top-[-20%] w-32 h-32 rounded-full blur-2xl group-hover:scale-125 transition-transform" style={{ background: "rgba(255,255,255,0.05)" }} />
                      <div className="relative z-10">
                        <Shield className="h-8 w-8 mb-4 opacity-50" />
                        <h4 className="text-lg font-black leading-tight mb-2">Get Full Pro Access</h4>
                        <p className="text-[11px] text-white/70 font-bold mb-6">Unlock all {totalTests} premium tests and detailed chapter-wise analytics.</p>
                        <button
                          onClick={() => setPaywallOpen(true)}
                          className="w-full h-11 font-black text-[11px] uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95"
                          style={{ background: "var(--bg-card)", color: "#FF6B2B" }}
                        >
                          Unlock All Now
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl p-6" style={{ background: "var(--badge-success-bg)", border: "1px solid rgba(46,125,50,0.15)" }}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "var(--badge-success-text)" }}>Community Choice</p>
                    <p className="text-[12px] font-bold leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>"The best mock tests I've found so far. The interface is exactly like the real SSC exam."</p>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                        <Users className="h-3.5 w-3.5" style={{ color: "var(--badge-success-text)" }} />
                      </div>
                      <p className="text-[11px] font-black uppercase tracking-tighter" style={{ color: "var(--text-muted)" }}>— Rahul S., SSC Topper 2024</p>
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
