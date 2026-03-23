"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Loader2, BookOpen, BarChart3, Clock, CheckCircle2,
  Trophy, ArrowRight, PlayCircle, RotateCcw, Search
} from "lucide-react";

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

export default function MySeriesPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiFetch("/mockbook/user/my-attempts")
      .then(res => setAttempts(res.data || []))
      .catch(() => setAttempts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = attempts.filter(a =>
    !search || (a.testName || "").toLowerCase().includes(search.toLowerCase())
  );

  const completedAttempts = filtered.filter(a => a.status === "SUBMITTED");
  const inProgressAttempts = filtered.filter(a => a.status === "IN_PROGRESS");

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">

          {/* Page title bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
            <div>
              <h1 className="text-base font-bold text-gray-900">My Tests</h1>
              <p className="text-xs text-gray-400 font-medium">All your attempted and in-progress tests</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                placeholder="Search tests..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 h-8 bg-gray-50 border border-gray-200 rounded-lg text-sm w-44 sm:w-56 focus:outline-none focus:border-[#1a73e8] transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="h-8 w-8 animate-spin text-[#1a73e8]" />
            </div>
          ) : attempts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 px-8">
              <BookOpen className="h-12 w-12 text-gray-200" />
              <div>
                <p className="text-base font-bold text-gray-700">No tests attempted yet</p>
                <p className="text-sm text-gray-400 mt-1">Your tests will appear here with full analytics.</p>
              </div>
              <Link href="/tests" className="bg-[#1a73e8] text-white px-6 py-2.5 rounded text-sm font-bold hover:bg-[#1557b0] transition-colors">
                Browse Tests
              </Link>
            </div>
          ) : (
            <div className="p-4 md:p-6 space-y-8 max-w-4xl">

              {/* In-Progress Section */}
              {inProgressAttempts.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <PlayCircle className="h-4 w-4 text-amber-500" /> In Progress ({inProgressAttempts.length})
                  </h2>
                  <div className="space-y-3">
                    {inProgressAttempts.map(att => (
                      <div key={att.id} className="bg-white rounded-xl border border-amber-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                        <div>
                          <p className="font-bold text-sm text-gray-900">{att.testName}</p>
                          <p className="text-xs text-amber-600 font-medium mt-0.5 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> In progress — tap to resume
                          </p>
                        </div>
                        <button
                          onClick={() => router.push(`/tests/instructions/${att.testId}`)}
                          className="bg-amber-500 text-white font-bold text-xs h-8 px-5 rounded-lg transition-colors hover:bg-amber-600 flex items-center gap-1 whitespace-nowrap"
                        >
                          Resume <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Completed Attempts */}
              {completedAttempts.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Completed ({completedAttempts.length})
                  </h2>
                  <div className="space-y-3">
                    {completedAttempts.map(att => {
                      const scorePct = att.totalMarks ? Math.round((att.score / att.totalMarks) * 100) : 0;
                      return (
                        <div key={att.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[10px] font-black text-[#1a73e8] bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest">
                                  Attempt {att.attemptNumber}
                                </span>
                                {att.submittedAt && (
                                  <span className="text-[10px] text-gray-400 font-medium">
                                    {new Date(att.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-sm text-gray-900 leading-snug truncate">{att.testName}</h3>

                              {/* Stats row */}
                              <div className="flex flex-wrap items-center gap-4 mt-2">
                                <div className="flex items-center gap-1 text-[11px] font-bold text-gray-600">
                                  <BarChart3 className="h-3 w-3 text-purple-500" />
                                  {att.score?.toFixed(2)}/{att.totalMarks}
                                  <span className="text-gray-400 font-normal ml-1">({scorePct}%)</span>
                                </div>
                                {att.rank && (
                                  <div className="flex items-center gap-1 text-[11px] font-bold text-gray-600">
                                    <Trophy className="h-3 w-3 text-amber-500" />
                                    Rank #{att.rank}
                                  </div>
                                )}
                                {att.percentile > 0 && (
                                  <div className="text-[11px] font-bold text-[#1a73e8]">
                                    {att.percentile}%ile
                                  </div>
                                )}
                              </div>

                              {/* Score bar */}
                              <div className="mt-2.5 h-1.5 bg-gray-100 rounded-full overflow-hidden w-full max-w-xs">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${scorePct}%`,
                                    backgroundColor: scorePct >= 70 ? "#22c55e" : scorePct >= 40 ? "#f59e0b" : "#ef4444"
                                  }}
                                />
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => router.push(`/tests/solutions/${att.id}`)}
                                className="border border-[#1a73e8] text-[#1a73e8] hover:bg-blue-50 font-bold text-xs h-8 px-4 rounded-lg transition-colors"
                              >
                                Solutions
                              </button>
                              <button
                                onClick={() => router.push(`/tests/results/${att.id}`)}
                                className="border border-[#1a73e8] text-[#1a73e8] hover:bg-blue-50 font-bold text-xs h-8 px-4 rounded-lg transition-colors"
                              >
                                Analysis
                              </button>
                              <button
                                onClick={() => router.push(`/tests/instructions/${att.testId}`)}
                                className="bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold text-xs h-8 w-8 rounded-lg transition-colors flex items-center justify-center"
                                title="Reattempt"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

            </div>
          )}
        </main>
      </div>
    </div>
  );
}