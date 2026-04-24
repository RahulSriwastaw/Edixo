"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, AlertTriangle, User as UserIcon,
  ChevronLeft, ChevronRight, Menu, Maximize, Loader2,
  PauseCircle, FileText, X, Flag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch, isAuthenticated } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// TCS iON standard palette shapes
// Professional Palette Shapes (inspired by standard modern testing platforms)
const PaletteShapes = {
  NotVisited: ({ num, active }: { num: number; active?: boolean }) => (
    <div className={cn(
      "w-8 h-7 md:w-[34px] md:h-[30px] bg-slate-50 text-slate-500 text-[10px] font-bold flex items-center justify-center border border-slate-200 rounded shadow-sm hover:border-slate-400 transition-all",
      active && "ring-2 ring-blue-500 ring-offset-1 border-blue-500 text-blue-600 font-extrabold"
    )}>
      {num}
    </div>
  ),
  NotAnswered: ({ num, active }: { num: number; active?: boolean }) => (
    <div className={cn(
      "relative w-8 h-7 md:w-[34px] md:h-[30px] flex items-center justify-center hover:opacity-90 transition-opacity",
      active && "ring-2 ring-blue-500 ring-offset-1"
    )}>
      <svg viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
        <path d="M0 0H38V22C38 22 25 34 19 34C13 34 0 22 0 22V0Z" fill="#f43f5e" />
      </svg>
      <span className="relative text-white text-[10px] font-bold -mt-0.5">{num}</span>
    </div>
  ),
  Answered: ({ num, active }: { num: number; active?: boolean }) => (
    <div className={cn(
      "relative w-8 h-7 md:w-[34px] md:h-[30px] flex items-center justify-center hover:opacity-90 transition-opacity",
      active && "ring-2 ring-blue-600 ring-offset-1"
    )}>
      <svg viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
        <path d="M0 12C0 12 13 0 19 0C25 0 38 12 38 12V34H0V12Z" fill="#10b981" />
      </svg>
      <span className="relative text-white text-[10px] font-bold mt-0.5">{num}</span>
    </div>
  ),
  Marked: ({ num, active }: { num: number; active?: boolean }) => (
    <div className={cn(
      "w-7 h-7 md:w-[32px] md:h-[32px] bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm hover:opacity-90 transition-opacity mx-auto",
      active && "ring-2 ring-blue-500 ring-offset-1"
    )}>
      {num}
    </div>
  ),
  MarkedAndAnswered: ({ num, active }: { num: number; active?: boolean }) => (
    <div className={cn(
      "relative w-7 h-7 md:w-[32px] md:h-[32px] bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm hover:opacity-90 transition-opacity mx-auto",
      active && "ring-2 ring-blue-500 ring-offset-1"
    )}>
      {num}
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
    </div>
  ),
};

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

