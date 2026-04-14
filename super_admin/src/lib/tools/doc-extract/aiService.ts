import { GoogleGenerativeAI } from "@google/generative-ai";

export type AIProvider = 'gemini' | 'openrouter' | 'groq' | 'modal';

export interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string;
}

export interface AIResponse {
  text: string;
  error?: string;
}

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.status === 503 || error.status === 429)) {
      console.warn(`Retrying due to ${error.status}. Retries left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function generateAIContent(prompt: string, config: AIConfig): Promise<AIResponse> {
  // Always call Gemini from the frontend/next-api as per guidelines
  if (config.provider === 'gemini') {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API Key not found. Please check your environment variables.");
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: config.model || 'gemini-1.5-flash',
      });
      
      const result = await retryWithBackoff(() => model.generateContent(prompt));
      const response = await result.response;
      const text = response.text();
      
      return { text };
    } catch (error: any) {
      console.error("Gemini Service Error:", error);
      let msg = error.message || "Unknown Gemini error";
      return { text: "", error: msg };
    }
  }

  try {
    const response = await fetch('/api/tools/extract-logic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ai-generate', prompt, config })
    });

    if (!response.ok) {
      let errorMessage = `Server error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {}
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return { text: data.text };
  } catch (error: any) {
    console.error("AI Service Error:", error);
    return { text: "", error: error.message || "Unknown AI error" };
  }
}

export const AI_MODELS: Record<AIProvider, string[]> = {
  gemini: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'],
  openrouter: [
    'google/gemini-2.0-flash-001',
    'anthropic/claude-3.5-sonnet',
    'meta-llama/llama-3.1-405b-instruct',
    'openai/gpt-4o-mini'
  ],
  groq: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  modal: ['zai-org/GLM-5.1-FP8']
};
