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
  default:     { gradient: "from-indigo-600 to-indigo-800",   icon: "📚" },
  railways:    { gradient: "from-blue-600 to-blue-800",       icon: "🚂" },
  rrb:         { gradient: "from-blue-600 to-blue-800",       icon: "🚂" },
  ssc:         { gradient: "from-red-500 to-red-700",         icon: "📋" },
  banking:     { gradient: "from-teal-600 to-teal-800",      icon: "🏦" },
  insurance:   { gradient: "from-teal-600 to-teal-800",      icon: "🏦" },
  defence:     { gradient: "from-green-700 to-green-900",    icon: "🎖️" },
  police:      { gradient: "from-green-600 to-green-800",    icon: "🛡️" },
  state:       { gradient: "from-amber-500 to-amber-700",    icon: "🏛️" },
  teaching:    { gradient: "from-pink-500 to-pink-700",      icon: "🎓" },
  civil:       { gradient: "from-purple-600 to-purple-800",  icon: "⚖️" },
  upsc:        { gradient: "from-purple-600 to-purple-800",  icon: "⚖️" },
  engineering: { gradient: "from-orange-500 to-orange-700",  icon: "🔧" },
  gate:        { gradient: "from-orange-500 to-orange-700",  icon: "🔧" },
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
        className="w-full flex items-center justify-between py-3.5 text-left hover:text-[#F4511E] transition-colors gap-4"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <span className="text-[#F4511E] font-black">?</span>
          {q}
        </span>
        {open
          ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
          : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
        }
      </button>
      {open && (
        <div className="pb-4 px-5 bg-[#FAFAFA] rounded-lg mb-2">
          <p className="text-sm text-gray-600 leading-relaxed pt-2">{a}</p>
        </div>
      )}
    </div>
  );
}

