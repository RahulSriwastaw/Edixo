"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  RotateCcw,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const mockQuestions = [
  {
    id: 1,
    text: "Which of the following describes the rate of change of momentum of an object?",
    options: ["Force", "Inertia", "Velocity", "Acceleration"],
    correct: 0,
    explanation: "According to Newton's Second Law, the rate of change of momentum is proportional to the applied force."
  },
  {
    id: 2,
    text: "The value of acceleration due to gravity (g) is minimum at:",
    options: ["Equator", "Poles", "Center of Earth", "None of these"],
    correct: 0,
    explanation: "Due to the centrifugal force and the Earth's bulge, 'g' is minimum at the equator."
  }
];

export default function PracticeSessionPage() {
  const router = useRouter();
  const { id } = useParams();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [instantFeedbackEnabled, setInstantFeedbackEnabled] = useState(true);

  const q = mockQuestions[currentIdx];

  const handleOptionSelect = (idx: number) => {
    if (showFeedback && instantFeedbackEnabled) return;
    setSelectedOption(idx);
    if (instantFeedbackEnabled) {
      setShowFeedback(true);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < mockQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      router.push("/practice");
    }
  };

  const progress = ((currentIdx + 1) / mockQuestions.length) * 100;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--bg-body)", color: "var(--text-primary)" }}>
      {/* Practice Header */}
      <header className="h-14 px-4 flex items-center justify-between shrink-0" style={{ background: "var(--bg-sidebar)", borderBottom: "var(--divider)" }}>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 rounded-lg">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
              <Zap className="h-3.5 w-3.5" style={{ color: "#FF6B2B" }} /> Practice: {String(id).toUpperCase()}
            </h1>
            <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
              <span>Question {currentIdx + 1} of {mockQuestions.length}</span>
              <div className="h-1 w-24 rounded-full overflow-hidden" style={{ background: "var(--bg-main)" }}>
                <Progress value={progress} className="h-full rounded-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: "rgba(255,107,43,0.08)", border: "1px solid rgba(255,107,43,0.15)" }}>
            <Clock className="h-3.5 w-3.5" style={{ color: "#FF6B2B" }} />
            <span className="text-xs font-bold" style={{ color: "#FF6B2B" }}>04:12</span>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="instant-feedback" className="text-[10px] font-bold uppercase hidden sm:block" style={{ color: "var(--text-muted)" }}>Instant Feedback</Label>
            <Switch
              id="instant-feedback"
              checked={instantFeedbackEnabled}
              onCheckedChange={setInstantFeedbackEnabled}
              className="h-5 w-9"
            />
          </div>
        </div>
      </header>

      {/* Session Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
        <div className="w-full max-w-3xl space-y-6">
          <Card className="shadow-sm rounded-lg" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
            <CardContent className="p-6 md:p-10 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px] font-bold px-2 rounded-full" style={{ background: "var(--bg-main)", color: "var(--text-muted)" }}>SINGLE CHOICE</Badge>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>
                    <Flag className="h-3 w-3 mr-1" /> REPORT
                  </Button>
                </div>
                <h2 className="text-lg md:text-xl font-medium leading-relaxed" style={{ color: "var(--text-primary)" }}>
                  {q.text}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {q.options.map((opt, i) => {
                  const isCorrect = i === q.correct;
                  const isSelected = i === selectedOption;

                  let stateClasses = "";
                  let stateStyle: any = { background: "var(--bg-card)", border: "var(--border-card)", color: "var(--text-primary)" };

                  if (showFeedback) {
                    if (isCorrect) stateStyle = { background: "var(--badge-success-bg)", border: "1px solid var(--badge-success-text)", color: "var(--badge-success-text)" };
                    else if (isSelected) stateStyle = { background: "var(--badge-error-bg)", border: "1px solid var(--badge-error-text)", color: "var(--badge-error-text)" };
                    else stateStyle = { background: "var(--bg-main)", border: "var(--border-card)", opacity: 0.6, color: "var(--text-muted)" };
                  } else if (isSelected) {
                    stateStyle = { background: "rgba(255,107,43,0.05)", border: "1px solid rgba(255,107,43,0.3)", color: "#FF6B2B" };
                  }

                  return (
                    <button
                      key={i}
                      disabled={showFeedback && instantFeedbackEnabled}
                      onClick={() => handleOptionSelect(i)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border text-left transition-all group relative",
                        stateClasses
                      )}
                      style={stateStyle}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors shrink-0",
                      )}
                        style={isSelected || (showFeedback && isCorrect) ? { background: "var(--bg-card)", borderColor: "transparent" } : { background: "var(--bg-main)", borderColor: "var(--border-card)" }}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-sm font-medium">{opt}</span>

                      {showFeedback && (
                        <div className="ml-auto">
                          {isCorrect && <CheckCircle2 className="h-5 w-5" style={{ color: "var(--badge-success-text)" }} />}
                          {isSelected && !isCorrect && <XCircle className="h-5 w-5" style={{ color: "var(--badge-error-text)" }} />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {showFeedback && (
                <div className="p-5 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-2" style={{ background: "var(--bg-main)", border: "var(--border-card)" }}>
                  <h4 className="text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
                    <HelpCircle className="h-3.5 w-3.5" style={{ color: "#FF6B2B" }} /> Explanation
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {q.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Session Footer */}
      <footer className="h-16 px-6 flex items-center justify-between shrink-0" style={{ background: "var(--bg-card)", borderTop: "var(--divider)" }}>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-9 px-4 text-xs font-bold hover:opacity-80" style={{ color: "var(--text-muted)" }}>
            <RotateCcw className="h-4 w-4 mr-1" /> Reset
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {!showFeedback && !instantFeedbackEnabled ? (
            <Button
              className="h-10 px-8 font-bold text-xs"
              disabled={selectedOption === null}
              onClick={() => setShowFeedback(true)}
            >
              Check Answer
            </Button>
          ) : (
            <Button
              className="h-10 px-8 font-bold text-xs"
              onClick={nextQuestion}
            >
              {currentIdx < mockQuestions.length - 1 ? "Next Question" : "Finish Practice"}
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
