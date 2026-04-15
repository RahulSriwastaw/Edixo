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
 * @param questions - Array of questions to save
 * @param folderId - Optional folder ID to organize questions in the bank
 * @param folderName - Optional folder name for display message
 */
export async function sendQuestionsToBank(
  questions: BankQuestion[],
  folderId?: string,
  folderName?: string
) {
  try {
    const payload = {
      questions: questions.map(q => ({
        textEn: q.questionText,
        textHi: q.questionText,
        explanationEn: q.explanationEn || '',
        difficulty: q.difficulty.toLowerCase(),
        options: q.options?.map((opt, idx) => ({
          textEn: opt.textEn,
          textHi: opt.textHi || opt.textEn,
          isCorrect: opt.isCorrect,
          sortOrder: idx
        })) || [],
        ...(folderId && { folderId })
      })),
      ...(folderId && { folderId })
    };

    const response = await api.post('/ai/save-draft', payload);
    
    if (response.data.success) {
      const folderMsg = folderName ? ` in folder "${folderName}"` : ' to Question Bank Drafts';
      toast.success(`✓ ${questions.length} questions successfully saved${folderMsg}!`);
      return true;
    }
    throw new Error(response.data.message || "Failed to save drafts");
  } catch (error: any) {
    console.error("Send to Bank Error:", error);
    toast.error(error.message || "Failed to send questions to bank.");
    return false;
  }
}
