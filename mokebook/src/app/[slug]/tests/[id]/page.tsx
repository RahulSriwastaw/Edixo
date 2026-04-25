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

// ═══════════════════════════════════════════════
// TYPES & CONSTANTS
// ═══════════════════════════════════════════════

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

const PaletteKey = [
  { color: "#f0f0f0", border: "#ccc", textColor: "#333", label: "You have not visited the question yet" },
  { color: "#f43f5e", border: "transparent", textColor: "#fff", label: "You have not answered the question." },
  { color: "#10b981", border: "transparent", textColor: "#fff", label: "You have answered the question." },
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

// ═══════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════

export default function IntegratedTestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const testId = params?.id ? String(params.id) : "";
  const seriesSlug = params?.slug ? String(params.slug) : "";
  
  // VIEW STATE: 'instructions' | 'exam'
  const [view, setView] = useState<'instructions' | 'exam'>('instructions');
  const [instrStep, setInstrStep] = useState(1);
  const [declared, setDeclared] = useState(false);
  
  // SHARED STATE
  const [questions, setQuestions] = useState<Question[]>([]);
  const [testName, setTestName] = useState("Loading...");
  const [durationMins, setDurationMins] = useState(60);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [examError, setExamError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Student");
  const [lang, setLang] = useState<"english" | "hindi">("english");

  // EXAM SPECIFIC STATE
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [qState, setQState] = useState<Record<number, { status: string; answer: number | null; optionId: string | null }>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showQPaperModal, setShowQPaperModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState("wrong_answer");

  const qStartTimeRef = useRef<number>(Date.now());
  const qTimeSpent = useRef<Record<number, number>>({});

  // 1. Auth & Initial Profile Load
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/login?redirect=/${seriesSlug}/tests/${testId}`);
      return;
    }
    apiFetch("/students/me").then(res => {
      if (res.data?.name) setDisplayName(res.data.name);
    }).catch(() => { });
  }, [router, seriesSlug, testId]);

  // 2. Initial Data Load (Check for existing attempts)
  useEffect(() => {
    if (!testId || !isAuthenticated()) return;

    const init = async () => {
      try {
        setLoading(true);
        // Fetch test meta & questions
        const qRes = await apiFetch(`/mockbook/tests/${testId}/questions`);
        const data = qRes.data;
        if (!data || !data.questions) throw new Error("Test not found");

        setTestName(data.name || "Test");
        setDurationMins(data.durationMins || 60);
        setQuestions(data.questions);
        
        // Initialize state
        const initial: Record<number, { status: string; answer: number | null; optionId: string | null }> = {};
        data.questions.forEach((_: any, i: number) => {
          initial[i] = { status: i === 0 ? "not_answered" : "not_visited", answer: null, optionId: null };
        });
        setQState(initial);

        // Check if an attempt is already in progress
        const attRes = await apiFetch(`/mockbook/tests/${testId}/attempts`, {
          method: "POST",
          body: JSON.stringify({ action: "start" }), // This resumes if exists
        });
        
        if (attRes.data?.id) {
          setAttemptId(attRes.data.id);
          // If it was already in progress (resumed), jump to exam
          if (attRes.data.status === 'IN_PROGRESS' && attRes.status !== 201) {
             setSecondsLeft(attRes.data.timeRemainingSeconds || data.durationMins * 60);
             setView('exam');
          } else {
             setSecondsLeft(data.durationMins * 60);
          }
        }
      } catch (err: any) {
        setExamError(err.message || "Failed to load test");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [testId]);

  // ═══════════════════════════════════════════════
  // EXAM LOGIC
  // ═══════════════════════════════════════════════

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
    
    // Autosave logic...
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

  // ═══════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Loading Test...</p>
      </div>
    );
  }

  if (examError || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Test Unavailable</h2>
        <p className="text-slate-500 mb-6">{examError || "Could not load test questions."}</p>
        <button onClick={() => router.push(`/${seriesSlug}`)} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Go Back</button>
      </div>
    );
  }

  // ─── INSTRUCTIONS VIEW ───────────────────────────────────────
  if (view === 'instructions') {
    return (
      <div className="flex flex-col h-screen bg-white font-sans overflow-hidden">
        <header className="bg-white border-b border-gray-200 flex items-center justify-between px-4 h-11 shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white font-black text-xs">M</div>
             <span className="font-bold text-sm text-gray-800">{testName}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-gray-700">{displayName}</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {instrStep === 1 ? (
            <div className="p-6 max-w-4xl mx-auto" style={{ fontSize: 13, lineHeight: 1.6 }}>
               <h2 className="font-bold text-lg mb-4 border-b pb-2">General Instructions</h2>
               <ol className="list-decimal pl-5 space-y-3 text-gray-700">
                  <li>The clock will be set at the server. The countdown timer at the top right corner will show the remaining time.</li>
                  <li>Question Palette status symbols:
                     <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {PaletteKey.map((p, i) => (
                           <div key={i} className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded border flex items-center justify-center text-white font-bold" style={{ backgroundColor: p.color }}>{i+1}</div>
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
               <h2 className="font-bold text-lg mb-4 border-b pb-2">Test Specific Instructions</h2>
               <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex flex-col items-center">
                     <Clock className="h-5 w-5 text-blue-600 mb-1" />
                     <span className="font-bold">{durationMins} Mins</span>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex flex-col items-center">
                     <FileText className="h-5 w-5 text-blue-600 mb-1" />
                     <span className="font-bold">{questions.length} Qs</span>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex flex-col items-center">
                     <BarChart3 className="h-5 w-5 text-blue-600 mb-1" />
                     <span className="font-bold">{questions.reduce((acc, q) => acc + q.marks, 0)} Marks</span>
                  </div>
               </div>
               
               <div className="space-y-4">
                  <div>
                    <label className="block font-bold mb-2">Default Language:</label>
                    <select className="border p-2 rounded w-48" value={lang} onChange={(e: any) => setLang(e.target.value)}>
                       <option value="english">English</option>
                       <option value="hindi">Hindi</option>
                    </select>
                  </div>
                  
                  <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer">
                     <input type="checkbox" checked={declared} onChange={e => setDeclared(e.target.checked)} className="mt-1 w-4 h-4 accent-blue-600" />
                     <span className="text-gray-600">I have read and understood all instructions. I agree to abide by the rules.</span>
                  </label>
               </div>
            </div>
          )}
        </div>

        <footer className="p-4 border-t flex justify-between">
           <button onClick={() => instrStep === 2 ? setInstrStep(1) : router.back()} className="px-6 py-2 text-gray-500 font-bold uppercase text-xs">
              {instrStep === 1 ? "Cancel" : "Back"}
           </button>
           <button 
              disabled={instrStep === 2 && !declared}
              onClick={() => instrStep === 1 ? setInstrStep(2) : setView('exam')}
              className={cn("px-8 py-2 rounded font-bold uppercase text-xs text-white", (instrStep === 2 && !declared) ? "bg-slate-300" : "bg-blue-600 shadow-lg")}
           >
              {instrStep === 1 ? "Next" : "I am ready to begin"}
           </button>
        </footer>
      </div>
    );
  }

  // ─── EXAM VIEW ──────────────────────────────────────────────
  const currentQ = questions[currentIdx];
  const currentQState = qState[currentIdx] || { status: "not_visited", answer: null, optionId: null };
  const stats = {
    answered: Object.values(qState).filter(s => s.status === "answered").length,
    not_answered: Object.values(qState).filter(s => s.status === "not_answered").length,
    not_visited: Object.values(qState).filter(s => s.status === "not_visited").length,
    marked: Object.values(qState).filter(s => s.status === "marked").length,
    marked_answered: Object.values(qState).filter(s => s.status === "marked_answered").length,
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden select-none">
      <header className="flex bg-white border-b border-slate-200 items-center justify-between px-6 shrink-0 h-14 z-30">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black italic">M</div>
          <h1 className="text-sm font-extrabold text-slate-800 truncate max-w-sm">{testName}</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Time Left</span>
            <div className="font-mono text-base font-black text-slate-800">{formatTime(secondsLeft)}</div>
          </div>
          <button className="h-8 px-3 text-[10px] font-bold text-blue-600 border border-blue-200 bg-blue-50 rounded-lg" onClick={handlePause}>PAUSE</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* QUESTION PANEL */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <div className="flex items-center justify-between px-8 py-3 border-b bg-slate-50/50">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question</span>
              <span className="text-xl font-black text-slate-800">{currentQ.number}</span>
            </div>
            <div className="flex items-center gap-3 bg-white px-3 py-1 rounded-full border text-[10px] font-bold">
               <span className="text-emerald-600">+{currentQ.marks}</span>
               <span className="text-rose-600">{currentQ.negative}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-10">
            <div className="max-w-4xl mx-auto">
              <div className="text-lg font-bold text-slate-800 mb-10 leading-relaxed" dangerouslySetInnerHTML={{ __html: currentQ.text }} />
              <div className="grid gap-3">
                {currentQ.options.map((opt, i) => (
                  <label key={opt.id} className={cn(
                    "flex items-center gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all",
                    currentQState.answer === i ? "border-blue-600 bg-blue-50/30" : "border-slate-100 hover:border-slate-200"
                  )} onClick={() => handleSelectOption(i, opt.id)}>
                    <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", currentQState.answer === i ? "border-blue-600 bg-blue-600" : "border-slate-300")}>
                      {currentQState.answer === i && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="text-sm font-bold text-slate-700" dangerouslySetInnerHTML={{ __html: opt.text }} />
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t p-4 flex items-center justify-between bg-white z-30">
            <div className="flex gap-2">
              <button className="px-6 py-2.5 text-xs font-black border text-slate-500 rounded-lg" onClick={markForReviewAndNext}>MARK FOR REVIEW</button>
              <button className="px-6 py-2.5 text-xs font-black border text-slate-500 rounded-lg" onClick={clearResponse}>CLEAR</button>
            </div>
            <button className="px-12 py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg" onClick={saveAndNext}>SAVE & NEXT</button>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className={cn("w-[300px] bg-white border-l flex flex-col shrink-0 transition-all", sidebarOpen ? "translate-x-0" : "translate-x-full w-0")}>
           <div className="p-4 bg-slate-50 border-b flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-blue-100 flex items-center justify-center text-blue-600 font-bold">{displayName.charAt(0)}</div>
              <span className="text-sm font-bold">{displayName}</span>
           </div>
           
           <div className="p-4 grid grid-cols-2 gap-3 border-b">
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-emerald-500 rounded" /><span className="text-[10px] font-bold text-slate-400">Answered ({stats.answered})</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-rose-500 rounded" /><span className="text-[10px] font-bold text-slate-400">Not Ans ({stats.not_answered})</span></div>
           </div>

           <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-5 gap-2">
                 {questions.map((q, i) => (
                    <div key={q.id} onClick={() => navigateTo(i)} className="cursor-pointer">
                       {qState[i]?.status === "not_visited" && <PaletteShapes.NotVisited num={q.number} active={currentIdx === i} />}
                       {qState[i]?.status === "not_answered" && <PaletteShapes.NotAnswered num={q.number} active={currentIdx === i} />}
                       {qState[i]?.status === "answered" && <PaletteShapes.Answered num={q.number} active={currentIdx === i} />}
                       {qState[i]?.status === "marked" && <PaletteShapes.Marked num={q.number} active={currentIdx === i} />}
                       {qState[i]?.status === "marked_answered" && <PaletteShapes.MarkedAndAnswered num={q.number} active={currentIdx === i} />}
                    </div>
                 ))}
              </div>
           </div>

           <div className="p-4 border-t bg-slate-50">
              <button className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-xl" onClick={() => setShowSubmitModal(true)}>SUBMIT TEST</button>
           </div>
        </div>
      </div>

      {/* SUBMIT MODAL */}
      {showSubmitModal && (
         <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg p-8">
               <h2 className="text-2xl font-black mb-6">Submit Test?</h2>
               <div className="space-y-4 mb-8">
                  <div className="flex justify-between border-b pb-2"><span className="font-bold text-slate-500">Answered</span><span className="font-black text-emerald-600">{stats.answered}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="font-bold text-slate-500">Not Answered</span><span className="font-black text-rose-500">{stats.not_answered}</span></div>
               </div>
               <div className="flex gap-4">
                  <button className="flex-1 py-3 font-bold text-slate-400" onClick={() => setShowSubmitModal(false)}>BACK</button>
                  <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg" onClick={handleSubmit}>SUBMIT</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
