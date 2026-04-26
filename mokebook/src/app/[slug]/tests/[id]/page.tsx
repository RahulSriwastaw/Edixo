"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft, AlertTriangle, User as UserIcon,
  ChevronLeft, ChevronRight, Menu, Maximize, Loader2,
  PauseCircle, FileText, X, Flag, Clock, BarChart3, BookOpen, HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch, isAuthenticated } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ExamThemeProvider } from "@/contexts/ExamThemeContext";
import { useExamThemeByExamId } from "@/hooks/useExamTheme";
import { TestInterface } from "@/components/TestInterface/TestInterface";

const PaletteShapes = {
  NotVisited: ({ num, active }: { num: number; active?: boolean }) => (
    <div className={cn(
      "w-8 h-7 md:w-[34px] md:h-[30px] text-[10px] font-bold flex items-center justify-center border rounded shadow-sm transition-all",
      active && "ring-2 ring-offset-1 font-extrabold"
    )}
      style={active ? { background: "var(--bg-card)", borderColor: "#FF6B2B", color: "#FF6B2B" } : { background: "var(--bg-main)", borderColor: "var(--border-card)", color: "var(--text-muted)" }}
    >
      {num}
    </div>
  ),
  NotAnswered: ({ num, active }: { num: number; active?: boolean }) => (
    <div className={cn(
      "relative w-8 h-7 md:w-[34px] md:h-[30px] flex items-center justify-center transition-opacity",
      active && "ring-2 ring-offset-1"
    )}
    >
      <svg viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
        <path d="M0 0H38V22C38 22 25 34 19 34C13 34 0 22 0 22V0Z" fill="var(--badge-error-text)" />
      </svg>
      <span className="relative text-white text-[10px] font-bold -mt-0.5">{num}</span>
    </div>
  ),
  Answered: ({ num, active }: { num: number; active?: boolean }) => (
    <div className={cn(
      "relative w-8 h-7 md:w-[34px] md:h-[30px] flex items-center justify-center transition-opacity",
      active && "ring-2 ring-offset-1"
    )}
    >
      <svg viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
        <path d="M0 12C0 12 13 0 19 0C25 0 38 12 38 12V34H0V12Z" fill="var(--badge-success-text)" />
      </svg>
      <span className="relative text-white text-[10px] font-bold mt-0.5">{num}</span>
    </div>
  ),
  Marked: ({ num, active }: { num: number; active?: boolean }) => (
    <div className={cn(
      "w-7 h-7 md:w-[32px] md:h-[32px] text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm transition-opacity mx-auto",
      active && "ring-2 ring-offset-1"
    )}
      style={{ background: "#8b5cf6" }}
    >
      {num}
    </div>
  ),
  MarkedAndAnswered: ({ num, active }: { num: number; active?: boolean }) => (
    <div className={cn(
      "relative w-7 h-7 md:w-[32px] md:h-[32px] text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm transition-opacity mx-auto",
      active && "ring-2 ring-offset-1"
    )}
      style={{ background: "#7c3aed" }}
    >
      {num}
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 shadow-sm" style={{ background: "var(--badge-success-text)", borderColor: "var(--bg-card)" }} />
    </div>
  ),
};

const PaletteKey = [
  { color: "var(--bg-main)", border: "var(--border-card)", textColor: "var(--text-primary)", label: "You have not visited the question yet" },
  { color: "var(--badge-error-text)", border: "transparent", textColor: "#fff", label: "You have not answered the question." },
  { color: "var(--badge-success-text)", border: "transparent", textColor: "#fff", label: "You have answered the question." },
  { color: "#8b5cf6", border: "transparent", textColor: "#fff", label: "You have NOT answered the question, but have marked the question for review." },
  { color: "#7c3aed", border: "transparent", textColor: "#fff", label: "You have answered the question, marked it for review." },
];

interface Question {
  id: string;
  questionId: string;
  number: number;
  section: string;
  text: string;
  type: string;
  options: { id: string; text: string }[];
  marks: number;
  negative: number;
  imageUrl?: string;
}

