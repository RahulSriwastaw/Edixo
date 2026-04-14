import mammoth from 'mammoth';
import axios from 'axios';
import { Question } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/**
 * Extracts raw text from a DOCX file using mammoth.
 */
export const extractTextFromDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
};

/**
 * Extracts raw text from a PDF file using pdfjs-dist.
 */
export const extractTextFromPdf = async (file: File): Promise<string> => {
    const pdfjsLib = await import('pdfjs-dist');
    if (typeof window !== 'undefined' && 'Worker' in window) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
    }
    
    return fullText;
};

/**
 * Calls the Backend AI Router to convert raw text into structured MCQs.
 */
export const extractMcqsFromText = async (text: string, modelId: string = 'smart'): Promise<Question[]> => {
    const systemPrompt = `You are an expert Educational Content Digitizer. 
Identify Multiple Choice Questions (MCQs) from the provided text.
Return a JSON object with a 'questions' array.

Each question object strictly follows this format:
{
  "id": "Q1",
  "text": "The text of the question",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctOption": "A",
  "difficulty": "Medium"
}

- Extract text exactly as written.
- Identify the correct option based on visual markers like bold text, (Correct), or [Ans]. If not clear, default to "A".
- Convert any math to LaTeX using $$ ... $$ markers.
- If a question is not an MCQ, ignore it.`;

    const userPrompt = `TEXT TO PROCESS:\n\n${text}`;

    try {
        const response = await axios.post(`${API_URL}/ai/tool-process`, {
            modelId,
            systemPrompt,
            userPrompt
        });

        let rawText = response.data.text || '{"questions": []}';
        // Clean markdown code blocks if any
        rawText = rawText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
        
        const data = JSON.parse(rawText);
        return (data.questions || []).map((q: any, idx: number) => ({
            ...q,
            id: q.id || `Q${idx + 1}`,
            status: 'Draft'
        }));
    } catch (error) {
        console.error("AI Extraction failed:", error);
        throw new Error("Failed to extract MCQs using AI. Check your internet or API limits.");
    }
};