export default function ExamPage() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const testId = params?.id ? String(params.id) : "";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [testName, setTestName] = useState("Loading...");
  const [durationMins, setDurationMins] = useState(60);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [examError, setExamError] = useState<string | null>(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [qState, setQState] = useState<Record<number, { status: string; answer: number | null; optionId: string | null }>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [displayName, setDisplayName] = useState("Student");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showQPaperModal, setShowQPaperModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState("wrong_answer");
  const [lang, setLang] = useState<"en" | "hi">("en");

  // Per-question timer
  const qStartTimeRef = useRef<number>(Date.now());
  const qTimeSpent = useRef<Record<number, number>>({}); // idx -> seconds spent

  // Read language set on instructions page
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("testLanguage");
      if (saved === "hindi") setLang("hi");
    }
  }, []);

  // Auth guard — redirect to login if no token
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/login?redirect=/tests/exam/${testId}`);
    }
  }, [router, testId]);

  // Fetch questions and start attempt
  useEffect(() => {
    const init = async () => {
      // Guard: don't run if not authenticated (redirect is in flight)
      if (!isAuthenticated()) return;

      try {
        setLoading(true);
        setExamError(null);

        // 1. Fetch student profile for display name
        try {
          const meRes = await apiFetch("/students/me");
          if (meRes.data?.name) setDisplayName(meRes.data.name);
        } catch { /* silent */ }

        // 2. Start attempt FIRST (need attemptId for autosave)
        let attemptIdLocal: string | null = null;
        try {
          const attRes = await apiFetch(`/mockbook/tests/${testId}/attempts`, {
            method: "POST",
            body: JSON.stringify({ action: "start" }),
          });
          if (attRes.data?.id) {
            attemptIdLocal = attRes.data.id;
            setAttemptId(attRes.data.id);
          }
        } catch (attErr: any) {
          console.error("Failed to start attempt:", attErr);
          // If attempt start fails, show error but still try to load questions for preview
          setExamError(`Failed to start exam: ${attErr.message || "Please try again."}`);
        }

        // 3. Fetch questions
        const qRes = await apiFetch(`/mockbook/tests/${testId}/questions`);
        const data = qRes.data;
        if (!data || !data.questions || data.questions.length === 0) {
          throw new Error("No questions found for this test. Please contact support.");
        }

        setTestName(data.name || "Test");
        setDurationMins(data.durationMins || 60);
        setSecondsLeft((data.durationMins || 60) * 60);
        setQuestions(data.questions);

        // 4. Initialize question state
        const initial: Record<number, { status: string; answer: number | null; optionId: string | null }> = {};
        data.questions.forEach((_: any, i: number) => {
          initial[i] = { status: i === 0 ? "not_answered" : "not_visited", answer: null, optionId: null };
        });
        setQState(initial);

        // If attempt failed to start, don't allow taking the test
        if (!attemptIdLocal) {
          setIsReady(false);
        } else {
          setIsReady(true);
        }
      } catch (err: any) {
        console.error("Failed to load exam:", err);
        setTestName("Error — Could not load test");
        setExamError(err.message || "Could not load test. Unknown error.");
        setIsReady(true);
      } finally {
        setLoading(false);
      }
    };
    if (testId) init();
  }, [testId]);

  // Countdown timer
  useEffect(() => {
    if (!isReady) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto-submit on time up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isReady]);

  // Fullscreen listener
  useEffect(() => {
    const onFS = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFS);
    return () => document.removeEventListener("fullscreenchange", onFS);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')} : ${m.toString().padStart(2, '0')} : ${s.toString().padStart(2, '0')}`;
  };

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

  // Autosave response when saving
  const autosaveResponse = useCallback(async (idx: number, optionId: string | null, questionId: string, timeSecs: number) => {
    if (!attemptId) return;
    try {
      await apiFetch(`/mockbook/attempts/${attemptId}/response`, {
        method: "POST",
        body: JSON.stringify({
          questionId,
          selectedOptions: optionId ? [optionId] : [],
          timeTakenSecs: timeSecs,
        }),
      });
    } catch { /* Silently fail */ }
  }, [attemptId]);

  const saveAndNext = () => {
    const current = qState[currentIdx] ?? { status: "not_answered", answer: null, optionId: null };
    recordQuestionTime();
    const timeSecs = qTimeSpent.current[currentIdx] || 0;
    const q = questions[currentIdx];
    if (q) autosaveResponse(currentIdx, current.optionId, q.id, timeSecs);

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

  const handlePause = useCallback(async () => {
    if (!attemptId) { router.push("/tests"); return; }
    try {
      recordQuestionTime();
      await apiFetch(`/mockbook/attempts/${attemptId}/pause`, {
        method: "POST",
        body: JSON.stringify({ timeRemainingSeconds: secondsLeft, durationMins }),
      });
    } catch { } finally {
      router.push("/tests");
    }
  }, [attemptId, secondsLeft, durationMins, recordQuestionTime, router]);

  const handleReport = async () => {
    const q = questions[currentIdx];
    if (!q) return;
    try {
      await apiFetch(`/mockbook/questions/${q.id}/report`, {
        method: "POST",
        body: JSON.stringify({ attemptId, reportType }),
      });
      toast({ title: "Report submitted", description: "Thank you for your feedback!" });
    } catch { } finally { setShowReportModal(false); }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!isReady) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key;
      const currentQ = questions[currentIdx];
      if (!currentQ) return;
      if (["1", "2", "3", "4"].includes(key)) {
        const optIdx = parseInt(key) - 1;
        if (currentQ.options[optIdx]) handleSelectOption(optIdx, currentQ.options[optIdx].id);
      }
      if (key.toLowerCase() === "n") saveAndNext();
      if (key.toLowerCase() === "m") markForReviewAndNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isReady, currentIdx, questions, qState]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    if (!isAuthenticated()) {
      toast({ variant: "destructive", title: "Session Expired", description: "Please log in again." });
      router.push("/login");
      return;
    }

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

      if (res.success && res.data) {
        toast({ title: "✅ Test Submitted" });
        const targetId = res.data.attemptId || res.data.id;
        if (targetId) router.push(`/tests/results/${targetId}`);
        else router.push("/tests");
      } else {
        throw new Error(res.message || "Failed to submit test.");
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Submission Failed", description: err.message });
    } finally {
      setSubmitting(false);
    }
  }, [questions, qState, testId, submitting, router, toast]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => { });
    else document.exitFullscreen?.();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Initialising Exam...</p>
      </div>
    );
  }

  if (examError || questions.length === 0 || !isReady) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f0f4f7] space-y-4 p-4 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="font-bold text-slate-700 text-lg">Test Unavailable</p>
        <p className="text-slate-500 text-sm max-w-md">{examError || "This test may not be configured correctly."}</p>
        <button onClick={() => router.push('/tests')} className="mt-4 px-6 py-2 bg-gray-800 text-white rounded text-sm font-semibold">Go Back</button>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const currentQState = qState[currentIdx] || { status: "not_visited", answer: null, optionId: null };

  const stats = {
    answered: Object.values(qState).filter(s => s.status === "answered").length,
    not_answered: Object.values(qState).filter(s => s.status === "not_answered").length,
    not_visited: Object.values(qState).filter(s => s.status === "not_visited").length,
    marked: Object.values(qState).filter(s => s.status === "marked").length,
    marked_answered: Object.values(qState).filter(s => s.status === "marked_answered").length,
  };

  const brandColor = "#1a73e8"; // Professional Indigo-Blue
  const currentTime = qTimeSpent.current[currentIdx] || 0;
  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden text-slate-900 select-none">
      {/* MOBILE HEADER */}
      <header className="md:hidden bg-[#1e293b] text-white flex items-center justify-between px-3 py-2.5 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded hover:bg-slate-700">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Exam Mode</span>
            <span className="text-[13px] font-bold truncate max-w-[120px]">{testName}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1.5 rounded border border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold">TIMER</span>
            <span className="text-[12px] font-mono font-bold text-brand-primary tracking-tighter">
              {formatTime(secondsLeft)}
            </span>
          </div>
          <button onClick={() => setShowQPaperModal(true)} className="p-1.5 bg-slate-800 rounded border border-slate-700">
            <FileText className="h-4 w-4 text-slate-300" />
          </button>
        </div>
      </header>

      {/* DESKTOP HEADER - Compact */}
      <header className="hidden md:flex bg-white border-b border-slate-200 items-center justify-between px-6 shrink-0 h-14 shadow-sm z-30">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black italic shadow-inner">M</div>
          <div className="h-5 w-px bg-slate-200" />
          <h1 className="text-[14px] font-extrabold text-slate-800 truncate max-w-sm tracking-tight">{testName}</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Time Left</span>
            <div className="flex items-center gap-1 font-mono text-base font-black text-slate-800">
              {formatTime(secondsLeft).split(':').map((chunk, i) => (
                <div key={i} className="flex items-center">
                  <span className="bg-slate-50 rounded border border-slate-200 px-1.5 py-0.5 min-w-[28px] text-center shadow-sm">{chunk.trim()}</span>
                  {i < 2 && <span className="mx-0.5 text-slate-300">:</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="h-8 px-3 text-[10px] font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2"
              onClick={toggleFullscreen}
            >
              <Maximize className="h-3.5 w-3.5" />
              {isFullscreen ? "NORMAL" : "FULL"}
            </button>
            <button
              className="h-8 px-3 text-[10px] font-bold text-blue-600 border border-blue-200 bg-blue-50/50 rounded-lg hover:bg-blue-50 transition-all flex items-center gap-2"
              onClick={handlePause}
            >
              <PauseCircle className="h-3.5 w-3.5" />
              PAUSE
            </button>
          </div>
        </div>
      </header>

      {/* SUB-HEADER: Sections */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white shrink-0 z-20">
        <div className="flex items-center min-w-0">
          <div className="px-5 py-2.5 text-[9px] font-bold text-slate-400 tracking-wider border-r border-slate-100 whitespace-nowrap">SECTIONS</div>
          <div className="flex items-center overflow-x-auto no-scrollbar">
            <div className="text-white px-5 py-2.5 text-[11px] font-bold flex items-center whitespace-nowrap" style={{ backgroundColor: brandColor }}>
              {currentQ.section}
            </div>
          </div>
        </div>
        <div className="px-4 py-2 flex items-center gap-4 shrink-0 bg-white ml-auto border-l border-slate-100">
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold">
            <span className="text-slate-400">VIEW IN:</span>
            <select className="border border-slate-200 rounded px-2 py-1 outline-none text-slate-700 bg-slate-50">
              <option>English</option>
              <option>Hindi</option>
            </select>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT: QUESTION PANEL */}
        <div className="flex-1 flex flex-col min-w-0 bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between px-5 md:px-8 py-2.5 border-b border-slate-100 shrink-0 bg-slate-50/50">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Question</span>
              <span className="text-lg font-black text-slate-800">{currentQ.number}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white border border-slate-200 rounded-full px-3 py-1 gap-4 shadow-sm">
                <div className="flex items-center gap-1.5 border-r border-slate-100 pr-3">
                  <div className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-emerald-700">+{currentQ.marks}</span>
                  </div>
                  <div className="w-4 h-4 rounded bg-rose-100 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-rose-700">{currentQ.negative}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Time</span>
                  <span className="text-[11px] font-mono font-bold text-slate-800">{formatSecs(currentTime)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 md:p-10">
            <div className="max-w-4xl mx-auto">
              {currentQ.imageUrl && (
                <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                  <img src={currentQ.imageUrl} alt="question" className="max-h-72 w-auto mx-auto object-contain rounded-lg" />
                </div>
              )}

              <div
                className="text-[17px] font-bold text-slate-800 mb-10 leading-[1.6] tracking-tight"
                dangerouslySetInnerHTML={{ __html: currentQ.text || "" }}
              />

              <div className="grid gap-3">
                {currentQ.options.map((opt, i) => {
                  const isSelected = currentQState.answer === i;
                  return (
                    <label key={opt.id} className={cn(
                      "flex items-center gap-3.5 cursor-pointer group p-3.5 rounded-xl border-2 transition-all duration-200",
                      isSelected ? "border-blue-600 bg-blue-50/30 shadow-sm" : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                    )}
                      onClick={() => handleSelectOption(i, opt.id)}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                        isSelected ? "border-blue-600 bg-blue-600" : "border-slate-300 group-hover:border-slate-500"
                      )}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div className={cn("text-[14px] font-bold", isSelected ? "text-blue-700 font-extrabold" : "text-slate-700")} dangerouslySetInnerHTML={{ __html: opt.text || "" }} />
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ACTION BAR */}
          <div className="border-t border-slate-200 bg-white flex items-center justify-between px-4 md:px-8 py-4 shrink-0 gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-30">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-5 py-2.5 text-[13px] font-black rounded-lg border-2 border-slate-100 text-slate-500 hover:bg-slate-50 transition-all font-mono" onClick={markForReviewAndNext}>
                MARK FOR REVIEW
              </button>
              <button className="flex-1 md:flex-none px-5 py-2.5 text-[13px] font-black rounded-lg border-2 border-slate-100 text-slate-500 hover:bg-slate-50 transition-all font-mono" onClick={clearResponse}>
                CLEAR
              </button>
            </div>

            <button
              className="w-full md:w-auto px-12 py-3 text-[14px] font-black rounded-xl text-white shadow-xl shadow-brand-primary/20 transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: brandColor }}
              onClick={saveAndNext}
            >
              SAVE & NEXT
            </button>
          </div>
        </div>

        {/* RIGHT: SIDEBAR / PALETTE */}
        <div className={cn(
          "bg-white border-l border-slate-200 flex flex-col shrink-0 transition-all duration-300 absolute md:relative h-full z-[100] right-0 shadow-xl md:shadow-none",
          sidebarOpen ? "translate-x-0 w-[300px]" : "translate-x-full w-0 md:w-0"
        )}>
          {/* Mobile Overlay */}
          {sidebarOpen && <div className="md:hidden fixed inset-0 -ml-[100vw] w-[100vw] bg-slate-900/50 backdrop-blur-sm -z-10" onClick={() => setSidebarOpen(false)} />}

          <button
            className="hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-14 bg-slate-800 text-white items-center justify-center rounded-l-lg shadow-xl cursor-pointer hover:bg-brand-primary transition-all group"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          <div className={cn("flex flex-col h-full", !sidebarOpen && "hidden")}>
            <div className="flex items-center gap-3 p-3 bg-white border-b border-gray-200">
              <div className="w-9 h-9 rounded bg-brand-primary/10 flex items-center justify-center"><UserIcon className="h-5 w-5 text-brand-primary" /></div>
              <span className="text-[13px] font-bold text-gray-800">{displayName}</span>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-2.5"><PaletteShapes.Answered num={stats.answered} /><span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Answered</span></div>
              <div className="flex items-center gap-2.5"><PaletteShapes.Marked num={stats.marked} /><span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Marked</span></div>
              <div className="flex items-center gap-2.5"><PaletteShapes.NotVisited num={stats.not_visited} /><span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Not Visited</span></div>
              <div className="flex items-center gap-2.5"><PaletteShapes.MarkedAndAnswered num={stats.marked_answered} /><span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-tight">Marked &<br />Answered</span></div>
              <div className="flex items-center gap-2.5 col-span-2 pt-2 border-t border-slate-50"><PaletteShapes.NotAnswered num={stats.not_answered} /><span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Not Answered</span></div>
            </div>

            <div className="bg-[#d0dfec] px-3 py-2 border-b border-gray-300 shadow-inner font-mono font-bold text-[11px]">SECTION: {currentQ.section}</div>

            <div className="flex-1 overflow-y-auto p-4 bg-white custom-scrollbar">
              <div className="grid grid-cols-5 gap-3">
                {questions.map((q, i) => (
                  <div key={q.id} onClick={() => navigateTo(i)} className={cn("cursor-pointer transition-transform", currentIdx === i && "scale-110")}>
                    {qState[i]?.status === "not_visited" && <PaletteShapes.NotVisited num={q.number} active={currentIdx === i} />}
                    {qState[i]?.status === "not_answered" && <PaletteShapes.NotAnswered num={q.number} active={currentIdx === i} />}
                    {qState[i]?.status === "answered" && <PaletteShapes.Answered num={q.number} active={currentIdx === i} />}
                    {qState[i]?.status === "marked" && <PaletteShapes.Marked num={q.number} active={currentIdx === i} />}
                    {qState[i]?.status === "marked_answered" && <PaletteShapes.MarkedAndAnswered num={q.number} active={currentIdx === i} />}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
              <div className="flex gap-2">
                <button onClick={() => setShowQPaperModal(true)} className="flex-1 bg-white border border-slate-200 text-[11px] font-black py-2.5 rounded shadow-sm hover:bg-white transition-all flex items-center justify-center gap-1.5"><FileText className="h-3.5 w-3.5" /> QUESTION PAPER</button>
                <button onClick={() => setShowReportModal(true)} className="flex-1 bg-white border border-slate-200 text-[11px] font-black py-2.5 rounded shadow-sm hover:bg-white transition-all flex items-center justify-center gap-1.5"><Flag className="h-3.5 w-3.5" /> REPORT</button>
              </div>
              <button onClick={() => setShowSubmitModal(true)} className="w-full text-white text-[13px] font-black py-3.5 rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" style={{ backgroundColor: brandColor }} disabled={submitting}>
                {submitting ? "SUBMITTING..." : "SUBMIT TEST"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowSubmitModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-900 px-6 py-5 flex items-center justify-between text-white">
              <div><h2 className="text-xl font-black italic tracking-tight">Final Submission</h2><p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Review your performance summary before closing</p></div>
              <button onClick={() => setShowSubmitModal(false)} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-8">
              <div className="rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#1e293b] text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <tr><th className="px-6 py-4">Section Name</th><th className="px-6 py-4 text-center">Total</th><th className="px-6 py-4 text-center text-emerald-400">Answered</th><th className="px-6 py-4 text-center text-rose-400">Not Answered</th><th className="px-6 py-4 text-center text-violet-400">Marked</th><th className="px-6 py-4 text-center">Not Visited</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-bold">
                    {/* Simplified mapping for brevity in this rewrite */}
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">{currentQ.section}</td>
                      <td className="px-6 py-4 text-center">{questions.length}</td>
                      <td className="px-6 py-4 text-center text-emerald-600 font-black">{stats.answered + stats.marked_answered}</td>
                      <td className="px-6 py-4 text-center text-rose-500 font-black">{stats.not_answered}</td>
                      <td className="px-6 py-4 text-center text-violet-600 font-black">{stats.marked}</td>
                      <td className="px-6 py-4 text-center text-slate-400">{stats.not_visited}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button onClick={() => setShowSubmitModal(false)} className="px-6 py-2.5 text-[12px] font-black text-slate-400 hover:text-slate-600 transition-all">GO BACK</button>
                <button onClick={handleSubmit} className="px-10 py-3 rounded-xl text-white font-black shadow-xl" style={{ backgroundColor: brandColor }} disabled={submitting}>{submitting ? "SUBMITTING..." : "CONFIRM SUBMIT"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showQPaperModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowQPaperModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-5">
            <div className="bg-slate-900 p-5 flex items-center justify-between text-white shrink-0">
              <h3 className="text-lg font-black italic">Question Paper</h3>
              <button onClick={() => setShowQPaperModal(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {questions.map((q, i) => (
                <div key={q.id} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex gap-4 cursor-pointer hover:border-brand-primary/30" onClick={() => { navigateTo(i); setShowQPaperModal(false); }}>
                  <div className="shrink-0"><PaletteShapes.NotVisited num={q.number} /></div>
                  <div className="text-[14px] font-bold text-slate-700 line-clamp-2" dangerouslySetInnerHTML={{ __html: q.text }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 text-black">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowReportModal(false)} />
          <div className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95">
            <h3 className="text-xl font-black mb-6">Report Question {currentQ.number}</h3>
            <div className="space-y-3 mb-8">
              {['wrong_answer', 'wrong_question', 'image_issue', 'other'].map(type => (
                <label key={type} className="flex items-center gap-3 p-3.5 border-2 border-slate-50 rounded-xl cursor-pointer hover:bg-slate-50 transition-all has-[:checked]:border-brand-primary/30 has-[:checked]:bg-brand-primary/5">
                  <input type="radio" checked={reportType === type} onChange={() => setReportType(type)} className="accent-brand-primary" />
                  <span className="text-sm font-bold text-slate-700 capitalize">{type.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowReportModal(false)} className="flex-1 py-3 text-sm font-black text-slate-400">CANCEL</button>
              <button onClick={handleReport} className="flex-1 py-3 rounded-xl bg-brand-primary text-white text-sm font-black shadow-lg shadow-brand-primary/20" style={{ backgroundColor: brandColor }}>SUBMIT REPORT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
