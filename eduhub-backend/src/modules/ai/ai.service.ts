import axios from 'axios';
import { logger } from '../../config/logger';

export class AIService {
    private static CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
    private static MODEL = 'claude-sonnet-4-5'; // claude-sonnet-4-6 when released

    static async getCanvasQueryResponse(params: {
        query: string;
        context?: string;
        imageBase64?: string;      // PNG screenshot from canvas (RepaintBoundary)
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

            // Build message content (multimodal if image provided)
            const messageContent: any[] = [];

            if (params.imageBase64) {
                messageContent.push({
                    type: 'image',
                    source: {
                        type: 'base64',
                        media_type: 'image/png',
                        data: params.imageBase64,
                    },
                });
            }

            messageContent.push({
                type: 'text',
                text: params.query,
            });

            const response = await axios.post(
                this.CLAUDE_API_URL,
                {
                    model: this.MODEL,
                    max_tokens: 1500,
                    system: systemPrompt,
                    messages: [{ role: 'user', content: messageContent }],
                },
                {
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'content-type': 'application/json',
                    },
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
        return "**EduHub AI Teaching Assistant**\n\nI'm ready to help with:\n- Concept explanations\n- Step-by-step problem solving\n- MCQ generation\n- Diagram descriptions\n\n*Mock mode — add CLAUDE_API_KEY to .env to enable full AI.*";
    }
}
