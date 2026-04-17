"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ChevronLeft, ChevronRight, Clock, HelpCircle, BarChart3, BookOpen } from "lucide-react";
import { apiFetch, isAuthenticated, getCookie } from "@/lib/api";

const PaletteKey = [
  { color: "#f0f0f0", border: "#ccc", textColor: "#333", label: "You have not visited the question yet" },
  { color: "#d32f2f", border: "transparent", textColor: "#fff", label: "You have not answered the question." },
  { color: "#2e8b57", border: "transparent", textColor: "#fff", label: "You have answered the question." },
  { color: "#9c27b0", border: "transparent", textColor: "#fff", label: "You have NOT answered the question, but have marked the question for review." },
  { color: "#9c27b0", border: "transparent", textColor: "#fff", label: "You have answered the question, marked it for review." },
];

interface TestMeta {
  id: string;
  testId: string;
  name: string;
  durationMins: number;
  totalMarks: number;
  status: string;
  sections?: { name: string; set?: { items?: any[] } }[];
}

export default function TestInstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("Student");
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("testLanguage") || "";
    }
    return "";
  });
  const [declared, setDeclared] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [testMeta, setTestMeta] = useState<TestMeta | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const testId = params?.id ? String(params.id) : "demo-test";

  // ── Auth guard ──────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/login?redirect=/tests/instructions/${testId}`);
    }
  }, [router, testId]);

  // Load student profile (only when authenticated)
  useEffect(() => {
    if (!isAuthenticated()) return;
    apiFetch("/students/me").then(res => {
      if (res.data?.name) setDisplayName(res.data.name);
    }).catch(() => {});
  }, []);

  // Load test metadata
  useEffect(() => {
    if (!testId) return;
    setLoadingMeta(true);
    apiFetch(`/mockbook/tests/${testId}`)
      .then(res => setTestMeta(res.data || null))
      .catch(() => {})
      .finally(() => setLoadingMeta(false));
  }, [testId]);

  const handleBegin = () => {
    if (step === 1) { setStep(2); return; }
    if (language && declared) {
      sessionStorage.setItem("testLanguage", language);
      setIsNavigating(true);
      setTimeout(() => { window.location.href = `/tests/exam/${testId}`; }, 300);
    }
  };

  const questionCount = testMeta?.sections?.reduce((acc, sec) => acc + (sec.set?.items?.length || 0), 0) || 0;

  return (
    <div className="flex flex-col h-screen bg-white font-sans overflow-hidden" style={{ fontSize: 13 }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex items-center justify-between px-4 h-11 shrink-0">
        <div className="flex items-center gap-3">
          <div className="cursor-pointer flex items-center gap-2" onClick={() => router.push("/tests")}>
            <div className="w-7 h-7 bg-[#1a73e8] rounded flex items-center justify-center">
              <span className="text-white font-black text-xs">M</span>
            </div>
            <span className="font-bold text-sm text-gray-800">Mockbook</span>
          </div>
          <span className="text-gray-300 text-xs">|</span>
          <span className="text-gray-600 text-xs font-medium truncate max-w-xs">
            {loadingMeta ? "Loading..." : (testMeta?.name || (step === 1 ? "General Instructions" : "Test Instructions"))}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#1a73e8] flex items-center justify-center text-white font-bold text-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-semibold text-gray-700 hidden sm:inline">{displayName}</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {step === 1 ? (
            <div className="p-6 max-w-3xl" style={{ fontSize: 13, lineHeight: 1.6 }}>
              <p className="font-bold text-gray-900 mb-3">General Instructions:</p>
              <ol className="list-decimal pl-5 space-y-2.5 text-gray-700">
                <li>
                  The clock will be set at the server. The countdown timer at the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You need not terminate the examination or submit your paper.
                </li>
                <li>
                  The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:
                  <div className="mt-3 space-y-2">
                    {PaletteKey.map((p, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-sm flex items-center justify-center font-bold text-xs flex-shrink-0"
                          style={{ background: p.color, border: `1px solid ${p.border}`, color: p.textColor }}
                        >
                          {i + 1}
                        </div>
                        <span className="text-gray-600">{p.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-gray-600">
                    The <strong>Mark For Review</strong> status simply indicates you would like to look at that question again. If a question is answered but marked for review, the answer will be considered for evaluation unless modified.
                  </p>
                </li>
                <li>
                  <strong>Navigating to a Question:</strong>
                  <ol className="list-decimal pl-4 mt-1.5 space-y-1">
                    <li>To answer a question, do the following:
                      <ol className="list-decimal pl-4 mt-1 space-y-1">
                        <li>Click on the question number in the Question Palette to go to that question directly. This does NOT save your current answer.</li>
                        <li>Click on <strong>Save &amp; Next</strong> to save your answer and go to the next question.</li>
                        <li>Click on <strong>Mark for Review &amp; Next</strong> to save, mark for review, and go to the next question.</li>
                      </ol>
                    </li>
                  </ol>
                  <p className="mt-2 text-gray-600">Note: Your answer will not be saved if you navigate without clicking Save &amp; Next.</p>
                  <p className="mt-2 text-gray-600">You can view all questions by clicking the <strong>Question Paper</strong> button.</p>
                </li>
                <li>
                  <strong>Answering a Question:</strong>
                  <ol className="list-decimal pl-4 mt-1.5 space-y-1">
                    <li>Choose one answer from the 4 options (A,B,C,D), click the bubble before the chosen option.</li>
                    <li>To deselect, click the same bubble again or click <strong>Clear Response</strong>.</li>
                    <li>To change your answer, click on another option.</li>
                    <li>To save your answer, you MUST click <strong>Save &amp; Next</strong>.</li>
                  </ol>
                </li>
                <li>Sections are displayed on the top bar. Questions in a Section can be viewed by clicking on the section name.</li>
                <li>After Save &amp; Next on the last question in a Section, you will be taken to the first question of the next Section.</li>
                <li>You can move the cursor over a Section name to view the answering status for that Section.</li>
              </ol>
            </div>
          ) : (
            <div className="p-6 max-w-2xl" style={{ fontSize: 13, lineHeight: 1.6 }}>
              {/* Test info cards */}
              {testMeta && (
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex flex-col items-center text-center">
                    <Clock className="h-5 w-5 text-[#1a73e8] mb-1" />
                    <span className="text-xs font-bold text-gray-900">{testMeta.durationMins} Minutes</span>
                    <span className="text-[10px] text-gray-500">Duration</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex flex-col items-center text-center">
                    <BarChart3 className="h-5 w-5 text-[#1a73e8] mb-1" />
                    <span className="text-xs font-bold text-gray-900">{testMeta.totalMarks} Marks</span>
                    <span className="text-[10px] text-gray-500">Total Marks</span>
                  </div>
                  {questionCount > 0 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex flex-col items-center text-center">
                      <BookOpen className="h-5 w-5 text-[#1a73e8] mb-1" />
                      <span className="text-xs font-bold text-gray-900">{questionCount} Questions</span>
                      <span className="text-[10px] text-gray-500">Total</span>
                    </div>
                  )}
                </div>
              )}

              <p className="font-bold text-gray-900 mb-3">Read the following instructions carefully.</p>
              <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                <li>The test contains <strong>{questionCount || "multiple"}</strong> questions.</li>
                <li>Each question has 4 options out of which only one is correct.</li>
                <li>You have to finish the test in the allotted time of <strong>{testMeta?.durationMins || "–"} minutes</strong>.</li>
                <li>You will be awarded marks for each correct answer and marks will be deducted for each wrong answer.</li>
                <li>There is no negative marking for unattempted questions.</li>
                <li>You can reattempt this test after submission.</li>
              </ol>

              <div className="mt-5">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Choose your default language:</label>
                <select
                  className="border border-gray-300 rounded text-sm px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:border-[#1a73e8] w-40"
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                >
                  <option value="">-- Select --</option>
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                </select>
                {!language && (
                  <p className="text-red-500 text-xs mt-1">Please select a language to continue.</p>
                )}
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold text-gray-700 mb-2">Declaration:</p>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 w-4 h-4 accent-[#1a73e8]"
                    checked={declared}
                    onChange={e => setDeclared(e.target.checked)}
                  />
                  <span className="text-gray-600">
                    I have read all the instructions carefully and have understood them. I agree not to cheat or use unfair means in this examination. The decision of Mockbook will be final in these matters and cannot be appealed.
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Right profile panel */}
        <div className="w-36 flex-shrink-0 flex flex-col items-center pt-6 bg-white border-l border-gray-200">
          <div className="w-20 h-20 rounded-full bg-[#1a73e8] flex items-center justify-center text-white font-bold text-3xl">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm font-semibold text-gray-700 mt-2 text-center px-2 leading-tight">{displayName}</p>
          {testMeta && (
            <div className="mt-4 px-3 text-center space-y-1">
              <p className="text-[10px] text-gray-500 font-medium leading-tight">Test ID</p>
              <p className="text-[11px] font-mono font-bold text-gray-700">{testMeta.testId}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <button
          className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-[#1a73e8] transition-colors"
          onClick={() => step === 2 ? setStep(1) : router.back()}
          disabled={isNavigating}
        >
          <ChevronLeft className="h-4 w-4" />
          {step === 1 ? "Go to Tests" : "Previous"}
        </button>

        {step === 1 ? (
          <button
            className="flex items-center gap-1 px-5 py-2 text-sm font-semibold bg-[#1a73e8] text-white rounded hover:bg-[#1557b0] transition-colors"
            onClick={() => setStep(2)}
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            className={`px-6 py-2 text-sm font-semibold rounded transition-colors ${
              declared && language
                ? "bg-[#1a73e8] text-white hover:bg-[#1557b0]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            disabled={!declared || !language || isNavigating}
            onClick={handleBegin}
          >
            {isNavigating
              ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Starting...</span>
              : "I am ready to begin"
            }
          </button>
        )}
      </footer>
    </div>
  );
}
