"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { apiFetch, isAuthenticated } from "@/lib/api";
import { Loader2, AlertTriangle } from "lucide-react";
import { ExamThemeProvider } from "@/contexts/ExamThemeContext";
import { useExamThemeByExamId } from "@/hooks/useExamTheme";
import { TestInterface } from "@/components/TestInterface/TestInterface";

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

function SolutionViewer({ reviewData }: { reviewData: ReviewData }) {
    const router = useRouter();
    const { theme, loading } = useExamThemeByExamId(reviewData.testId);

    if (loading) {
        return (
          <div className="flex flex-col h-screen items-center justify-center bg-[var(--bg-body)]">
            <Loader2 className="h-8 w-8 animate-spin mb-3 text-[#FF6B2B]" />
            <p className="text-[12px] font-medium text-[var(--text-muted)]">Loading theme...</p>
          </div>
        );
    }

    // Format questions for TestInterface
    const formattedQuestions = reviewData.questions.map(q => {
        const textEn = q.textEn || (q as any).text_en || "";
        const textHi = q.textHi || (q as any).text_hi || "";
        return {
            ...q,
            textEn,
            textHi,
            explanationEn: q.explanationEn || (q as any).explanation_en || "",
            explanationHi: q.explanationHi || (q as any).explanation_hi || "",
            imageUrl: q.imageUrl || (q as any).image_url || null,
            text: textEn, // primary fallback
            options: q.options.map(o => {
                const oEn = o.textEn || (o as any).text_en || "";
                const oHi = o.textHi || (o as any).text_hi || "";
                return { ...o, textEn: oEn, textHi: oHi, text: oEn };
            }),
        };
    });

    return (
        <ExamThemeProvider theme={theme}>
            <TestInterface
                isReviewMode={true}
                test={{
                    id: reviewData.testId,
                    name: reviewData.testName,
                    durationMins: 0,
                    questions: formattedQuestions
                }}
                onSubmit={() => router.back()}
            />
        </ExamThemeProvider>
    );
}

export default function SolutionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const testId = String(params?.id || "");
  const slug = String(params?.slug || "");
  const attemptNo = searchParams.get('attemptNo');

  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/login?redirect=/${slug}/tests/${testId}/solutions${attemptNo ? `?attemptNo=${attemptNo}` : ''}`);
      return;
    }
    
    if (!testId) return;

    const fetchSolution = async () => {
        try {
            setLoading(true);
            
            // 1. Get my attempts for this test
            const myAttRes = await apiFetch(`/mockbook/tests/${testId}/my-attempts`);
            const attempts = myAttRes.data || [];
            
            if (attempts.length === 0) {
                setError("No attempts found for this test.");
                setLoading(false);
                return;
            }

            // 2. Determine which attempt to show
            let targetAttempt = attempts[attempts.length - 1];
            if (attemptNo) {
                const num = parseInt(attemptNo);
                if (!isNaN(num) && num > 0 && num <= attempts.length) {
                    targetAttempt = attempts[num - 1];
                }
            }

            // 3. Fetch review data for that attempt
            const res = await apiFetch(`/mockbook/attempts/${targetAttempt.id}/review`);
            setReviewData(res.data);
            setLoading(false);
        } catch (err: any) {
            setError(err.message || "Failed to load solutions");
            setLoading(false);
        }
    };

    fetchSolution();
  }, [testId, attemptNo, router, slug]);

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
        <button onClick={() => router.back()} className="px-5 py-2 text-[12px] font-bold rounded-lg text-white bg-[#FF6B2B]">
          Go Back
        </button>
      </div>
    );
  }

  return <SolutionViewer reviewData={reviewData} />;
}
