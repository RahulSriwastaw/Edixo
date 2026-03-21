"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, AlertTriangle, User as UserIcon,
  ChevronLeft, ChevronRight, Menu, Maximize, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// TCS iON standard palette shapes
const PaletteShapes = {
  NotVisited: ({ num }: { num: number }) => (
    <div className="w-8 h-8 md:w-[38px] md:h-[34px] bg-[#e2e2e2] text-black text-xs font-semibold flex items-center justify-center border border-[#ccc] rounded-sm shadow-sm hover:bg-[#d0d0d0] transition-colors">
      {num}
    </div>
  ),
  NotAnswered: ({ num }: { num: number }) => (
    <div className="relative w-8 h-8 md:w-[38px] md:h-[34px] flex items-center justify-center hover:opacity-90 transition-opacity">
      <svg viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full drop-shadow-sm">
        <path d="M0 0H38V22C38 22 25 34 19 34C13 34 0 22 0 22V0Z" fill="#d32f2f" />
      </svg>
      <span className="relative text-white text-xs font-bold -mt-1">{num}</span>
    </div>
  ),
  Answered: ({ num }: { num: number }) => (
    <div className="relative w-8 h-8 md:w-[38px] md:h-[34px] flex items-center justify-center hover:opacity-90 transition-opacity">
      <svg viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full drop-shadow-sm">
        <path d="M0 12C0 12 13 0 19 0C25 0 38 12 38 12V34H0V12Z" fill="#2e8b57" />
      </svg>
      <span className="relative text-white text-xs font-bold mt-1">{num}</span>
    </div>
  ),
  Marked: ({ num }: { num: number }) => (
    <div className="w-8 h-8 md:w-[34px] md:h-[34px] bg-[#9c27b0] text-white text-xs font-bold flex items-center justify-center rounded-full shadow-sm hover:opacity-90 transition-opacity mx-auto">
      {num}
    </div>
  ),
  MarkedAndAnswered: ({ num }: { num: number }) => (
    <div className="relative w-8 h-8 md:w-[34px] md:h-[34px] bg-[#9c27b0] text-white text-xs font-bold flex items-center justify-center rounded-full shadow-sm hover:opacity-90 transition-opacity mx-auto">
      {num}
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#2e8b57] rounded-full border border-white" />
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

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [qState, setQState] = useState<Record<number, { status: string; answer: number | null; optionId: string | null }>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [displayName, setDisplayName] = useState("Student");

  // Fetch questions and start attempt
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        // 1. Fetch student profile for display name
        try {
          const meRes = await apiFetch("/students/me");
          if (meRes.data?.name) setDisplayName(meRes.data.name);
        } catch {}

        // 2. Fetch questions
        const qRes = await apiFetch(`/mockbook/tests/${testId}/questions`);
        const data = qRes.data;
        if (!data || !data.questions) throw new Error("No questions returned");

        setTestName(data.name || "Test");
        setDurationMins(data.durationMins || 60);
        setSecondsLeft((data.durationMins || 60) * 60);
        setQuestions(data.questions);

        // 3. Start attempt
        const attRes = await apiFetch(`/mockbook/tests/${testId}/attempts`, {
          method: "POST",
          body: JSON.stringify({ action: "start" }),
        });
        if (attRes.data?.id) setAttemptId(attRes.data.id);

        // 4. Initialize question state
        const initial: any = {};
        data.questions.forEach((_: any, i: number) => {
          initial[i] = { status: i === 0 ? "not_answered" : "not_visited", answer: null, optionId: null };
        });
        setQState(initial);
        setIsReady(true);
      } catch (err: any) {
        console.error("Failed to load exam:", err);
        // Fallback: show an error state (questions will be empty)
        setTestName("Error — Could not load test");
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
    return `${h.toString().padStart(2,'0')} : ${m.toString().padStart(2,'0')} : ${s.toString().padStart(2,'0')}`;
  };

  const navigateTo = (idx: number) => {
    setQState(prev => {
      const copy = { ...prev };
      if (copy[idx]?.status === "not_visited") copy[idx].status = "not_answered";
      return copy;
    });
    setCurrentIdx(idx);
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
    setQState(prev => {
      const current = prev[currentIdx] ?? { status: "not_answered", answer: null, optionId: null };
      return {
        ...prev,
        [currentIdx]: {
          ...current,
          status: current.answer !== null ? "answered" : "not_answered"
        }
      };
    });
    if (currentIdx < questions.length - 1) navigateTo(currentIdx + 1);
  };

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Build answers array
      const answers = questions.map((q, i) => ({
        questionId: q.id,
        selectedOptions: qState[i]?.optionId ? [qState[i].optionId!] : [],
      }));

      const res = await apiFetch(`/mockbook/tests/${testId}/attempts`, {
        method: "POST",
        body: JSON.stringify({ action: "submit", answers }),
      });

      if (res.success && res.data) {
        toast({
          title: "Test Submitted",
          description: "Your test has been submitted successfully.",
        });
        // Use router.push for better SPA feel
        const targetId = res.data.id || res.data.attemptId;
        router.push(`/tests/results/${targetId}`);
      } else {
        throw new Error(res.message || "Failed to submit test");
      }
    } catch (err: any) {
      console.error("Submit failed:", err);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: err.message || "There was an error submitting your test. Returning to dashboard.",
      });
      // Redirect to dashboard as a last resort
      router.push("/tests");
    } finally {
      setSubmitting(false);
    }
  }, [questions, qState, testId, submitting, router, toast]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  };

  if (loading || !isReady) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f0f4f7]">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-4" />
        <p className="text-slate-600 font-semibold text-sm">Loading questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f0f4f7] space-y-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="font-bold text-slate-700 text-lg">Could not load test</p>
        <p className="text-slate-400 text-sm">This test may not have any questions configured yet, or the test ID is incorrect.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-6 py-2 bg-gray-800 text-white rounded text-sm font-semibold hover:bg-gray-700"
        >
          Go Back
        </button>
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

  const brandColor = "#ff5c28";
  const brandSubColor = "#fff0eb";

  return (
    <div className="flex flex-col h-screen bg-white font-sans overflow-hidden text-[#333] select-none">
      {/* TOP HEADER */}
      <header className="bg-white border-b border-gray-300 flex items-center justify-between px-4 py-2 shrink-0 h-14">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-black p-1 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-semibold text-gray-800 hidden md:block truncate max-w-xs">
            {testName}
          </h1>
          <h1 className="text-sm font-semibold text-gray-800 md:hidden truncate w-40">
            {testName}
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className={cn(
            "hidden sm:flex items-center gap-2 px-3 py-1 rounded",
            secondsLeft < 300 ? "bg-red-50 border border-red-200" : "bg-gray-100"
          )}>
            <span className={cn("text-xs font-bold", secondsLeft < 300 ? "text-red-600" : "text-gray-700")}>Time Left</span>
            <span className={cn("text-xs font-mono font-bold border bg-white px-2 py-0.5 rounded-sm", secondsLeft < 300 ? "border-red-400 text-red-600" : "border-gray-300 text-black")}>
              {formatTime(secondsLeft)}
            </span>
          </div>
          <button
            className="hidden md:flex items-center gap-2 border border-[#00a8d6] text-[#00a8d6] hover:bg-[#f0f9ff] px-3 py-1.5 text-xs font-semibold rounded transition-colors"
            onClick={toggleFullscreen}
          >
            <Maximize className="h-4 w-4" />
            {isFullscreen ? "Exit Full Screen" : "Switch Full Screen"}
          </button>
        </div>
      </header>

      {/* SUB-HEADER: Sections */}
      <div className="flex items-center justify-between border-b border-gray-300 bg-white shrink-0 shadow-sm z-10">
        <div className="flex items-center">
          <div className="px-5 py-2 text-[11px] font-bold text-gray-600 border-r border-gray-300">SECTIONS</div>
          <div
            className="text-white px-10 py-2.5 text-xs font-semibold flex items-center ml-1 rounded-sm shadow-inner"
            style={{ backgroundColor: brandColor }}
          >
            {currentQ.section}
          </div>
        </div>
        <div className="px-4 flex items-center gap-2 md:hidden">
          <button className="p-1.5 bg-gray-100 rounded border border-gray-200" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-4 w-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT: QUESTION PANEL */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-200 shrink-0">
            <span className="text-sm font-bold text-black">Question No. {currentQ.number}</span>
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
              <div className="hidden sm:flex items-center gap-1">
                <span>Marks</span>
                <span className="bg-[#28a745] text-white text-[10px] px-1.5 rounded-full">+{currentQ.marks}</span>
                <span className="bg-[#dc3545] text-white text-[10px] px-1.5 rounded-full">{currentQ.negative}</span>
              </div>
              <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
                <span>View in</span>
                <select className="border border-gray-300 text-xs px-2 py-0.5 rounded outline-none bg-white">
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 md:p-8">
            <div className="max-w-4xl">
              {currentQ.imageUrl && (
                <img src={currentQ.imageUrl} alt="question" className="mb-4 max-h-48 object-contain rounded border" />
              )}
              <div 
                className="text-[15px] font-medium text-black mb-8 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: currentQ.text || "" }}
              />

              <div className="space-y-4">
                {currentQ.options.map((opt, i) => {
                  const isSelected = currentQState.answer === i;
                  return (
                    <label
                      key={opt.id}
                      className={cn(
                        "flex items-center gap-3 cursor-pointer group p-3 rounded border transition-colors",
                        isSelected ? "border-transparent" : "border-transparent hover:bg-gray-50"
                      )}
                      style={{ backgroundColor: isSelected ? brandSubColor : 'transparent' }}
                    >
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name={`q-${currentQ.id}`}
                          className="w-[18px] h-[18px] cursor-pointer"
                          style={{ accentColor: brandColor }}
                          checked={isSelected}
                          onChange={() => handleSelectOption(i, opt.id)}
                        />
                      </div>
                      <div 
                        className="text-[14px] text-gray-800 font-medium"
                        dangerouslySetInnerHTML={{ __html: opt.text || "" }}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-300 bg-white flex flex-col md:flex-row items-center justify-between px-3 md:px-5 py-3 shrink-0 gap-3 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-center w-full md:w-auto gap-3">
              <button className="flex-1 md:flex-none px-4 py-2 text-[13px] font-semibold rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors shadow-sm bg-gray-50" onClick={markForReviewAndNext}>
                Mark for Review & Next
              </button>
              <button className="flex-1 md:flex-none px-4 py-2 text-[13px] font-semibold rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors shadow-sm bg-gray-50" onClick={clearResponse}>
                Clear Response
              </button>
            </div>
            <button
              className="w-full md:w-auto px-10 py-2 text-[13px] font-semibold rounded text-white shadow-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: brandColor }}
              onClick={saveAndNext}
            >
              Save & Next
            </button>
          </div>
        </div>

        {/* RIGHT: SIDEBAR */}
        <div className={cn(
          "bg-[#eef4f8] border-l border-gray-300 flex flex-col shrink-0 transition-all duration-300 absolute md:relative h-full z-10 right-0",
          sidebarOpen ? "w-[280px] translate-x-0" : "w-[280px] translate-x-full md:w-0 md:translate-x-0"
        )}>
          <button
            className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 w-5 h-12 bg-gray-800 text-white items-center justify-center rounded-l shadow-md cursor-pointer hover:bg-black transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          <div className={cn("flex flex-col h-full", !sidebarOpen && "md:hidden")}>
            <div className="flex items-center gap-3 p-3 bg-white border-b border-gray-200 shrink-0 shadow-sm">
              <div className="w-9 h-9 rounded bg-primary/10 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[13px] font-bold text-gray-800">{displayName}</span>
            </div>

            <div className="px-3 py-3 grid grid-cols-2 gap-y-2 gap-x-1 border-b border-gray-300 shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <PaletteShapes.Answered num={stats.answered} />
                <span className="text-[10px] font-semibold text-gray-700">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <PaletteShapes.Marked num={stats.marked} />
                <span className="text-[10px] font-semibold text-gray-700">Marked</span>
              </div>
              <div className="flex items-center gap-2">
                <PaletteShapes.NotVisited num={stats.not_visited} />
                <span className="text-[10px] font-semibold text-gray-700">Not Visited</span>
              </div>
              <div className="flex items-center gap-2">
                <PaletteShapes.MarkedAndAnswered num={stats.marked_answered} />
                <span className="text-[10px] font-semibold text-gray-700 leading-tight">Marked & Answered</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 mt-1">
                <div className="shrink-0"><PaletteShapes.NotAnswered num={stats.not_answered} /></div>
                <span className="text-[10px] font-semibold text-gray-700">Not Answered</span>
              </div>
            </div>

            <div className="bg-[#d0dfec] px-3 py-2 border-b border-gray-300 shrink-0">
              <span className="text-[11px] font-bold text-black">SECTION : {currentQ.section}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 bg-[#eef4f8]">
              <div className="grid grid-cols-5 gap-2 md:gap-3 place-items-center">
                {questions.map((q, i) => {
                  const s = qState[i] || { status: "not_visited" };
                  return (
                    <div
                      key={q.id}
                      onClick={() => navigateTo(i)}
                      className={cn("cursor-pointer transition-transform hover:scale-105 active:scale-95", currentIdx === i ? "drop-shadow-md brightness-110 scale-[1.05]" : "")}
                    >
                      {s.status === "not_visited" && <PaletteShapes.NotVisited num={q.number} />}
                      {s.status === "not_answered" && <PaletteShapes.NotAnswered num={q.number} />}
                      {s.status === "answered" && <PaletteShapes.Answered num={q.number} />}
                      {s.status === "marked" && <PaletteShapes.Marked num={q.number} />}
                      {s.status === "marked_answered" && <PaletteShapes.MarkedAndAnswered num={q.number} />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-white border-t border-gray-300 flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between gap-2">
                <button className="flex-1 bg-[#a5dff3] hover:bg-[#8ecee6] border border-[#6ac9e6] text-gray-800 text-[11px] font-semibold py-2 px-2 shadow-sm rounded-sm transition-colors">
                  Question Paper
                </button>
                <button className="flex-1 bg-[#a5dff3] hover:bg-[#8ecee6] border border-[#6ac9e6] text-gray-800 text-[11px] font-semibold py-2 px-2 shadow-sm rounded-sm transition-colors">
                  Instructions
                </button>
              </div>
              <button
                className="w-full text-white text-[13px] font-semibold py-2.5 rounded-sm shadow-sm opacity-90 hover:opacity-100 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: brandColor }}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
