import { Question, QuestionSet, ExamResult } from '../types';
import { api } from '../../lib/api';

export const storageService = {
  // --- Packs ---
  getPacks: async (): Promise<any[]> => {
    try {
      const res = await api.get('/user-qbank/my-packs');
      return res.data.packs || [];
    } catch (err) {
      console.error('Error fetching packs:', err);
      return [];
    }
  },

  // --- Questions ---
  getQuestions: async (packId?: string): Promise<Question[]> => {
    try {
      const endpoint = packId ? `/user-qbank/my-packs/${packId}/questions` : '/user-qbank/my-packs'; // Fallback
      const res = await api.get(endpoint);
      if (!res.success) return [];

      const questions = packId ? res.data.questions : res.data.packs; // API structure varies

      return (questions || []).map((q: any) => ({
        id: q.id,
        question_unique_id: q.id,
        question_hin: q.textHi || '',
        question_eng: q.textEn || '',
        subject: q.subjectName || q.subject || 'General',
        chapter: q.chapter || '',
        // Handle both flat options and options array
        ...(q.options ? {
          option1_eng: q.options[0]?.textEn || '',
          option1_hin: q.options[0]?.textHi || '',
          option2_eng: q.options[1]?.textEn || '',
          option2_hin: q.options[1]?.textHi || '',
          option3_eng: q.options[2]?.textEn || '',
          option3_hin: q.options[2]?.textHi || '',
          option4_eng: q.options[3]?.textEn || '',
          option4_hin: q.options[3]?.textHi || '',
          answer: String(q.options.findIndex((o: any) => o.isCorrect) + 1),
        } : q.optionsJson ? {
          option1_eng: q.optionsJson[0]?.textEn || '',
          option1_hin: q.optionsJson[0]?.textHi || '',
          option2_eng: q.optionsJson[1]?.textEn || '',
          option2_hin: q.optionsJson[1]?.textHi || '',
          option3_eng: q.optionsJson[2]?.textEn || '',
          option3_hin: q.optionsJson[2]?.textHi || '',
          option4_eng: q.optionsJson[3]?.textEn || '',
          option4_hin: q.optionsJson[3]?.textHi || '',
          answer: String(q.optionsJson.findIndex((o: any) => o.isCorrect) + 1),
        } : {}),
        solution_hin: q.explanationHi || '',
        solution_eng: q.explanationEn || q.explanation || '',
        type: q.type || 'MCQ',
        difficulty: q.difficulty ? (q.difficulty.charAt(0) + q.difficulty.slice(1).toLowerCase()) : 'Medium',
        language: q.textHi && q.textEn ? 'Bilingual' : q.textHi ? 'Hindi' : 'English',
        tags: q.tags || [],
        createdDate: q.createdAt,
      }));
    } catch (err) {
      console.error('Error fetching questions:', err);
      return [];
    }
  },

  saveQuestion: async (question: Question, packId: string): Promise<void> => {
    const payload = {
      textEn: question.question_eng,
      textHi: question.question_hin,
      explanation: question.solution_eng,
      type: question.type || 'MCQ',
      difficulty: question.difficulty.toUpperCase(),
      subject: question.subject,
      optionsJson: [
        { label: 'A', textEn: question.option1_eng, textHi: question.option1_hin, isCorrect: question.answer === '1' },
        { label: 'B', textEn: question.option2_eng, textHi: question.option2_hin, isCorrect: question.answer === '2' },
        { label: 'C', textEn: question.option3_eng, textHi: question.option3_hin, isCorrect: question.answer === '3' },
        { label: 'D', textEn: question.option4_eng, textHi: question.option4_hin, isCorrect: question.answer === '4' },
      ]
    };

    if (question.id && !question.id.startsWith('q_') && !question.id.startsWith('uq-')) {
      await api.patch(`/user-qbank/my-packs/${packId}/questions/${question.id}`, payload);
    } else {
      await api.post(`/user-qbank/my-packs/${packId}/questions`, payload);
    }
  },

  saveQuestionsBulk: async (newQuestions: Question[], packId: string): Promise<void> => {
    // Sequentially save to the user pack
    for (const q of newQuestions) {
      await storageService.saveQuestion(q, packId);
    }
  },

  updateQuestionsBulk: async (ids: string[], updates: Partial<Question>, packId: string): Promise<void> => {
    for (const id of ids) {
      await api.patch(`/user-qbank/my-packs/${packId}/questions/${id}`, updates);
    }
  },

  deleteQuestion: async (id: string, packId: string): Promise<void> => {
    await api.delete(`/user-qbank/my-packs/${packId}/questions/${id}`);
  },

  deleteQuestionsBulk: async (ids: string[], packId: string): Promise<void> => {
    for (const id of ids) {
      await storageService.deleteQuestion(id, packId);
    }
  },

  // --- Sets (Mapped to Packs for User Qbank) ---
  getSets: async (): Promise<any[]> => {
    return storageService.getPacks();
  },

  saveSet: async (set: any): Promise<void> => {
    const payload = {
      name: set.name,
      description: set.description,
      subject: set.subject,
      isPublic: false
    };
    if (set.id || set.setId) {
      const id = set.id || set.setId;
      await api.patch(`/user-qbank/my-packs/${id}`, payload);
    } else {
      await api.post('/user-qbank/my-packs', payload);
    }
  },

  deleteSet: async (setId: string): Promise<void> => {
    await api.delete(`/user-qbank/my-packs/${setId}`);
  },

  uploadClassNotePDF: async (blob: Blob, fileName: string): Promise<string | null> => {
    try {
      const res = await api.upload('/upload/pdf', blob);
      return res.data.url;
    } catch (err) {
      console.error('Error uploading PDF:', err);
      return null;
    }
  },

  saveResult: async (result: ExamResult): Promise<void> => {
    try {
      await api.post('/user-qbank/results', result); // Placeholder if exists
    } catch (err) {
      console.error('Error saving result:', err);
    }
  }
};