export default function IntegratedTestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const searchParams = useSearchParams();

  const testId = params?.id ? String(params.id) : "";
  const seriesSlug = params?.slug ? String(params.slug) : "";

  const [view, setView] = useState<'instructions' | 'exam'>('instructions');
  const [instrStep, setInstrStep] = useState(1);
  const [declared, setDeclared] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [testName, setTestName] = useState("Loading...");
  const [durationMins, setDurationMins] = useState(60);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [examError, setExamError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Student");
  const [lang, setLang] = useState<"english" | "hindi">("english");
  const [initialSyncDone, setInitialSyncDone] = useState(false);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Theme hook MUST be called before any early returns
  const { theme, loading: themeLoading } = useExamThemeByExamId(testId);
  const [qState, setQState] = useState<Record<number, { status: string; answer: number | null; optionId: string | null }>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showQPaperModal, setShowQPaperModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState("wrong_answer");

  const qStartTimeRef = useRef<number>(Date.now());
  const qTimeSpent = useRef<Record<number, number>>({});

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/login?redirect=/${seriesSlug}/tests/${testId}`);
      return;
    }
    apiFetch("/students/me").then(res => {
      if (res.data?.name) setDisplayName(res.data.name);
    }).catch(() => { });

    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#/lt-test') setView('exam');
      else if (hash === '#/lt-instructions') setView('instructions');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [router, seriesSlug, testId]);

  useEffect(() => {
    if (!testId || !isAuthenticated()) return;

    const init = async () => {
      try {
        setLoading(true);
        const qRes = await apiFetch(`/mockbook/tests/${testId}/questions`);
        const data = qRes.data;
        if (!data || !data.questions) throw new Error("Test not found");

        setTestName(data.name || "Test");
        setDurationMins(data.durationMins || 60);
        setQuestions(data.questions);

        const initial: Record<number, { status: string; answer: number | null; optionId: string | null }> = {};
        data.questions.forEach((_: any, i: number) => {
          initial[i] = { status: i === 0 ? "not_answered" : "not_visited", answer: null, optionId: null };
        });
        setQState(initial);

        const attRes = await apiFetch(`/mockbook/tests/${testId}/attempts`, {
          method: "POST",
          body: JSON.stringify({ action: "start" }),
        });

        if (attRes.data?.id) {
          setAttemptId(attRes.data.id);
          if (attRes.data.status === 'IN_PROGRESS' && attRes.status !== 201) {
            setSecondsLeft(attRes.data.timeRemainingSeconds || data.durationMins * 60);
            setView('exam');
            window.location.hash = '#/lt-test';
          } else {
            setSecondsLeft(data.durationMins * 60);
            if (!window.location.hash) window.location.hash = '#/lt-instructions';
          }
        }
        setInitialSyncDone(true);
      } catch (err: any) {
        setExamError(err.message || "Failed to load test");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [testId]);

  useEffect(() => {
    if (view !== 'exam') return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [view]);

  const recordQuestionTime = useCallback(() => {
    const elapsed = Math.round((Date.now() - qStartTimeRef.current) / 1000);
    qTimeSpent.current[currentIdx] = (qTimeSpent.current[currentIdx] || 0) + elapsed;
    qStartTimeRef.current = Date.now();
  }, [currentIdx]);

  const navigateTo = (idx: number) => {
    recordQuestionTime();
    setQState(prev => {
      const copy = { ...prev };
      if (copy[idx]?.status === "not_visited") copy[idx].status = "not_answered";
      return copy;
    });
    setCurrentIdx(idx);
    qStartTimeRef.current = Date.now();
  };

  const handleSelectOption = (optIdx: number, optId: string) => {
    setQState(prev => ({
      ...prev,
      [currentIdx]: { ...prev[currentIdx], answer: optIdx, optionId: optId }
    }));
  };

  const clearResponse = () => {
    setQState(prev => ({
      ...prev,
      [currentIdx]: { status: "not_answered", answer: null, optionId: null }
    }));
  };

  const markForReviewAndNext = () => {
    setQState(prev => {
      const current = prev[currentIdx] ?? { status: "not_answered", answer: null, optionId: null };
      return {
        ...prev,
        [currentIdx]: {
          ...current,
          status: current.answer !== null ? "marked_answered" : "marked"
        }
      };
    });
    if (currentIdx < questions.length - 1) navigateTo(currentIdx + 1);
  };

  const saveAndNext = () => {
    const current = qState[currentIdx] ?? { status: "not_answered", answer: null, optionId: null };
    recordQuestionTime();

    setQState(prev => {
      const cur = prev[currentIdx] ?? { status: "not_answered", answer: null, optionId: null };
      return {
        ...prev,
        [currentIdx]: {
          ...cur,
          status: cur.answer !== null ? "answered" : "not_answered"
        }
      };
    });
    if (currentIdx < questions.length - 1) navigateTo(currentIdx + 1);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const answers = questions.map((q, i) => ({
        questionId: q.id,
        selectedOptions: qState[i]?.optionId ? [qState[i].optionId!] : [],
      }));
      const totalTimeTaken = Math.max(0, (durationMins * 60) - secondsLeft);
      const res = await apiFetch(`/mockbook/tests/${testId}/attempts`, {
        method: "POST",
        body: JSON.stringify({ action: "submit", answers, timeTakenSecs: totalTimeTaken }),
      });
      if (res.success) {
        router.push(`/${seriesSlug}/tests/${testId}/analysis`);
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Submission Failed" });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePause = async () => {
    router.push(`/${seriesSlug}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen" style={{ background: "var(--bg-body)", color: "var(--text-primary)" }}>
        <Loader2 className="h-10 w-10 animate-spin mb-4" style={{ color: "#FF6B2B" }} />
        <p className="font-bold text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Loading Test...</p>
      </div>
    );
  }

  if (examError || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center" style={{ background: "var(--bg-body)", color: "var(--text-primary)" }}>
        <AlertTriangle className="h-12 w-12 mb-4" style={{ color: "var(--badge-error-text)" }} />
        <h2 className="text-xl font-bold mb-2">Test Unavailable</h2>
        <p className="mb-6" style={{ color: "var(--text-muted)" }}>{examError || "Could not load test questions."}</p>
        <button onClick={() => router.push(`/${seriesSlug}`)} className="px-6 py-2 rounded-lg font-bold text-white" style={{ background: "#FF6B2B" }}>Go Back</button>
      </div>
    );
  }

  // ─── INSTRUCTIONS VIEW ───────────────────────────────────────
  if (view === 'instructions') {
    return (
      <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--bg-body)", color: "var(--text-primary)" }}>
        <header className="flex items-center justify-between px-4 h-11 shrink-0" style={{ background: "var(--bg-sidebar)", borderBottom: "var(--divider)" }}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded flex items-center justify-center text-white font-black text-xs" style={{ background: "#FF6B2B" }}>M</div>
            <span className="font-bold text-sm">{testName}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ background: "#FF6B2B" }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold">{displayName}</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {instrStep === 1 ? (
            <div className="p-6 max-w-4xl mx-auto" style={{ fontSize: 13, lineHeight: 1.6 }}>
              <h2 className="font-bold text-lg mb-4 pb-2" style={{ borderBottom: "var(--divider)" }}>General Instructions</h2>
              <ol className="list-decimal pl-5 space-y-3" style={{ color: "var(--text-secondary)" }}>
                <li>The clock will be set at the server. The countdown timer at the top right corner will show the remaining time.</li>
                <li>Question Palette status symbols:
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PaletteKey.map((p, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded border flex items-center justify-center text-white font-bold" style={{ backgroundColor: p.color, borderColor: p.border }}>{i + 1}</div>
                        <span className="text-[11px] leading-tight">{p.label}</span>
                      </div>
                    ))}
                  </div>
                </li>
                <li>Navigating: Use <strong>Save & Next</strong> to save answers. Navigation via palette does NOT save answers.</li>
              </ol>
            </div>
          ) : (
            <div className="p-6 max-w-4xl mx-auto" style={{ fontSize: 13, lineHeight: 1.6 }}>
              <h2 className="font-bold text-lg mb-4 pb-2" style={{ borderBottom: "var(--divider)" }}>Test Specific Instructions</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl flex flex-col items-center" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                  <Clock className="h-5 w-5 mb-1" style={{ color: "#FF6B2B" }} />
                  <span className="font-bold">{durationMins} Mins</span>
                </div>
                <div className="p-4 rounded-xl flex flex-col items-center" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                  <FileText className="h-5 w-5 mb-1" style={{ color: "#FF6B2B" }} />
                  <span className="font-bold">{questions.length} Qs</span>
                </div>
                <div className="p-4 rounded-xl flex flex-col items-center" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                  <BarChart3 className="h-5 w-5 mb-1" style={{ color: "#FF6B2B" }} />
                  <span className="font-bold">{questions.reduce((acc, q) => acc + q.marks, 0)} Marks</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-bold mb-2">Default Language:</label>
                  <select className="border p-2 rounded w-48 text-sm" style={{ background: "var(--bg-input)", borderColor: "var(--border-input)", color: "var(--text-primary)" }} value={lang} onChange={(e: any) => setLang(e.target.value)}>
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                  </select>
                </div>

                <label className="flex items-start gap-3 p-4 rounded-xl cursor-pointer" style={{ background: "var(--bg-main)" }}>
                  <input type="checkbox" checked={declared} onChange={e => setDeclared(e.target.checked)} className="mt-1 w-4 h-4" style={{ accentColor: "#FF6B2B" }} />
                  <span style={{ color: "var(--text-secondary)" }}>I have read and understood all instructions. I agree to abide by the rules.</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <footer className="p-4 flex justify-between shrink-0" style={{ borderTop: "var(--divider)", background: "var(--bg-sidebar)" }}>
          <button onClick={() => instrStep === 2 ? setInstrStep(1) : router.back()} className="px-6 py-2 font-bold uppercase text-xs" style={{ color: "var(--text-muted)" }}>
            {instrStep === 1 ? "Cancel" : "Back"}
          </button>
          <button
            disabled={instrStep === 2 && !declared}
            onClick={() => {
              if (instrStep === 1) setInstrStep(2);
              else {
                setView('exam');
                window.location.hash = '#/lt-test';
              }
            }}
            className={cn("px-8 py-2 rounded-lg font-bold uppercase text-xs text-white transition-all", (instrStep === 2 && !declared) ? "opacity-50" : "")}
            style={{ background: (instrStep === 2 && !declared) ? "var(--text-muted)" : "#FF6B2B" }}
          >
            {instrStep === 1 ? "Next" : "I am ready to begin"}
          </button>
        </footer>
      </div>
    );
  }

  // ─── EXAM VIEW with Theme ───────────────────────────────────
  // theme and themeLoading are already declared above (before early returns)

  const handleTestSubmit = async (answers: Record<string, string[]>, integerAnswers: Record<string, string>) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const answerPayload = questions.map((q) => ({
        questionId: q.id,
        selectedOptions: answers[q.id] || [],
        integerValue: integerAnswers[q.id] || null,
      }));
      const totalTimeTaken = Math.max(0, (durationMins * 60) - secondsLeft);
      const res = await apiFetch(`/mockbook/tests/${testId}/attempts`, {
        method: "POST",
        body: JSON.stringify({ action: "submit", answers: answerPayload, timeTakenSecs: totalTimeTaken }),
      });
      if (res.success) {
        router.push(`/${seriesSlug}/tests/${testId}/analysis`);
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Submission Failed" });
    } finally {
      setSubmitting(false);
    }
  };

  if (themeLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen" style={{ background: "var(--bg-body)", color: "var(--text-primary)" }}>
        <Loader2 className="h-10 w-10 animate-spin mb-4" style={{ color: "#FF6B2B" }} />
        <p className="font-bold text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Loading Theme...</p>
      </div>
    );
  }

  return (
    <ExamThemeProvider theme={theme}>
      <TestInterface
        test={{ id: testId, name: testName, durationMins, questions }}
        onSubmit={handleTestSubmit}
      />
    </ExamThemeProvider>
  );
}
