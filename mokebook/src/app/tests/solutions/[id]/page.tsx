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
    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--badge-success-bg)", color: "var(--badge-success-text)" }}>
      <Zap className="h-2.5 w-2.5" /> Superfast
    </span>
  );
  if (ratio <= 1.3) return (
    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--badge-info-bg)", color: "var(--badge-info-text)" }}>
      <Clock className="h-2.5 w-2.5" /> On Time
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--badge-error-bg)", color: "var(--badge-error-text)" }}>
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

  const qParam = searchParams?.get("q");
  const initializedRef = useRef(false);

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
      <div className="flex flex-col h-screen items-center justify-center" style={{ background: "var(--bg-body)", color: "var(--text-primary)" }}>
        <Loader2 className="h-8 w-8 animate-spin mb-3" style={{ color: "#FF6B2B" }} />
        <p className="text-[12px] font-medium" style={{ color: "var(--text-muted)" }}>Loading solutions...</p>
      </div>
    );
  }

  if (error || !reviewData) {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-4 p-8" style={{ background: "var(--bg-body)", color: "var(--text-primary)" }}>
        <AlertTriangle className="h-10 w-10" style={{ color: "var(--badge-error-text)" }} />
        <p className="text-[12px] font-bold text-center" style={{ color: "var(--text-primary)" }}>{error || "No data found"}</p>
        <button onClick={() => router.back()} className="px-5 py-2 text-[12px] font-bold rounded-lg text-white"
          style={{ background: "#FF6B2B" }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const { questions, summary, testName, testId } = reviewData;

  const filteredQs = filter === "all"
    ? questions
    : questions.filter((q) => q.status.toLowerCase() === filter);

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
    if (status === "CORRECT") return "var(--badge-success-text)";
    if (status === "INCORRECT") return "var(--badge-error-text)";
    return "var(--text-muted)";
  };
  const statusIcon = (status: string) => {
    if (status === "CORRECT") return <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "var(--badge-success-text)" }} />;
    if (status === "INCORRECT") return <XCircle className="h-3.5 w-3.5" style={{ color: "var(--badge-error-text)" }} />;
    return <MinusCircle className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />;
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans text-[13px]" style={{ background: "var(--bg-body)", color: "var(--text-primary)" }}>
      {/* ── HEADER ── */}
      <header className="h-12 px-4 flex items-center justify-between shrink-0 gap-3" style={{ background: "var(--bg-sidebar)", borderBottom: "var(--divider)" }}>
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => router.back()} className="p-1 rounded transition-colors hover:opacity-80">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="font-bold text-xs truncate leading-tight">{testName}</p>
            <p className="text-[10px] leading-tight" style={{ color: "var(--text-muted)" }}>
              {summary.correct}✓ · {summary.incorrect}✗ · {summary.skipped}–
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setLang(l => l === "en" ? "hi" : "en")}
            className="text-[10px] font-bold px-2 py-1 rounded transition-colors"
            style={{ border: "1px solid var(--border-input)", color: "var(--text-secondary)" }}
          >
            {lang === "en" ? "EN" : "HI"}
          </button>
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={cn(
              "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded transition-colors",
              showFilterPanel ? "" : ""
            )}
            style={showFilterPanel ? { background: "var(--bg-main)", color: "var(--text-primary)" } : { border: "1px solid var(--border-input)", color: "var(--text-secondary)" }}
          >
            <Filter className="h-3 w-3" />
            {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
          <button
            onClick={() => router.push(`/tests/instructions/${testId}`)}
            className="hidden sm:flex text-[10px] font-black px-3 py-1 rounded transition-colors"
            style={{ color: "var(--badge-success-text)", border: "1px solid rgba(46,125,50,0.3)" }}
          >
            Reattempt
          </button>
        </div>
      </header>

      {/* ── FILTER PANEL ── */}
      {showFilterPanel && (
        <div className="px-4 py-2 flex items-center gap-2 shrink-0" style={{ background: "var(--bg-main)", borderBottom: "var(--divider)" }}>
          {(["all", "correct", "incorrect", "skipped"] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setCurrentIdx(0); setShowFilterPanel(false); }}
              className={cn(
                "px-3 py-1 rounded text-[11px] font-bold transition-colors",
                filter === f ? "" : "hover:opacity-80"
              )}
              style={filter === f ? { background: "var(--text-primary)", color: "var(--bg-body)" } : { background: "var(--bg-card)", color: "var(--text-secondary)", border: "var(--border-card)" }}
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
      <div className="h-11 border-b flex items-center px-3 gap-1.5 overflow-x-auto no-scrollbar shrink-0" style={{ background: "var(--bg-main)", borderColor: "var(--divider)" }}>
        {filteredQs.map((qItem, idx) => (
          <button
            key={qItem.id}
            onClick={() => setCurrentIdx(idx)}
            className={cn(
              "w-7 h-7 rounded-full border flex-shrink-0 flex items-center justify-center text-[11px] font-bold transition-all",
              safeIdx === idx
                ? "ring-2 ring-offset-1 text-white border-transparent"
                : qItem.status === "CORRECT"
                  ? "border-[var(--badge-success-text)]"
                  : qItem.status === "INCORRECT"
                    ? "border-[var(--badge-error-text)]"
                    : ""
            )}
            style={safeIdx === idx ? { background: "#FF6B2B" } : qItem.status === "CORRECT" ? { background: "var(--badge-success-bg)", color: "var(--badge-success-text)" } : qItem.status === "INCORRECT" ? { background: "var(--badge-error-bg)", color: "var(--badge-error-text)" } : { background: "var(--bg-card)", color: "var(--text-muted)", borderColor: "var(--border-card)" }}
          >
            {qItem.number}
          </button>
        ))}
      </div>

      {filteredQs.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
          No questions match this filter.
        </div>
      ) : (
        <>
          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 overflow-y-auto" style={{ background: "var(--bg-body)" }}>
            {/* Question header meta */}
            <div className="px-4 py-2.5 flex items-center justify-between border-b" style={{ background: "var(--bg-card)", borderColor: "var(--divider)" }}>
              <div className="flex items-center gap-3">
                {statusIcon(q.status)}
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: statusColor(q.status) }}>
                  {q.status === "CORRECT" ? `+${q.marksAwarded} Marks` :
                    q.status === "INCORRECT" ? `${q.marksAwarded.toFixed(2)} Marks` : "Not Answered"}
                </span>
                {q.timeTakenSecs > 0 && (
                  <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
                    {q.timeTakenSecs}s
                  </span>
                )}
                <SpeedBadge timeSecs={q.timeTakenSecs} avgSecs={q.avgTimeSecs} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={savingId === q.id}
                  className="p-1.5 rounded transition-colors hover:opacity-80"
                  title={savedIds.has(q.id) ? "Remove bookmark" : "Save question"}
                >
                  {savedIds.has(q.id)
                    ? <BookmarkCheck className="h-4 w-4" style={{ color: "#FF6B2B" }} />
                    : <BookmarkPlus className="h-4 w-4" style={{ color: "var(--text-muted)" }} />}
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-1.5 rounded transition-colors hover:opacity-80"
                  title="Report question"
                >
                  <Flag className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
            </div>

            {/* Topic/Chapter */}
            {(q.chapter || q.topic) && (
              <div className="px-4 py-2 border-b flex items-center gap-2 text-[11px] font-medium" style={{ background: "var(--badge-info-bg)", borderColor: "var(--divider)", color: "var(--badge-info-text)" }}>
                {q.chapter && <span className="px-2 py-0.5 rounded" style={{ background: "rgba(33,150,243,0.1)" }}>{q.chapter}</span>}
                {q.topic && <span>{q.topic}</span>}
              </div>
            )}

            <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
              {/* Question text */}
              {q.imageUrl && (
                <img src={q.imageUrl} alt="question" className="max-h-48 object-contain rounded border mb-2" />
              )}
              <div
                className="text-[15px] md:text-base leading-relaxed font-medium"
                style={{ color: "var(--text-primary)" }}
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
                          ? ""
                          : isWrong
                            ? ""
                            : ""
                      )}
                      style={
                        isCorrect
                          ? { borderColor: "var(--badge-success-text)", background: "var(--badge-success-bg)" }
                          : isWrong
                            ? { borderColor: "var(--badge-error-text)", background: "var(--badge-error-bg)" }
                            : { borderColor: "var(--border-card)", background: "var(--bg-card)" }
                      }
                    >
                      <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>{i + 1}.</span>
                      <span
                        className="flex-1 text-[14px] font-medium"
                        style={{ color: "var(--text-secondary)" }}
                        dangerouslySetInnerHTML={{ __html: (lang === "hi" && opt.textHi) ? opt.textHi : (opt.textEn || "") }}
                      />
                      {isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "var(--badge-success-text)" }} />}
                      {isWrong && <XCircle className="h-4 w-4 shrink-0" style={{ color: "var(--badge-error-text)" }} />}
                    </div>
                  );
                })}
              </div>

              {/* Accuracy band */}
              {q.correctPercentage > 0 && (
                <div className="flex items-center gap-3 text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
                  <span className="font-bold" style={{ color: "var(--text-primary)" }}>{q.correctPercentage}%</span>
                  students got this right
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-main)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${q.correctPercentage}%`, background: "var(--badge-success-text)" }}
                    />
                  </div>
                </div>
              )}

              {/* Solution / Explanation */}
              {q.explanation ? (
                <div className="space-y-3">
                  <div className="py-2.5 px-4 border-y" style={{ background: "var(--bg-main)", borderColor: "var(--divider)" }}>
                    <h3 className="text-xs font-bold tracking-wider uppercase" style={{ color: "var(--text-secondary)" }}>Solution</h3>
                  </div>
                  <div
                    className="px-1 text-[14px] leading-relaxed whitespace-pre-line"
                    style={{ color: "var(--text-secondary)" }}
                    dangerouslySetInnerHTML={{ __html: q.explanation }}
                  />
                </div>
              ) : (
                <div className="px-4 py-3 rounded-lg border text-[12px] font-medium italic" style={{ background: "var(--bg-main)", borderColor: "var(--border-card)", color: "var(--text-muted)" }}>
                  No detailed explanation available for this question.
                </div>
              )}

              {/* Helpful? */}
              {q.explanation && (
                <div className="flex items-center gap-4 pt-2" style={{ borderTop: "var(--divider)" }}>
                  <span className="text-[11px] font-bold" style={{ color: "var(--text-muted)" }}>Was this solution helpful?</span>
                  <button
                    onClick={() => setThumbVotes(v => ({ ...v, [q.id]: v[q.id] === "up" ? null : "up" }))}
                    className={cn("p-1.5 rounded transition-colors", thumbVotes[q.id] === "up" ? "" : "")}
                    style={{ color: thumbVotes[q.id] === "up" ? "var(--badge-success-text)" : "var(--text-muted)" }}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setThumbVotes(v => ({ ...v, [q.id]: v[q.id] === "down" ? null : "down" }))}
                    className={cn("p-1.5 rounded transition-colors", thumbVotes[q.id] === "down" ? "" : "")}
                    style={{ color: thumbVotes[q.id] === "down" ? "var(--badge-error-text)" : "var(--text-muted)" }}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </main>

          {/* ── FOOTER NAVIGATION ── */}
          <footer className="h-14 border-t px-4 flex items-center justify-between shrink-0" style={{ background: "var(--bg-card)", borderColor: "var(--divider)" }}>
            <button
              onClick={() => goTo(safeIdx - 1)}
              disabled={safeIdx === 0}
              className="flex items-center gap-1 text-sm font-semibold transition-colors disabled:opacity-30"
              style={{ color: safeIdx === 0 ? "var(--text-muted)" : "var(--text-secondary)" }}
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>

            <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
              {safeIdx + 1} / {filteredQs.length}
            </span>

            <button
              onClick={() => goTo(safeIdx + 1)}
              disabled={safeIdx >= filteredQs.length - 1}
              className="flex items-center gap-1 text-sm font-semibold transition-colors disabled:opacity-30"
              style={{ color: safeIdx >= filteredQs.length - 1 ? "var(--text-muted)" : "#FF6B2B" }}
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </footer>
        </>
      )}

      {/* ── REPORT MODAL ── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Report Question</h3>
              <button onClick={() => setShowReportModal(false)}>
                <X className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
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
                    className="accent-[#FF6B2B]"
                  />
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
                style={{ border: "1px solid var(--btn-secondary-border)", color: "var(--btn-secondary-text)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors"
                style={{ background: "#FF6B2B" }}
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
