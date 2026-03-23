"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";
import { PDFConfigPanel } from "@/components/set-system/PDFConfigPanel";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : '';
}

export default function ExportPage() {
  const params = useParams();
  const router = useRouter();
  const setId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSet = async () => {
      try {
        const token = getToken();
        setIsLoading(true);
        const res = await fetch(`${API_URL}/qbank/sets/${setId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const json = await res.json();
          setData(json.data?.set);
          setQuestions(json.data?.questions || []);
        } else {
          toast.error("Failed to fetch set details");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("An error occurred while fetching details");
      } finally {
        setIsLoading(false);
      }
    };
    if (setId) {
      fetchSet();
    }
  }, [setId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <TopBar />
        <div className="flex-1 flex justify-center items-center">
          <div className="flex flex-col items-center text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin mb-4" />
            <p>Loading Question Set data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
       <div className="min-h-screen bg-gray-50 flex flex-col">
          <TopBar />
          <div className="text-center p-12 text-gray-500">Set not found</div>
       </div>
    );
  }

  const enhancedQuestionSet = {
    id: data?.id,
    set_code: data?.code,
    name: data?.name,
    description: data?.description || "",
    subject: data?.subject,
    chapter: data?.chapter || "",
    questions: questions.map((q: any) => ({
      id: q.id,
      text: q.question_eng || q.question_hin || "",
      question_hin: q.question_hin,
      difficulty: q.difficulty || "medium",
      type: q.type || "mcq",
      options: q.type === 'mcq' ? [q.option1_eng, q.option2_eng, q.option3_eng, q.option4_eng].filter(Boolean) : undefined,
      options_hin: q.type === 'mcq' ? [q.option1_hin, q.option2_hin, q.option3_hin, q.option4_hin].filter(Boolean) : undefined,
      answer: q.answer || '1',
      explanation: q.solution_eng || 'No explanation available.',
      explanation_hin: q.solution_hin,
      marks: q.marks || 2,
    })),
  };

  return (
    <PDFConfigPanel 
      questionSet={enhancedQuestionSet}
      onBack={() => router.push(`/question-bank/sets/${setId}`)}
    />
  );
}
