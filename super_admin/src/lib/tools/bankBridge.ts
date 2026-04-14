import { api } from '../api';
import { toast } from 'sonner';

export interface BankQuestion {
  questionText: string;
  options?: { textEn: string; textHi: string; isCorrect: boolean; sortOrder: number }[];
  explanationEn: string;
  explanationHi?: string;
  type: 'MCQ' | 'Integer' | 'Multi-select' | 'True-False';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  subject?: string;
  chapter?: string;
  topic?: string;
}

/**
 * Sends a list of questions to the EduHub Question Bank.
 * Maps tool-specific types to the main bank schema.
 */
export async function sendQuestionsToBank(questions: BankQuestion[]) {
  try {
    const payload = {
      questions: questions.map(q => ({
        questionId: `Q-EXT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        textEn: q.questionText,
        textHi: q.questionText,
        explanationEn: q.explanation,
        explanationHi: q.explanation,
        difficulty: q.difficulty.toLowerCase(),
        type: q.type === 'MCQ' ? 'mcq_single' : 
              q.type === 'Multi-select' ? 'multi_select' :
              q.type === 'True-False' ? 'true_false' : 'integer',
        isApproved: false, // Ensure it goes to drafts
        options: q.options?.map((opt, idx) => ({
          textEn: opt.text,
          textHi: opt.text,
          isCorrect: opt.isCorrect,
          sortOrder: idx
        })) || []
      }))
    };

    const response = await api.post('/ai/save-draft', payload);
    
    if (response.data.success) {
      toast.success(`${questions.length} questions successfully saved to Question Bank Drafts!`);
      return true;
    }
    throw new Error(response.data.message || "Failed to save drafts");
  } catch (error: any) {
    console.error("Send to Bank Error:", error);
    toast.error(error.message || "Failed to send questions to bank.");
    return false;
  }
}
