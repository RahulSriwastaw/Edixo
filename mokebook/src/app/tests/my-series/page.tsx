"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, isAuthenticated } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Loader2, BookOpen, BarChart3, Clock, CheckCircle2,
  Trophy, ArrowRight, PlayCircle, RotateCcw, Search,
  ChevronRight, Calendar, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AttemptSummary {
  id: string;
  testId: string;
  testName: string;
  score: number;
  totalMarks: number;
  rank?: number;
  percentile: number;
  attempted: number;
  submittedAt?: string;
  attemptNumber: number;
  status: string;
}

/** 1. Attempt History Card (Horizontal/Professional) */
function AttemptHistoryCard({ attempt }: { attempt: AttemptSummary }) {
  const router = useRouter();

  return (
    <div className="rounded-lg p-4 transition-all group card-hover"
      style={{ background: "var(--bg-card)", border: "var(--border-card)" }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        {/* Left: Info & Metrics */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter" style={{ background: "var(--badge-info-bg)", color: "var(--badge-info-text)" }}>PRC</span>
            <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
              <Calendar className="h-3 w-3" />
              {attempt.submittedAt && new Date(attempt.submittedAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
            </span>
          </div>

          <h3 className="text-[15px] font-bold leading-tight mb-3 truncate" style={{ color: "var(--text-primary)" }}>
            {attempt.testName}
          </h3>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-md" style={{ background: "var(--bg-main)" }}>
                <Trophy className="h-3.5 w-3.5" style={{ color: "#FF6B2B" }} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-tighter leading-none mb-0.5" style={{ color: "var(--text-muted)" }}>Your Rank</p>
                <p className="text-[13px] font-bold leading-none" style={{ color: "var(--text-primary)" }}>#{attempt.rank || "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-md" style={{ background: "var(--bg-main)" }}>
                <BarChart3 className="h-3.5 w-3.5" style={{ color: "var(--badge-success-text)" }} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-tighter leading-none mb-0.5" style={{ color: "var(--text-muted)" }}>Your Score</p>
                <p className="text-[13px] font-bold leading-none" style={{ color: "var(--text-primary)" }}>{attempt.score?.toFixed(2)}<span className="text-[10px]" style={{ color: "var(--text-muted)" }}> / {attempt.totalMarks}</span></p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-md" style={{ background: "var(--bg-main)" }}>
                <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "var(--badge-info-text)" }} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-tighter leading-none mb-0.5" style={{ color: "var(--text-muted)" }}>Percentile</p>
                <p className="text-[13px] font-bold leading-none" style={{ color: "var(--text-primary)" }}>{attempt.percentile ? `${attempt.percentile}%` : "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-row md:flex-col items-center gap-2 shrink-0">
          <div className="flex gap-2 w-full">
            <button
              onClick={() => router.push(`/tests/solutions/${attempt.id}`)}
              className="flex-1 md:w-28 h-9 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all"
              style={{ background: "transparent", color: "var(--btn-secondary-text)", border: "1px solid var(--btn-secondary-border)" }}
            >
              Solution
            </button>
            <button
              onClick={() => router.push(`/tests/results/${attempt.id}`)}
              className="flex-1 md:w-28 h-9 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all"
              style={{ background: "transparent", color: "#FF6B2B", border: "1px solid rgba(255,107,43,0.3)" }}
            >
              Analysis
            </button>
          </div>

          <button
            onClick={() => router.push(`/tests/instructions/${attempt.testId}`)}
            className="hidden md:flex items-center justify-end gap-1.5 text-[10px] font-black uppercase tracking-widest mt-1 ml-auto transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <RotateCcw className="h-3 w-3" />
            Reattempt
          </button>
        </div>
      </div>
    </div>
  );
}

/** ═══════════════════════════════════════════════
 * MAIN PAGE COMPONENT
 * ═══════════════════════════════════════════════ */

export default function MySeriesPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"tests" | "quizzes">("tests");

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login?redirect=/tests/my-series');
    }
  }, [router]);

  useEffect(() => {
    async function fetchAttempts() {
      if (!isAuthenticated()) return;
      try {
        setLoading(true);
        const res = await apiFetch("/mockbook/user/my-attempts");
        setAttempts(res.data || []);
      } catch (err) {
        setAttempts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAttempts();
  }, []);

  const filtered = attempts.filter(a =>
    !search || (a.testName || "").toLowerCase().includes(search.toLowerCase())
  );

  // Grouping by Month logic
  const groupAttemptsByMonth = (items: AttemptSummary[]) => {
    const groups: Record<string, AttemptSummary[]> = {};
    items
      .filter(a => a.status === "SUBMITTED")
      .forEach(a => {
        const date = a.submittedAt ? new Date(a.submittedAt) : new Date();
        const monthYear = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        if (!groups[monthYear]) groups[monthYear] = [];
        groups[monthYear].push(a);
      });
    return groups;
  };

  const groupedAttempts = groupAttemptsByMonth(filtered);
  const inProgressAttempts = filtered.filter(a => a.status === "IN_PROGRESS");

  return (
    <div className="flex flex-col min-h-screen font-sans antialiased" style={{ background: "var(--bg-main)", color: "var(--text-primary)" }}>
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 lg:pb-12">

          {/* 1. COMPACT PAGE HEADER */}
          <div className="sticky top-0 z-20" style={{ background: "var(--bg-sidebar)", borderBottom: "var(--divider)" }}>
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-[20px] font-bold tracking-tight leading-none mb-2">Your Attempted Tests & Quizzes</h1>
                  <nav className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                    <Link href="/" className="hover:text-[#FF6B2B] transition-colors">Home</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span>Attempted Tests</span>
                  </nav>
                </div>

                <div className="relative group min-w-[200px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
                  <input
                    placeholder="Search your tests..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-lg text-[13px] font-bold transition-all placeholder:text-[var(--text-muted)]"
                    style={{ background: "var(--bg-input)", border: "1px solid var(--border-input)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>

              {/* TABS BAR */}
              <div className="flex gap-8 mt-6 -mb-6 relative">
                <button
                  onClick={() => setActiveTab("tests")}
                  className={cn(
                    "pb-2 text-[13px] font-black uppercase tracking-widest transition-all relative",
                    activeTab === "tests" ? "" : "hover:opacity-80"
                  )}
                  style={{ color: activeTab === "tests" ? "#FF6B2B" : "var(--text-muted)" }}
                >
                  Tests
                  {activeTab === "tests" && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full" style={{ background: "#FF6B2B" }} />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("quizzes")}
                  className={cn(
                    "pb-2 text-[13px] font-black uppercase tracking-widest transition-all relative",
                    activeTab === "quizzes" ? "" : "hover:opacity-80"
                  )}
                  style={{ color: activeTab === "quizzes" ? "#FF6B2B" : "var(--text-muted)" }}
                >
                  Quizzes
                  {activeTab === "quizzes" && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full" style={{ background: "#FF6B2B" }} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin opacity-20" style={{ color: "#FF6B2B" }} />
                <p className="text-[12px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Loading History...</p>
              </div>
            ) : attempts.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed p-12 text-center space-y-4 max-w-sm mx-auto"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-input)" }}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: "var(--bg-main)" }}>
                  <BookOpen className="h-8 w-8" style={{ color: "var(--text-muted)" }} />
                </div>
                <p className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>No tests attempted yet!</p>
                <Link href="/tests" className="inline-flex h-10 px-6 rounded-lg items-center justify-center text-[12px] font-black uppercase tracking-widest text-white transition-all"
                  style={{ background: "#FF6B2B" }}
                >
                  Explore Tests
                </Link>
              </div>
            ) : (
              <>
                {/* 2. IN-PROGRESS ATTEMPTS */}
                {inProgressAttempts.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,107,43,0.08)" }}>
                        <PlayCircle className="h-5 w-5" style={{ color: "#FF6B2B" }} />
                      </div>
                      <h2 className="text-[14px] font-bold uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>Resume Learning ({inProgressAttempts.length})</h2>
                    </div>
                    <div className="space-y-3">
                      {inProgressAttempts.map(att => (
                        <div key={att.id} className="rounded-lg p-3.5 shadow-sm transition-all flex items-center justify-between gap-4"
                          style={{ background: "var(--bg-card)", border: "var(--border-card)" }}
                        >
                          <div className="min-w-0">
                            <h3 className="text-[14px] font-bold line-clamp-1 mb-1" style={{ color: "var(--text-primary)" }}>{att.testName}</h3>
                            <p className="text-[10px] font-bold flex items-center gap-1 uppercase tracking-tight" style={{ color: "#FF6B2B" }}>
                              <span className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" style={{ background: "#FF6B2B" }} />
                              Ready to resume
                            </p>
                          </div>
                          <button
                            onClick={() => router.push(`/tests/instructions/${att.testId}`)}
                            className="h-8 px-4 rounded-lg text-[11px] font-black uppercase tracking-widest text-white transition-colors shadow-sm"
                            style={{ background: "#FF6B2B" }}
                          >
                            Resume
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 3. ATTEMPT HISTORY GROUPED BY MONTH */}
                <div className="space-y-12">
                  {Object.keys(groupedAttempts).map(monthYear => (
                    <section key={monthYear}>
                      <div className="flex items-center justify-between mb-5 pb-2" style={{ borderBottom: "var(--divider)" }}>
                        <h2 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>{monthYear}</h2>
                        <Filter className="h-4 w-4 cursor-pointer hover:opacity-80 transition-colors" style={{ color: "var(--text-muted)" }} />
                      </div>
                      <div className="space-y-4">
                        {groupedAttempts[monthYear].map(att => (
                          <AttemptHistoryCard key={att.id} attempt={att} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </>
            )}

          </div>
        </main>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