function PaywallModal({ onClose, seriesName }: { onClose: () => void; seriesName: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-br from-[#F4511E] to-[#D03B12] p-6 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X className="h-5 w-5" />
          </button>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-1">Unlock Full Access</h2>
          <p className="text-white/80 text-sm">Get access to all premium tests in {seriesName}</p>
        </div>

        <div className="p-6">
          <div className="space-y-3 mb-6">
            {[
              "All mock tests + chapter tests",
              "Detailed solutions & analytics",
              "Rank predictor & leaderboard",
              "Compare with toppers",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-[#F4511E] shrink-0" />
                {item}
              </div>
            ))}
          </div>

          <button className="w-full bg-[#F4511E] hover:bg-[#D03B12] text-white font-bold py-3 rounded-xl transition-colors mb-3">
            Purchase Access
          </button>
          <button
            onClick={onClose}
            className="w-full border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            Start with free tests first →
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
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
      <div className="p-4">
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-2">
          {isLive && (
            <span className="bg-red-500 text-white text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded animate-pulse">LIVE NOW</span>
          )}
          {isFree ? (
            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded">🆓 FREE</span>
          ) : !isAccessible ? (
            <span className="bg-gray-100 text-gray-500 text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Lock className="h-2 w-2" /> LOCKED
            </span>
          ) : null}
          {hasAttempt && isAccessible && (
            <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <CheckCircle2 className="h-2 w-2" /> COMPLETED
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-sm text-gray-900 leading-snug mb-2">{test.name}</h3>

        {/* Stats */}
        <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500 mb-3">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-gray-400" /> {test.durationMins} Mins</span>
          <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3 text-gray-400" /> {test.totalMarks} Marks</span>
          <span className="flex items-center gap-1"><Globe2 className="h-3 w-3 text-gray-400" /> EN+HI</span>
        </div>

        {/* Previous attempt row */}
        {hasAttempt && isAccessible && (
          <div className="flex items-center gap-2 mb-3 text-[11px] font-bold">
            <span className="text-gray-500">Last attempt:</span>
            {test.lastScore != null && (
              <span className={cn(
                "px-1.5 py-0.5 rounded font-black",
                test.lastScore >= (test.totalMarks * 0.6) ? "bg-emerald-50 text-emerald-600" :
                test.lastScore >= (test.totalMarks * 0.4) ? "bg-amber-50 text-amber-600" :
                "bg-red-50 text-red-500"
              )}>
                {test.lastScore}/{test.totalMarks}
              </span>
            )}
            {test.lastRank && (
              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Rank #{test.lastRank}</span>
            )}
          </div>
        )}

        <div className="h-px bg-gray-100 my-3" />

        {/* CTA row */}
        <div className="flex items-center gap-2">
          {isAccessible ? (
            <>
              {inProgress ? (
                <button
                  onClick={() => router.push(`/tests/instructions/${test.testId}`)}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-9 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  Resume Test → <PlayCircle className="h-3.5 w-3.5" />
                </button>
              ) : hasAttempt ? (
                <>
                  <button
                    onClick={() => router.push(`/tests/instructions/${test.testId}`)}
                    className="flex-1 bg-[#F4511E] hover:bg-[#D03B12] text-white font-bold text-xs h-9 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    Attempt {(test.attempts || 0) + 1} →
                  </button>
                  <button
                    onClick={() => router.push(`/tests/solutions/latest?testId=${test.testId}`)}
                    className="px-3 border border-gray-300 text-gray-700 font-bold text-xs h-9 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    Solutions
                  </button>
                </>
              ) : (
                <button
                  onClick={() => router.push(`/tests/instructions/${test.testId}`)}
                  className="flex-1 bg-[#F4511E] hover:bg-[#D03B12] text-white font-bold text-xs h-9 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  Begin Test <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={onLockedClick}
              className="flex-1 bg-gray-100 text-gray-400 font-bold text-xs h-9 rounded-lg flex items-center justify-center gap-1.5 hover:bg-gray-200 transition-colors"
            >
              <Lock className="h-3.5 w-3.5" /> Unlock to Attempt
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
    <div className="flex flex-col min-h-screen bg-[#F5F5F5]">
      <Navbar />
      <div className="flex-1 flex overflow-hidden w-full">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">

          {loading ? (
            <div className="py-40 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#F4511E]" />
            </div>
          ) : !data ? (
            <div className="py-24 text-center">
              <FileText className="h-10 w-10 text-gray-200 mx-auto mb-4" />
              <p className="text-base font-bold text-gray-900 mb-1">Series not found</p>
              <p className="text-sm text-gray-500 mb-6">The test series might have been moved or deleted.</p>
              <button onClick={() => router.push("/tests")} className="bg-[#F4511E] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#D03B12]">
                Browse All Tests
              </button>
            </div>
          ) : (
            <>
              {/* Breadcrumb */}
              <div className="bg-white border-b border-gray-100 px-6 py-2 flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <Link href="/tests" className="hover:text-[#F4511E] transition-colors">Test Series</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-gray-700 line-clamp-1">{data.name}</span>
              </div>

              {/* HERO SECTION */}
              <div className={cn("w-full bg-gradient-to-br relative overflow-hidden", catMeta.gradient)} style={{ minHeight: 200 }}>
                {/* Decorative circles */}
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute left-1/2 bottom-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />

                <div className="relative px-6 py-8 md:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 max-w-5xl">
                  <div className="flex items-center gap-5">
                    {/* Logo */}
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center shrink-0 text-3xl">
                      {catMeta.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        {data.isFree ? (
                          <span className="text-[10px] font-black tracking-widest bg-emerald-400 text-white px-2 py-0.5 rounded">FREE SERIES</span>
                        ) : (
                          <span className="text-[10px] font-black tracking-widest bg-white/20 text-white px-2 py-0.5 rounded flex items-center gap-1">
                            <Lock className="h-2.5 w-2.5" /> PREMIUM
                          </span>
                        )}
                      </div>
                      <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{data.name}</h1>
                      <div className="flex items-center gap-3 mt-2 text-white/70 text-xs font-medium">
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-300 text-amber-300" /> 4.8</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 12K+ Enrolled</span>
                      </div>
                    </div>
                  </div>

                  {!data.isFree && (
                    <button
                      onClick={() => setPaywallOpen(true)}
                      className="shrink-0 bg-white text-[#F4511E] font-bold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm shadow"
                    >
                      🔓 Unlock Full Access
                    </button>
                  )}
                </div>

                {/* Quick stats bar */}
                <div className="relative bg-black/20 backdrop-blur-sm px-6 py-2.5 flex items-center gap-6 text-white/90 text-xs font-bold overflow-x-auto">
                  <span className="flex items-center gap-1.5 whitespace-nowrap">📝 <span>{totalTests}</span> Tests</span>
                  <span className="opacity-40">|</span>
                  <span className="flex items-center gap-1.5 whitespace-nowrap text-emerald-300">🆓 <span>{freeCount}</span> Free</span>
                  <span className="opacity-40">|</span>
                  <span className="flex items-center gap-1.5 whitespace-nowrap">🌐 Hindi + English</span>
                  {data.description && (
                    <>
                      <span className="opacity-40">|</span>
                      <span className="opacity-70 line-clamp-1">{data.description}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Main content */}
              <div className="p-4 md:p-6 flex flex-col lg:flex-row gap-6 items-start max-w-[1400px] mx-auto">
                <div className="w-full lg:flex-1 min-w-0 space-y-4">

                  {/* TAB NAV */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto no-scrollbar">
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
                              "px-4 py-3.5 text-xs font-bold whitespace-nowrap transition-colors border-b-[3px] flex items-center gap-1.5",
                              activeTab === tab
                                ? "border-[#F4511E] text-[#F4511E]"
                                : "border-transparent text-gray-500 hover:text-gray-900"
                            )}
                          >
                            {tab}
                            {count > 0 && (
                              <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full font-black",
                                activeTab === tab ? "bg-[#FFF3F0] text-[#F4511E]" : "bg-gray-100 text-gray-500"
                              )}>
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* TEST LIST */}
                  {filteredTests.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
                      <FileText className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm font-bold text-gray-500">No tests in this section yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
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
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setAboutOpen(o => !o)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-bold text-sm text-gray-900 flex items-center gap-2">
                        ℹ️ About This Series
                      </span>
                      {aboutOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </button>

                    {aboutOpen && (
                      <div className="px-5 pb-5 border-t border-gray-100">
                        <p className="text-sm text-gray-600 leading-relaxed mt-4 mb-6">
                          {data.description || "Prepare for your exam with our comprehensive mock test series. Each test is carefully crafted by subject matter experts to match the exact pattern and difficulty of the actual examination."}
                        </p>

                        <h4 className="text-sm font-bold text-gray-900 mb-3">Frequently Asked Questions</h4>
                        <div className="space-y-0">
                          {DEFAULT_FAQS.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Right sidebar */}
                <aside className="w-full lg:w-[300px] shrink-0 space-y-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#F4511E] flex items-center gap-1.5 mb-2">
                      <Zap className="h-3 w-3" /> Why Study With Us?
                    </p>
                    <div className="space-y-4 mt-3">
                      {[
                        { icon: Award, label: "Latest Exam Pattern", desc: "Updated for 2025 exam formats." },
                        { icon: Shield, label: "Real Exam Interface", desc: "Matches the actual exam portal." },
                        { icon: BarChart3, label: "Detailed Analytics", desc: "In-depth explanations for all questions." },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#FFF3F0] flex items-center justify-center shrink-0">
                            <item.icon className="h-4 w-4 text-[#F4511E]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">{item.label}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!data.isFree && (
                    <div className="bg-gradient-to-br from-[#F4511E] to-[#D03B12] rounded-xl p-5 text-white">
                      <Lock className="h-6 w-6 mb-3 opacity-80" />
                      <h4 className="font-bold text-sm mb-1">Get Full Access</h4>
                      <p className="text-xs text-white/70 mb-4">Unlock all {totalTests} tests in this series.</p>
                      <button
                        onClick={() => setPaywallOpen(true)}
                        className="w-full bg-white text-[#F4511E] font-bold text-xs py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Unlock Now →
                      </button>
                    </div>
                  )}
                </aside>
              </div>
            </>
          )}
        </main>
      </div>

      {paywallOpen && (
        <PaywallModal onClose={() => setPaywallOpen(false)} seriesName={data?.name || "this series"} />
      )}
    </div>
  );
}
