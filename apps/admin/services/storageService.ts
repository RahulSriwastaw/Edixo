
import { createClient } from '@supabase/supabase-js';
import { Question, QuestionSet, ExamResult } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL as string, SUPABASE_KEY as string)
  : null as any;

export const storageService = {
  // --- Questions ---
  // --- Questions ---
  getQuestions: async (): Promise<Question[]> => {
    // 1. Fetch Legacy Questions
    const legacyDetails = supabase
      .from('questions')
      .select('*')
      .order('createdDate', { ascending: false });

    // 2. Fetch New Master Questions
    const masterDetails = supabase
      .from('questions_master')
      .select('*')
      .order('created_at', { ascending: false });

    const [legacyRes, masterRes] = await Promise.all([legacyDetails, masterDetails]);

    if (legacyRes.error) console.error('Error fetching legacy questions:', legacyRes.error);
    if (masterRes.error) console.error('Error fetching master questions:', masterRes.error);

    const legacyQuestions: Question[] = legacyRes.data || [];

    // Map new schema to old Question interface
    const newQuestions: Question[] = (masterRes.data || []).map((row: any) => ({
      id: String(row.question_id), // Ensure string ID
      question_unique_id: String(row.question_id),
      question_hin: row.language_type === 'English' ? '' : row.question_text,
      question_eng: row.language_type === 'Hindi' ? '' : row.question_text,
      subject: row.subject_name || 'General',
      chapter: row.topic_name || 'General',

      option1_hin: row.option_a || '',
      option1_eng: row.option_a || '',
      option2_hin: row.option_b || '',
      option2_eng: row.option_b || '',
      option3_hin: row.option_c || '',
      option3_eng: row.option_c || '',
      option4_hin: row.option_d || '',
      option4_eng: row.option_d || '',

      answer: row.correct_answer,
      solution_hin: row.answer_explanation || '',
      solution_eng: row.answer_explanation || '',

      type: 'MCQ',
      difficulty: row.difficulty_level || 'Medium',
      language: row.language_type || 'Bilingual',
      tags: [],
      createdDate: row.created_at,
      exam: row.question_source
    }));

    // Combine both lists
    return [...legacyQuestions, ...newQuestions];
  },

  saveQuestion: async (question: Question): Promise<void> => {
    // Only include fields that exist in the Supabase 'questions' table schema
    // Filter out extra frontend-only fields that don't have database columns
    const allowedFields = {
      id: question.id,
      question_unique_id: question.question_unique_id,
      question_hin: question.question_hin,
      question_eng: question.question_eng,
      subject: question.subject,
      chapter: question.chapter,
      option1_hin: question.option1_hin,
      option1_eng: question.option1_eng,
      option2_hin: question.option2_hin,
      option2_eng: question.option2_eng,
      option3_hin: question.option3_hin,
      option3_eng: question.option3_eng,
      option4_hin: question.option4_hin,
      option4_eng: question.option4_eng,
      option5_hin: question.option5_hin,
      option5_eng: question.option5_eng,
      answer: question.answer,
      solution_hin: question.solution_hin,
      solution_eng: question.solution_eng,
      type: question.type,
      difficulty: question.difficulty,
      language: question.language,
      tags: question.tags,
      createdDate: question.createdDate,
      exam: question.exam,
      year: question.year,
      date: question.date,
      flagged: question.flagged
    };

    const { error } = await supabase
      .from('questions')
      .upsert(allowedFields);

    if (error) {
      console.error('Error saving question:', error);
      throw error;
    }
  },

  saveQuestionsBulk: async (newQuestions: Question[]): Promise<void> => {
    // Filter each question to only include allowed database fields
    // Also remove null/undefined values to prevent database errors
    const filteredQuestions = newQuestions.map(q => {
      const cleaned: Record<string, any> = {
        id: q.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        question_unique_id: q.question_unique_id || q.id,
        question_hin: q.question_hin || '',
        question_eng: q.question_eng || '',
        subject: q.subject || 'General',
        chapter: q.chapter || '',
        option1_hin: q.option1_hin || '',
        option1_eng: q.option1_eng || '',
        option2_hin: q.option2_hin || '',
        option2_eng: q.option2_eng || '',
        option3_hin: q.option3_hin || '',
        option3_eng: q.option3_eng || '',
        option4_hin: q.option4_hin || '',
        option4_eng: q.option4_eng || '',
        answer: q.answer || '1',
        solution_hin: q.solution_hin || '',
        solution_eng: q.solution_eng || '',
        type: q.type || 'MCQ',
        difficulty: q.difficulty || 'Medium',
        language: q.language || 'Bilingual',
        tags: Array.isArray(q.tags) ? q.tags : [],
        createdDate: q.createdDate || new Date().toISOString()
      };

      // Only add optional fields if they have valid non-null values
      if (q.option5_hin) cleaned.option5_hin = q.option5_hin;
      if (q.option5_eng) cleaned.option5_eng = q.option5_eng;
      if (q.exam) cleaned.exam = q.exam;
      if (q.year) cleaned.year = q.year;
      if (q.date) cleaned.date = q.date;
      if (typeof q.flagged === 'boolean') cleaned.flagged = q.flagged;

      return cleaned;
    });

    console.log('Saving questions:', filteredQuestions.length, filteredQuestions[0]);

    const { error } = await supabase
      .from('questions')
      .insert(filteredQuestions);

    if (error) {
      console.error('Error bulk saving questions:', error);
      throw error;
    }
  },

  updateQuestionsBulk: async (ids: string[], updates: Partial<Question>): Promise<void> => {
    const { error } = await supabase
      .from('questions')
      .update(updates)
      .in('id', ids);

    if (error) {
      console.error('Error bulk updating questions:', error);
      throw error;
    }
  },

  deleteQuestion: async (id: string): Promise<void> => {
    // Try deleting from legacy 'questions' table
    const { error: legacyError } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (legacyError) {
      console.error('Error deleting from questions:', legacyError);
    }

    // Also try deleting from 'questions_master' table (id might be numeric question_id)
    const numericId = parseInt(id, 10);
    if (!isNaN(numericId)) {
      const { error: masterError } = await supabase
        .from('questions_master')
        .delete()
        .eq('question_id', numericId);

      if (masterError) {
        console.error('Error deleting from questions_master:', masterError);
      }
    }

    // If legacy failed and no numeric id, throw error
    if (legacyError && isNaN(numericId)) {
      throw legacyError;
    }
  },

  deleteQuestionsBulk: async (ids: string[]): Promise<void> => {
    // Delete from both tables since getQuestions fetches from both
    // First try deleting from legacy 'questions' table
    const { error: legacyError } = await supabase
      .from('questions')
      .delete()
      .in('id', ids);

    if (legacyError) {
      console.error('Error bulk deleting from questions:', legacyError);
    }

    // Also try deleting from 'questions_master' table (ids might be numeric question_id)
    // Convert string ids to numbers for questions_master
    const numericIds = ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    if (numericIds.length > 0) {
      const { error: masterError } = await supabase
        .from('questions_master')
        .delete()
        .in('question_id', numericIds);

      if (masterError) {
        console.error('Error bulk deleting from questions_master:', masterError);
      }
    }

    // If both failed, throw an error
    if (legacyError && (!numericIds.length)) {
      throw legacyError;
    }
  },

  // --- Sets ---
  getSets: async (): Promise<QuestionSet[]> => {
    const { data, error } = await supabase
      .from('sets')
      .select('*')
      .order('createdDate', { ascending: false });

    if (error) {
      console.error('Error fetching sets:', error);
      return [];
    }
    return data || [];
  },

  getSetById: async (setId: string): Promise<QuestionSet | undefined> => {
    const { data, error } = await supabase
      .from('sets')
      .select('*')
      .eq('setId', setId)
      .single();

    if (error) {
      console.error('Error fetching set by ID:', error);
      return undefined;
    }
    return data;
  },

  saveSet: async (set: QuestionSet): Promise<void> => {
    const { error } = await supabase
      .from('sets')
      .upsert(set, { onConflict: 'setId' });

    if (error) {
      console.error('Error saving set:', error);
      throw error;
    }
  },

  deleteSet: async (setId: string): Promise<void> => {
    const { error } = await supabase
      .from('sets')
      .delete()
      .eq('setId', setId);

    if (error) {
      console.error('Error deleting set:', error);
      throw error;
    }
  },

  uploadClassNotePDF: async (blob: Blob, fileName: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from('class-notes')
      .upload(`${fileName}`, blob, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading PDF:', error);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from('class-notes')
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  },

  saveResult: async (result: ExamResult): Promise<void> => {
    const { error } = await supabase
      .from('results')
      .upsert(result);

    if (error) {
      console.error('Error saving result:', error);
      // Don't throw, just log. We don't want to crash the UI if stats fail.
    }
  }
};
