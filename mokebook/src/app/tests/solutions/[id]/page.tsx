"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { apiFetch, isAuthenticated } from "@/lib/api";
import {
  ChevronLeft, ChevronRight, Loader2, BookmarkPlus, BookmarkCheck,
  AlertTriangle, CheckCircle2, XCircle, MinusCircle,
  Flag, ThumbsUp, ThumbsDown, Clock, Zap, Filter, X
} from "lucide-react";
import { cn } from "@/lib/utils";

type FilterType = "all" | "correct" | "incorrect" | "skipped";

interface ReviewQuestion {
  id: string;
  number: number;
  section: string;
  textEn: string;
  textHi?: string;
  type: string;
  options: { id: string; textEn: string; textHi?: string; isCorrect: boolean }[];
  correctOptionIds: string[];
  explanation?: string;
  imageUrl?: string;
  topic?: string;
  chapter?: string;
  avgTimeSecs: number;
  correctPercentage: number;
  selectedOptionIds: string[];
  timeTakenSecs: number;
  marksAwarded: number;
  status: "CORRECT" | "INCORRECT" | "SKIPPED";
}

interface ReviewData {
  attemptId: string;
  testName: string;
  testId: string;
  score: number;
  totalMarks: number;
  submittedAt: string;
  summary: { correct: number; incorrect: number; skipped: number; total: number };
  questions: ReviewQuestion[];
}

function SpeedBadge({ timeSecs, avgSecs }: { timeSecs: number; avgSecs: number }) {
  if (timeSecs === 0) return null;
  const ratio = timeSecs / Math.max(avgSecs, 10);
  if (ratio <= 0.5) return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
      <Zap className="h-2.5 w-2.5" /> Superfast
    </span>
  );
  if (ratio <= 1.3) return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
      <Clock className="h-2.5 w-2.5" /> On Time
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
      <Clock className="h-2.5 w-2.5" /> Slow
    </span>
  );
}

