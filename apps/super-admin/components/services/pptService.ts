import pptxgen from "pptxgenjs";
import { geminiService } from "./geminiService";

export type PPTTemplate = 'classic' | 'modern' | 'creative';

export interface GeneratedSlide {
    title: string;
    content: string[];
    layout: 'title' | 'content' | 'comparison' | 'quote';
    visualSuggestion?: string;
    speakerNotes?: string;
}

export const pptService = {
    generateSlides: async (topicOrContent: string): Promise<GeneratedSlide[]> => {
        // Use Gemini to structure the presentation
        const prompt = `
            Act as a professional presentation designer. 
            Create a slide outline for the following topic/content:
            "${topicOrContent.substring(0, 5000)}" 
            (Truncated if too long)

            Rules:
            1. Title Slide first.
            2. At least 5-8 content slides.
            3. Varied layouts (Intro, Key Points, Conclusion).
            4. Suggest a visual idea for each slide (e.g., "Icon of a tree", "Chart showing growth").

            Return strictly valid JSON:
            [
                {
                    "title": "Slide Title",
                    "content": ["Point 1", "Point 2", "Point 3"],
                    "layout": "title" | "content" | "comparison" | "quote",
                    "visualSuggestion": "Description of visual",
                    "speakerNotes": "Brief notes for speaker"
                }
            ]
        `;

        try {
            const ai = geminiService.getAI();
            if (!ai) throw new Error("AI Service not initialized");

            const result = await ai.getGenerativeModel({ model: "gemini-3-flash-preview" }).generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            });

            const text = result.response.text();
            return JSON.parse(text) as GeneratedSlide[];
        } catch (error) {
            console.error("AI Generation Error", error);
            // Fallback for demo if API fails
            return [
                { title: "Error Generating Slides", content: ["Please check API Key", "Try again"], layout: 'content' }
            ];
        }
    },

    createPPTX: async (slides: GeneratedSlide[], template: PPTTemplate) => {
        const pptx = new pptxgen();

        // Template Settings
        let bgColor = "FFFFFF";
        let titleColor = "000000";
        let bodyColor = "363636";
        let fontFace = "Arial";

        if (template === 'modern') {
            bgColor = "111827"; // Dark slate
            titleColor = "F9FAFB";
            bodyColor = "D1D5DB";
            fontFace = "Inter"; // Will default to Arial if not available
        } else if (template === 'creative') {
            bgColor = "FAF5FF"; // Purple tint
            titleColor = "6B21A8";
            bodyColor = "4B5563";
            fontFace = "Georgia";
        }

        // Add Slides
        slides.forEach((slide, index) => {
            const s = pptx.addSlide();
            s.background = { color: bgColor };

            // Layout Logic
            if (slide.layout === 'title') {
                s.addText(slide.title, {
                    x: 1, y: 2, w: 8, h: 1.5,
                    fontSize: 48, align: 'center', bold: true, color: titleColor, fontFace
                });
                s.addText(slide.content.join('\n'), {
                    x: 1.5, y: 3.5, w: 7, h: 1,
                    fontSize: 24, align: 'center', color: bodyColor, transparency: 20, fontFace
                });
            } else {
                // Header
                s.addText(slide.title, {
                    x: 0.5, y: 0.5, w: 9, h: 0.8,
                    fontSize: 32, bold: true, color: titleColor, fontFace
                });

                // Content (Bullet points)
                const bullets = slide.content.map(point => ({ text: point, options: { bullet: true } }));

                // If visual suggestion exists, use 2-column layout (Text Left, Placeholder Right for now)
                if (slide.visualSuggestion) {
                    s.addText(bullets, {
                        x: 0.5, y: 1.5, w: 5, h: 5,
                        fontSize: 18, color: bodyColor, lineSpacing: 32, fontFace
                    });

                    // Visual Placeholder
                    s.addShape(pptx.ShapeType.rect, { x: 6, y: 1.5, w: 3.5, h: 3.5, fill: { color: template === 'modern' ? "374151" : "F3F4F6" } });
                    s.addText(`Visual: ${slide.visualSuggestion}`, { x: 6.2, y: 2.5, w: 3, h: 1.5, fontSize: 12, color: bodyColor, align: 'center' });
                } else {
                    // Full width text
                    s.addText(bullets, {
                        x: 0.5, y: 1.5, w: 9, h: 5,
                        fontSize: 18, color: bodyColor, lineSpacing: 32, fontFace
                    });
                }
            }

            // Footer / Slide Number
            s.addText(`${index + 1}`, { x: 9.5, y: 5.3, fontSize: 10, color: bodyColor });
        });

        pptx.writeFile({ fileName: `Generated_Presentation_${Date.now()}.pptx` });
    }
};
