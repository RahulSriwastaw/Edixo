import { Question } from '../types';
import { supabase } from './supabaseClient';

interface QuestionSetResponse {
    success: boolean;
    setId: string;
    setName: string;
    questions: Question[];
}

/**
 * API Service for fetching question sets from Admin Panel
 * 
 * TODO: Replace with actual API endpoint from your backend
 */
class QuestionService {
    private baseUrl: string;

    constructor() {
        // TODO: Configure API URL from environment
        // For now, use hardcoded localhost - replace when backend is ready
        this.baseUrl = 'http://localhost:4000';
    }

    /**
     * Fetch questions by set ID from admin panel
     * @param setId - The unique identifier for the question set
     * @param password - Optional password for protected sets
     * @returns Promise with question data
     */
    async getQuestionsBySetId(setId: string, password?: string): Promise<Question[]> {
        // If Supabase is configured, use it directly
        if (supabase) {
            try {
                // 1. Fetch the Set
                const { data: set, error: setError } = await supabase
                    .from('sets')
                    .select('*')
                    .eq('setId', setId)
                    .single();

                if (setError || !set) {
                     // If not found in DB, try mock for fallback/demo purposes
                     console.log('Set not found in Supabase, checking mocks...');
                     try {
                        return await this.getMockQuestions(setId);
                     } catch {
                        throw new Error('Question set not found. Please check the Set ID.');
                     }
                }

                // 2. Verify Password
                // If the set has a password, check if it matches
                if (set.password && set.password !== password) {
                    throw new Error('Invalid password. This set is protected.');
                }

                // 3. Fetch Questions
                if (!set.questionIds || !Array.isArray(set.questionIds) || set.questionIds.length === 0) {
                    return [];
                }

                // Fetch from questions table
                const { data: questions, error: questionsError } = await supabase
                    .from('questions')
                    .select('*')
                    .in('id', set.questionIds);

                if (questionsError) {
                    console.error('Error fetching questions:', questionsError);
                    throw new Error('Failed to fetch questions details');
                }
                
                // Map to local Question type
                return (questions || []).map((q: any) => ({
                    id: q.id,
                    question_eng: q.question_eng || '',
                    question_hin: q.question_hin || '',
                    option1_eng: q.option1_eng || '',
                    option1_hin: q.option1_hin || '',
                    option2_eng: q.option2_eng || '',
                    option2_hin: q.option2_hin || '',
                    option3_eng: q.option3_eng || '',
                    option3_hin: q.option3_hin || '',
                    option4_eng: q.option4_eng || '',
                    option4_hin: q.option4_hin || '',
                    answer: q.answer,
                    solution_eng: q.solution_eng || '',
                    solution_hin: q.solution_hin || ''
                }));

            } catch (error) {
                if (error instanceof Error) throw error;
                throw new Error('An unexpected error occurred');
            }
        }

        return this.getMockQuestions(setId);
    }

    /**
     * Mock function for development/testing
     * Remove this once backend API is ready
     */
    async getMockQuestions(setId: string): Promise<Question[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data based on set ID
        const mockSets: Record<string, Question[]> = {
            'DEMO-001': [
                {
                    id: 'q1',
                    question_eng: 'What is the derivative of x²?',
                    question_hin: 'x² का अवकलज क्या है?',
                    option1_eng: 'x',
                    option1_hin: 'x',
                    option2_eng: '2x',
                    option2_hin: '2x',
                    option3_eng: 'x³',
                    option3_hin: 'x³',
                    option4_eng: '2x²',
                    option4_hin: '2x²',
                    answer: '2',
                    solution_eng: '<p>Using power rule: d/dx(x²) = 2x</p>',
                    solution_hin: '<p>घात नियम का उपयोग करते हुए: d/dx(x²) = 2x</p>'
                },
                {
                    id: 'q2',
                    question_eng: 'Solve: 2x + 5 = 15',
                    question_hin: 'हल करें: 2x + 5 = 15',
                    option1_eng: '5',
                    option1_hin: '5',
                    option2_eng: '10',
                    option2_hin: '10',
                    option3_eng: '7',
                    option3_hin: '7',
                    option4_eng: '20',
                    option4_hin: '20',
                    answer: '1',
                    solution_eng: '<p>2x + 5 = 15<br>2x = 10<br>x = 5</p>',
                    solution_hin: '<p>2x + 5 = 15<br>2x = 10<br>x = 5</p>'
                }
            ],
            'PHYSICS-101': [
                {
                    id: 'p1',
                    question_eng: 'What is Newton\'s First Law of Motion?',
                    question_hin: 'न्यूटन का गति का प्रथम नियम क्या है?',
                    option1_eng: 'F = ma',
                    option1_hin: 'F = ma',
                    option2_eng: 'An object at rest stays at rest',
                    option2_hin: 'विराम में स्थित वस्तु विराम में रहती है',
                    option3_eng: 'Action = Reaction',
                    option3_hin: 'क्रिया = प्रतिक्रिया',
                    option4_eng: 'E = mc²',
                    option4_hin: 'E = mc²',
                    answer: '2',
                    solution_eng: '<p>Newton\'s First Law states that an object at rest will stay at rest, and an object in motion will stay in motion unless acted upon by an external force.</p>',
                    solution_hin: '<p>न्यूटन का प्रथम नियम कहता है कि विराम में स्थित वस्तु विराम में रहेगी, और गति में वस्तु गति में रहेगी जब तक कि बाहरी बल द्वारा कार्य न किया जाए।</p>'
                }
            ]
        };

        const questions = mockSets[setId.toUpperCase()];

        if (!questions) {
            throw new Error(`No mock data for set ID: ${setId}. Try DEMO-001 or PHYSICS-101`);
        }

        return questions;
    }
}

export const questionService = new QuestionService();
