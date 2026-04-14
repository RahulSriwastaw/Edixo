import { NumberingStyle, ExtractedElement } from "./types";
import { performOCR } from './ocrService';
import axios from 'axios';

// Get the backend URL or fallback to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const extractLayoutFromImage = async (
  base64Image: string, 
  numberingStyle: NumberingStyle = NumberingStyle.HASH,
  includeImages: boolean = true,
  isBilingual: boolean = false,
  mcqMode: boolean = true,
  retryCount = 0,
  modelId: string = 'smart'
): Promise<ExtractedElement[]> => {
  const MAX_RETRIES = 3; 

  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

  let ocrText = '';
  try {
    ocrText = await performOCR(base64Image);
  } catch (e) {
    console.warn("OCR failed, proceeding without OCR context", e);
  }

  let numberingInstruction = '';
  switch (numberingStyle) {
    case NumberingStyle.Q_DOT: numberingInstruction = 'Replace the question number at the start of a question with "Q" followed by the number and a dot.'; break;
    case NumberingStyle.HASH: numberingInstruction = 'Replace the question number at the start of a question with "#" followed by the number and a dot.'; break;
    case NumberingStyle.QUESTION_DOT: numberingInstruction = 'Replace the question number at the start of a question with the word "Question" followed by the number and a dot.'; break;
    case NumberingStyle.NUMBER_DOT: numberingInstruction = 'Ensure the question number is formatted as the number followed by a dot.'; break;
    default: numberingInstruction = 'Replace the question number at the start of a question with the number followed by a dot.';
  }

  const bilingualInstruction = isBilingual
    ? `- **BILINGUAL OUTPUT**: If a question is in a single language, provide its translation in the other major language present in the document. Present both versions clearly.`
    : `- **STRICTLY NO TRANSLATION**: Do not translate Hindi to English or vice versa.`;

  const imageInstruction = includeImages 
    ? `2. **Diagrams & Figures**:\n   - **PLACEMENT**: Identify diagrams and place them in the 'elements' array exactly where they appear in the reading order.\n   - **DESCRIPTION**: For 'image' types, provide a concise but descriptive 'content' field explaining what the diagram shows.`
    : `2. **Diagrams & Figures**:\n   - **DO NOT EXTRACT DIAGRAMS OR IMAGES**: Ignore all non-textual content such as diagrams, charts, and figures.`;

  const imageFormattingInstruction = includeImages
    ? `2. **Image Elements**:\n   - Identify regions containing diagrams, pattern series, or non-textual content.\n   - Provide the bounding box (bbox) for these regions in normalized coordinates [0-1000].`
    : `2. **Image Elements**:\n   - **STRICTLY IGNORE**: Do not extract any image elements.`;

  const mcqInstruction = mcqMode 
    ? `**MCQ EXTRACTION MODE**:\n- Ensure every question is followed by its options.\n- If options are in a grid, extract them in order.\n- Maintain the relationship between questions and their options.`
    : `**GENERAL DOCUMENT MODE**:\n- Extract text as it appears. Maintain paragraphs and structure.`;

  const systemPrompt = `You are a professional Exam Paper Digitizer. Analyze the provided image and extract all elements in their correct reading order. Return the data as a JSON object with an 'elements' array. Each element should have 'type' ('text', 'image', 'table') and 'content'. For 'image' and 'table', 'bbox' {ymin, xmin, ymax, xmax} is mandatory.`;

  const userPrompt = `${mcqInstruction}
**CRITICAL RULE**: Extract the ENTIRE page from top to bottom. Do NOT skip any content.
**OCR CONTEXT**: "${ocrText}"
**LANGUAGE PRESERVATION**: Extract text exactly in the script it is written. ${bilingualInstruction} No Transliteration.
1. **Questions & Options**: Extract ALL options. Keep question and options together. ${imageInstruction}
**FORMATTING**:
- ${numberingInstruction}
- Use LaTeX inside $$ ... $$ for math. Escape backslashes (\\\\frac).
- Remove stray noise but never remove valid questions or numbers.
${imageFormattingInstruction}`;

  try {
    const response = await axios.post(`${API_URL}/ai/tool-process`, {
        modelId,
        systemPrompt,
        userPrompt,
        imageBase64: cleanBase64,
        mimeType: 'image/png'
    });

    let rawText = response.data.text || '{"elements": []}';
    rawText = rawText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
    
    let result;
    try {
      result = JSON.parse(rawText);
    } catch (parseError) {
      console.warn("Initial JSON parse failed, attempting to fix...", parseError);
      let fixedText = rawText.replace(/\\u(?![0-9a-fA-F]{4})/g, '\\\\u').replace(/\\([^"\\/bfnrtu])/g, '\\\\$1');
      try {
        result = JSON.parse(fixedText);
      } catch (e2) {
        throw new Error("Failed to parse AI response due to complex formatting.");
      }
    }

    const elements = result?.elements || [];
    return elements.map((el: any, index: number) => ({
      ...el,
      id: `el-${index}-${Math.random().toString(36).substr(2, 5)}`
    }));

  } catch (error: any) {
    if (retryCount < MAX_RETRIES && (error.response?.status === 429 || error.response?.status === 503)) {
      const waitTime = Math.pow(2, retryCount) * 5000; 
      await delay(waitTime);
      return extractLayoutFromImage(base64Image, numberingStyle, includeImages, isBilingual, mcqMode, retryCount + 1, modelId);
    }
    throw error;
  }
};

export const extractTextFromImage = async (base64Image: string, numberingStyle: NumberingStyle = NumberingStyle.HASH): Promise<string> => {
  const elements = await extractLayoutFromImage(base64Image, numberingStyle);
  return elements.map(el => el.type === 'text' || el.type === 'table' ? (el.content || '') : `[Image: ${el.content || ''}]`).join('\n\n');
};

export const proofreadMcqs = async (rawText: string, modelId: string = 'smart'): Promise<any[]> => {
  const systemPrompt = `You are an expert Exam Paper Editor. Identify and extract all Multiple Choice Questions (MCQs) from the text. Return a JSON object with a 'questions' array. Each item: { questionText: string, options: [{label: string, text: string}] }`;
  const userPrompt = `RAW TEXT:\n"${rawText}"`;

  try {
    const response = await axios.post(`${API_URL}/ai/tool-process`, {
        modelId,
        systemPrompt,
        userPrompt
    });

    let text = response.data.text || '{"questions": []}';
    text = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
    const data = JSON.parse(text);
    return data.questions || [];
  } catch (error) {
    console.error("Proofreading failed:", error);
    return [];
  }
};