export default function SolutionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const attemptId = String(params?.id || "");

  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState("wrong_answer");
  const [thumbVotes, setThumbVotes] = useState<Record<string, "up" | "down" | null>>({});

  // Read initial q from URL search params
  const qParam = searchParams?.get("q");
  const initializedRef = useRef(false);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/login?redirect=/tests/solutions/${attemptId}`);
    }
  }, [router, attemptId]);

  useEffect(() => {
    if (!attemptId || !isAuthenticated()) return;
    setLoading(true);
    apiFetch(`/mockbook/attempts/${attemptId}/review`)
      .then((res) => {
        setReviewData(res.data);
        setLoading(false);
        if (!initializedRef.current && qParam) {
          const idx = parseInt(qParam, 10);
          if (!isNaN(idx)) setCurrentIdx(idx);
          initializedRef.current = true;
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load solutions");
        setLoading(false);
      });
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-white items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1a73e8] mb-3" />
        <p className="text-sm text-gray-500 font-medium">Loading solutions...</p>
      </div>
    );
  }

  if (error || !reviewData) {
    return (
      <div className="flex flex-col h-screen bg-white items-center justify-center gap-4 p-8">
        <AlertTriangle className="h-10 w-10 text-amber-400" />
        <p className="text-sm font-bold text-gray-700 text-center">{error || "No data found"}</p>
        <button onClick={() => router.back()} className="px-5 py-2 bg-[#1a73e8] text-white text-sm font-bold rounded">
          Go Back
        </button>
      </div>
    );
  }

  const { questions, summary, testName, testId } = reviewData;

  // Apply filter
  const filteredQs = filter === "all"
    ? questions
    : questions.filter((q) => q.status.toLowerCase() === filter);

  // Clamp currentIdx to filtered list
  const safeIdx = Math.min(currentIdx, Math.max(0, filteredQs.length - 1));
  const q = filteredQs[safeIdx];
  const globalIdx = q ? questions.indexOf(q) : 0;

  const goTo = (i: number) => setCurrentIdx(Math.max(0, Math.min(i, filteredQs.length - 1)));

  const handleSave = async () => {
    if (!q) return;
    setSavingId(q.id);
    try {
      if (savedIds.has(q.id)) {
        await apiFetch(`/mockbook/questions/${q.id}/save`, { method: "DELETE" });
        setSavedIds((s) => { const n = new Set(s); n.delete(q.id); return n; });
      } else {
        await apiFetch(`/mockbook/questions/${q.id}/save`, {
          method: "POST",
          body: JSON.stringify({ attemptId }),
        });
        setSavedIds((s) => new Set(s).add(q.id));
      }
    } catch { } finally { setSavingId(null); }
  };

  const handleReport = async () => {
    if (!q) return;
    try {
      await apiFetch(`/mockbook/questions/${q.id}/report`, {
        method: "POST",
        body: JSON.stringify({ attemptId, reportType }),
      });
    } catch { } finally { setShowReportModal(false); }
  };

  const statusColor = (status: string) => {
    if (status === "CORRECT") return "text-emerald-600";
    if (status === "INCORRECT") return "text-red-500";
    return "text-gray-400";
  };
  const statusIcon = (status: string) => {
    if (status === "CORRECT") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
    if (status === "INCORRECT") return <XCircle className="h-3.5 w-3.5 text-red-400" />;
    return <MinusCircle className="h-3.5 w-3.5 text-gray-300" />;
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden font-sans text-[13px]">
      {/* ── HEADER ── */}
      <header className="h-12 bg-slate-900 text-white px-4 flex items-center justify-between shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => router.back()} className="p-1 hover:bg-white/10 rounded transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="font-bold text-xs truncate leading-tight">{testName}</p>
            <p className="text-[10px] text-slate-400 leading-tight">
              {summary.correct}✓ · {summary.incorrect}✗ · {summary.skipped}–
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* Language toggle */}
          <button
            onClick={() => setLang(l => l === "en" ? "hi" : "en")}
            className="text-[10px] font-bold border border-white/20 px-2 py-1 rounded hover:bg-white/10 transition-colors"
          >
            {lang === "en" ? "EN" : "HI"}
          </button>
          {/* Filter */}
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={cn(
              "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded transition-colors",
              showFilterPanel ? "bg-white text-slate-900" : "border border-white/20 hover:bg-white/10"
            )}
          >
            <Filter className="h-3 w-3" />
            {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
          <button
            onClick={() => router.push(`/tests/instructions/${testId}`)}
            className="hidden sm:flex text-[10px] font-black text-emerald-400 border border-emerald-400/30 px-3 py-1 rounded hover:bg-emerald-400/10 transition-colors"
          >
            Reattempt
          </button>
        </div>
      </header>

      {/* ── FILTER PANEL ── */}
      {showFilterPanel && (
        <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 shrink-0 border-b border-slate-700">
          {(["all", "correct", "incorrect", "skipped"] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setCurrentIdx(0); setShowFilterPanel(false); }}
              className={cn(
                "px-3 py-1 rounded text-[11px] font-bold transition-colors",
                filter === f ? "bg-white text-slate-900" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              )}
            >
              {f === "all" ? `All (${summary.total})` :
                f === "correct" ? `Correct (${summary.correct})` :
                f === "incorrect" ? `Incorrect (${summary.incorrect})` :
                `Skipped (${summary.skipped})`}
            </button>
          ))}
        </div>
      )}

      {/* ── Q-PALETTE BAR ── */}
      <div className="h-11 border-b flex items-center px-3 gap-1.5 overflow-x-auto no-scrollbar bg-slate-50 shrink-0">
        {filteredQs.map((qItem, idx) => (
          <button
            key={qItem.id}
            onClick={() => setCurrentIdx(idx)}
            className={cn(
              "w-7 h-7 rounded-full border flex-shrink-0 flex items-center justify-center text-[11px] font-bold transition-all",
              safeIdx === idx
                ? "ring-2 ring-offset-1 ring-[#1a73e8] bg-[#1a73e8] text-white border-transparent"
                : qItem.status === "CORRECT"
                  ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                  : qItem.status === "INCORRECT"
                    ? "bg-red-100 text-red-600 border-red-300"
                    : "bg-gray-100 text-gray-400 border-gray-300"
            )}
          >
            {qItem.number}
          </button>
        ))}
      </div>

      {filteredQs.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          No questions match this filter.
        </div>
      ) : (
        <>
          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 overflow-y-auto bg-white">
            {/* Question header meta */}
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3">
                {statusIcon(q.status)}
                <span className={cn("text-[11px] font-bold uppercase tracking-widest", statusColor(q.status))}>
                  {q.status === "CORRECT" ? `+${q.marksAwarded} Marks` :
                    q.status === "INCORRECT" ? `${q.marksAwarded.toFixed(2)} Marks` : "Not Answered"}
                </span>
                {q.timeTakenSecs > 0 && (
                  <span className="text-[10px] text-gray-400 font-medium">
                    {q.timeTakenSecs}s
                  </span>
                )}
                <SpeedBadge timeSecs={q.timeTakenSecs} avgSecs={q.avgTimeSecs} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={savingId === q.id}
                  className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                  title={savedIds.has(q.id) ? "Remove bookmark" : "Save question"}
                >
                  {savedIds.has(q.id)
                    ? <BookmarkCheck className="h-4 w-4 text-[#1a73e8]" />
                    : <BookmarkPlus className="h-4 w-4 text-gray-400" />}
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                  title="Report question"
                >
                  <Flag className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Topic/Chapter */}
            {(q.chapter || q.topic) && (
              <div className="px-4 py-2 bg-blue-50/60 border-b border-blue-100 flex items-center gap-2 text-[11px] font-medium text-blue-700">
                {q.chapter && <span className="bg-blue-100 px-2 py-0.5 rounded">{q.chapter}</span>}
                {q.topic && <span className="text-blue-500">{q.topic}</span>}
              </div>
            )}

            <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
              {/* Question text */}
              {q.imageUrl && (
                <img src={q.imageUrl} alt="question" className="max-h-48 object-contain rounded border mb-2" />
              )}
              <div
                className="text-[15px] md:text-base text-slate-800 leading-relaxed font-medium"
                dangerouslySetInnerHTML={{ __html: (lang === "hi" && q.textHi) ? q.textHi : (q.textEn || "") }}
              />

              {/* Options */}
              <div className="space-y-3">
                {q.options.map((opt, i) => {
                  const isCorrect = opt.isCorrect;
                  const isSelected = q.selectedOptionIds.includes(opt.id);
                  const isWrong = isSelected && !isCorrect && q.status !== "SKIPPED";

                  return (
                    <div
                      key={opt.id}
                      className={cn(
                        "flex items-center gap-4 p-3.5 rounded-xl border-2 transition-all relative",
                        isCorrect
                          ? "border-emerald-500 bg-emerald-50/40"
                          : isWrong
                            ? "border-red-400 bg-red-50/40"
                            : "border-slate-100 bg-white"
                      )}
                    >
                      <span className="text-xs font-bold text-slate-400">{i + 1}.</span>
                      <span
                        className="flex-1 text-[14px] font-medium text-slate-700"
                        dangerouslySetInnerHTML={{ __html: (lang === "hi" && opt.textHi) ? opt.textHi : (opt.textEn || "") }}
                      />
                      {isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                      {isWrong && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {/* Accuracy band */}
              {q.correctPercentage > 0 && (
                <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
                  <span className="font-bold text-gray-700">{q.correctPercentage}%</span>
                  students got this right
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${q.correctPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Solution / Explanation */}
              {q.explanation ? (
                <div className="space-y-3">
                  <div className="bg-slate-50 py-2.5 px-4 border-y border-slate-100">
                    <h3 className="text-xs font-bold text-slate-600 tracking-wider uppercase">Solution</h3>
                  </div>
                  <div
                    className="px-1 text-[14px] text-slate-700 leading-relaxed whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: q.explanation }}
                  />
                </div>
              ) : (
                <div className="bg-slate-50 px-4 py-3 rounded-lg border border-slate-100 text-[12px] text-slate-400 font-medium italic">
                  No detailed explanation available for this question.
                </div>
              )}

              {/* Helpful? */}
              {q.explanation && (
                <div className="flex items-center gap-4 pt-2 border-t border-slate-50">
                  <span className="text-[11px] font-bold text-slate-400">Was this solution helpful?</span>
                  <button
                    onClick={() => setThumbVotes(v => ({ ...v, [q.id]: v[q.id] === "up" ? null : "up" }))}
                    className={cn("p-1.5 rounded transition-colors", thumbVotes[q.id] === "up" ? "text-emerald-600" : "text-slate-300 hover:text-slate-500")}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setThumbVotes(v => ({ ...v, [q.id]: v[q.id] === "down" ? null : "down" }))}
                    className={cn("p-1.5 rounded transition-colors", thumbVotes[q.id] === "down" ? "text-red-500" : "text-slate-300 hover:text-slate-500")}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </main>

          {/* ── FOOTER NAVIGATION ── */}
          <footer className="h-14 border-t px-4 flex items-center justify-between bg-white shrink-0">
            <button
              onClick={() => goTo(safeIdx - 1)}
              disabled={safeIdx === 0}
              className="flex items-center gap-1 text-sm font-semibold text-gray-600 disabled:text-gray-300 hover:text-[#1a73e8] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>

            <span className="text-xs font-bold text-gray-500">
              {safeIdx + 1} / {filteredQs.length}
            </span>

            <button
              onClick={() => goTo(safeIdx + 1)}
              disabled={safeIdx >= filteredQs.length - 1}
              className="flex items-center gap-1 text-sm font-semibold text-[#1a73e8] disabled:text-gray-300 hover:text-[#1557b0] transition-colors"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </footer>
        </>
      )}

      {/* ── REPORT MODAL ── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Report Question</h3>
              <button onClick={() => setShowReportModal(false)}>
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-2">
              {[
                { value: "wrong_answer", label: "Wrong correct answer" },
                { value: "bad_question", label: "Poorly worded question" },
                { value: "wrong_explanation", label: "Wrong explanation" },
                { value: "other", label: "Other issue" },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer py-1">
                  <input
                    type="radio"
                    name="reportType"
                    value={opt.value}
                    checked={reportType === opt.value}
                    onChange={e => setReportType(e.target.value)}
                    className="accent-[#1a73e8]"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 px-4 py-2 text-sm font-semibold border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="flex-1 px-4 py-2 text-sm font-semibold bg-[#1a73e8] text-white rounded-lg hover:bg-[#1557b0]"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
