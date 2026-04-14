import axios from 'axios';
import { logger } from '../../config/logger';
import { AI_MODELS, AI_ENDPOINTS } from './ai.config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIService {
    private static CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
    private static MODEL = 'claude-sonnet-4-5';

    // Existing Canvas method
    static async getCanvasQueryResponse(params: {
        query: string;
        context?: string;
        imageBase64?: string;
        language?: string;
        gradeLevel?: number;
    }) {
        const apiKey = process.env.CLAUDE_API_KEY || '';

        if (!apiKey) {
            logger.warn('AI Service: CLAUDE_API_KEY missing — returning mock response.');
            return this.getMockResponse(params.query);
        }

        try {
            const systemPrompt = `You are EduHub AI — an expert teaching assistant embedded in a digital whiteboard.
Your audience: teachers and students preparing for JEE, NEET, UPSC, SSC, and GATE.

CANVAS CONTEXT: ${params.context || 'No text context available.'}
STUDENT LEVEL: Grade ${params.gradeLevel || 10}
PREFERRED LANGUAGE: ${params.language || 'English'}

RESPONSE RULES:
1. Be precise, structured, and educational.
2. Use LaTeX for ALL math/science formulas: $E=mc^2$, $\\int_a^b f(x)dx$.
3. For problems: solve step-by-step with clear headings.
4. For concepts: give definition → intuition → example.
5. Hindi mode: use Hinglish (simple Hindi + English terms) like Indian coaching teachers.
6. Keep responses focused — no fluff.
7. If image is provided, analyze the canvas content deeply.`;

            const messageContent: any[] = [];
            if (params.imageBase64) {
                messageContent.push({
                    type: 'image',
                    source: { type: 'base64', media_type: 'image/png', data: params.imageBase64 },
                });
            }
            messageContent.push({ type: 'text', text: params.query });

            const response = await axios.post(
                this.CLAUDE_API_URL,
                {
                    model: this.MODEL,
                    max_tokens: 1500,
                    system: systemPrompt,
                    messages: [{ role: 'user', content: messageContent }],
                },
                {
                    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
                    timeout: 30000,
                }
            );

            return response.data.content[0].text as string;
        } catch (error: any) {
            logger.error('Claude API Error:', error.response?.data || error.message);
            throw new Error('AI Assistant is temporarily unavailable. Please try again.');
        }
    }

    private static getMockResponse(query: string): string {
        const q = query.toLowerCase();
        if (q.includes('newton')) {
            return "**Newton's Second Law:**\n\nForce is the rate of change of momentum:\n$$F = ma$$\n\nWhere:\n- $F$ = Net force (Newtons)\n- $m$ = Mass (kg)\n- $a$ = Acceleration (m/s²)\n\n*Mock response — add CLAUDE_API_KEY to .env*";
        }
        return "**EduHub AI Teaching Assistant**\n\n*Mock mode — add CLAUDE_API_KEY to .env to enable full AI.*";
    }

    // --- AI Settings & Smart Selection ---
    private static settingsCache: { data: any; timestamp: number } | null = null;
    private static CACHE_TTL = 30000; // 30 seconds

    private static async getSettings() {
        if (this.settingsCache && (Date.now() - this.settingsCache.timestamp) < this.CACHE_TTL) {
            return this.settingsCache.data;
        }

        const settings = await prisma.ai_settings.findUnique({ where: { id: 'singleton' } });
        const data = settings || {
            defaultTextModel: 'OPENROUTER_GEMMA_4_26B',
            defaultImageModel: 'GEMINI_2_0_FLASH',
            apiKeyGemini: process.env.GEMINI_API_KEY,
            apiKeyOpenRouter: process.env.OPENROUTER_API_KEY,
            apiKeyModal: process.env.MODAL_API_KEY,
            apiKeyClaude: process.env.CLAUDE_API_KEY
        };

        this.settingsCache = { data, timestamp: Date.now() };
        return data;
    }

    // --- New Tooling Logic (PDF to Word / MCQ Extractor) ---
    static async processToolRequest(params: {
        modelId?: string; // 'smart', 'openrouter', 'modal', or specific model key
        systemPrompt: string;
        userPrompt: string;
        imageBase64?: string;
        mimeType?: string; // e.g. 'image/png'
    }) {
        const settings = await this.getSettings();
        let modelConfig: { provider: string; id: string } = (AI_MODELS as any)[settings.defaultImageModel] || AI_MODELS.GEMINI_2_0_FLASH;

        // Evaluate manual override or smart selection
        if (params.modelId && params.modelId !== 'smart') {
            // Find in AI_MODELS
            const directModel = Object.values(AI_MODELS).find(m => m.id === params.modelId);
            if (directModel) {
                modelConfig = directModel;
            } else if (params.modelId === 'openrouter') {
                modelConfig = (AI_MODELS as any)[settings.defaultTextModel] || AI_MODELS.OPENROUTER_GEMMA_4_26B;
            } else if (params.modelId === 'modal') {
                modelConfig = AI_MODELS.MODAL_GLM_5_1;
            } else if (params.modelId === 'gemini-1.5-pro') {
                modelConfig = AI_MODELS.GEMINI_1_5_PRO;
            }
        } else {
             // Smart Selection from Global Settings
             if (params.imageBase64) {
                  modelConfig = (AI_MODELS as any)[settings.defaultImageModel] || AI_MODELS.GEMINI_2_0_FLASH;
             } else {
                  modelConfig = (AI_MODELS as any)[settings.defaultTextModel] || AI_MODELS.OPENROUTER_GEMMA_4_26B;
             }
        }

        try {
            switch (modelConfig.provider) {
                case 'gemini':
                    return await this.callGemini(modelConfig.id, params.systemPrompt, params.userPrompt, settings, params.imageBase64, params.mimeType);
                case 'openrouter':
                    return await this.callOpenRouter(modelConfig.id, params.systemPrompt, params.userPrompt, settings, params.imageBase64);
                case 'modal':
                    return await this.callModal(modelConfig.id, params.systemPrompt, params.userPrompt, settings, params.imageBase64);
                default:
                    throw new Error(`Unsupported AI Provider: ${modelConfig.provider}`);
            }
        } catch (error: any) {
            const errorDetails = error?.response?.data || error.message || String(error);
            logger.error(`AI Tool Error [${modelConfig.provider}]:`, errorDetails);
            throw new Error(`Failed to process document using AI Engine (${modelConfig.provider}). Details: ${typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails)}`);
        }
    }

    private static async callGemini(modelId: string, systemPrompt: string, userPrompt: string, settings: any, imageBase64?: string, mimeType?: string) {
        const apiKey = settings.apiKeyGemini || process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY missing");
        
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelId });
        
        const contentParts: any[] = [{ text: systemPrompt + "\n\n" + userPrompt }];

        if (imageBase64) {
            const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
            contentParts.push({
                inlineData: { mimeType: mimeType || 'image/png', data: cleanBase64 }
            });
        }

        const result = await model.generateContent(contentParts);
        return result.response.text();
    }

    private static async callOpenRouter(modelId: string, systemPrompt: string, userPrompt: string, imageBase64?: string) {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) throw new Error("OPENROUTER_API_KEY missing");

        const messages: any[] = [{ role: 'system', content: systemPrompt }];
        
        if (imageBase64) {
            // Check if model supports vision. Openrouter models handle image URLs in content array
            messages.push({
                role: 'user', 
                content: [
                    { type: 'text', text: userPrompt },
                    { type: 'image_url', image_url: { url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}` } }
                ]
            });
        } else {
             messages.push({ role: 'user', content: userPrompt });
        }

        const response = await axios.post(AI_ENDPOINTS.openrouter, {
            model: modelId,
            messages: messages,
            max_tokens: 8000
        }, {
            headers: { 'Authorization': `Bearer ${apiKey}`, 'HTTP-Referer': 'http://localhost:4000' },
            timeout: 60000
        });

        return response.data.choices[0].message.content;
    }

    private static async callModal(modelId: string, systemPrompt: string, userPrompt: string, imageBase64?: string) {
        const apiKey = process.env.MODAL_API_KEY;
        if (!apiKey) throw new Error("MODAL_API_KEY missing");

        const messages: any[] = [
             { role: 'system', content: systemPrompt },
             { role: 'user', content: userPrompt }
             // Note: Modal's specific GLM-5.1 might need direct vision handling, 
             // but if unsupported, we fallback text only or let it fail gracefully if image supplied but model text-only
        ];

        const response = await axios.post(AI_ENDPOINTS.modal, {
            model: modelId,
            messages: messages,
            max_tokens: 4000
        }, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        return response.data.choices[0].message.content;
    }
}
