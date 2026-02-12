import { GoogleGenerativeAI } from "@google/generative-ai";
import { GenerateParams, Question } from '../types';

// Helper to convert File to Base64 for Gemini
// Matches standard Gemini API Part structure
const fileToPart = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          mimeType: file.type,
          data: base64Data
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

let aiInstance: GoogleGenerativeAI | null = null;
const getAI = () => {
  if (!aiInstance) {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'dummy_key';
    aiInstance = new GoogleGenerativeAI(key);
  }
  return aiInstance;
};

export const CURRENT_AFFAIRS_CATEGORIES = [
  "Daily News Recap",
  "Who, What, Where?",
  "Modi Cabinet 3.0",
  "State Capitals, Governors, and Chief Ministers",
  "High Courts of India",
  "Countries of the World: Who, What, Where?",
  "First in India and World: 2023-25",
  "Major Memorandums of Understanding (MoU): 2024-25",
  "Major Mobile Apps and Portals: 2024-25",
  "Brand Ambassadors (Campaigns and Organizations)",
  "Bharat Ratna: 2024",
  "Joint Military Exercises: 2024-25",
  "Lok Sabha Elections 2024",
  "International Organizations: At a Glance",
  "Major International Summits: 2024-25",
  "Major National Summits: 2024-25",
  "Major Operations of Year 2023-25",
  "Major Reports of Government of India",
  "Various Indices/Reports: 2024-25",
  "Economic Survey: 2024-25",
  "Union Budget: 2025-26",
  "Central Government Schemes: 2014-24",
  "State Government Schemes: 2023-24",
  "Economic Scenario",
  "Science and Technology",
  "Defense and Security",
  "Space Technology",
  "Environment and Ecology",
  "National Sports Awards: 2024",
  "Awards, Medals, and Honors",
  "Sports Scenario",
  "Latest Books and Authors",
  "Important Days",
  "Important Days and Their Themes",
  "Important Summits and Ceremonies",
  "Latest Abbreviations",
  "Miscellaneous Current Affairs"
];

export const geminiService = {
  generateQuestions: async (params: GenerateParams, modelId?: string): Promise<Question[]> => {
    const { subject, topic, difficulty, count, type, date, language, context, inputMode, files, outputFormat = 'html' } = params;

    const isCurrentAffairs = subject === 'Current Affairs';

    // Model fallback list
    // Priority: Gemini 3 Flash Preview -> Gemini 2.0 Flash Exp -> Gemini 1.5 Pro
    const defaultModels = isCurrentAffairs
      ? ['gemini-3-flash-preview', 'gemini-2.0-flash-exp', 'gemini-1.5-pro']
      : ['gemini-3-flash-preview', 'gemini-2.0-flash-exp', 'gemini-1.5-pro'];

    // If specific model requested, try that first
    const modelsToTry = modelId ? [modelId, ...defaultModels] : defaultModels;

    // Extract cleaner topic name for prompt
    const cleanTopic = topic.includes('(') ? topic.split('(')[1].replace(')', '') : topic;

    // Construct temporal context
    const dateContext = date ? `STRICTLY for the date: ${date}. Only include events that occurred on this specific day.` : `Focus on late 2024 to early 2025 events.`;

    // Get current year for metadata
    const currentYear = new Date().getFullYear().toString();
    const todayDate = new Date().toISOString().split('T')[0];

    // Build Context Instruction based on Input Mode
    let contextInstruction = "";
    if (inputMode === 'text' && context) {
      contextInstruction = `SOURCE MATERIAL:\n${context}\n\nINSTRUCTION: Generate questions STRICTLY based on the provided source material above. Do not use outside knowledge unless necessary to clarify context.`;
    } else if (inputMode === 'url' && context) {
      contextInstruction = `SOURCE URL: ${context}\n\nINSTRUCTION: Access the URL content (if possible) or use your knowledge about this specific URL/Topic to generate questions.`;
    } else if ((inputMode === 'image' || inputMode === 'pdf') && files?.length) {
      contextInstruction = `INSTRUCTION: Analyze the attached images/documents and generate questions based on their visual or textual content.`;
    }

    const prompt = `
      Generate ${count} educational questions for an Indian competitive exam (UPSC, SSC, Railway, State PSC, Banking).
      Subject: ${subject}
      Category/Topic: ${topic}
      Temporal Focus: ${dateContext}
      Difficulty: ${difficulty}
      Language: ${language || 'Bilingual'} (Ensure content is primarily in this language. If Bilingual, provide both English and Hindi).
      
      ${contextInstruction}

      Instructions for Current Affairs:
      - ${date ? `Source news ONLY from ${date}` : 'Use the most recent verified information.'}
      - Ensure high accuracy in facts, appointments, and data.
      - Every question must be relevant for a candidate appearing in exams in 2025.

      ${outputFormat === 'html' ? `
      IMPORTANT: HTML FORMATTING REQUIREMENTS (MANDATORY):
      ALL content fields (questions, options, solutions) MUST be in rich HTML format with inline CSS styling.
      Use professional, colorful, and visually appealing formatting with DARK TEXT on LIGHT backgrounds for maximum visibility:
      
      1. **Questions**: Use light gradient backgrounds with DARK text for visibility
         Example: <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 15px; border-radius: 8px; color: #1a1a1a; font-weight: 600; margin-bottom: 12px; border: 2px solid #667eea;">Question text here</div>
      
      2. **Options**: Use light backgrounds with dark text and colored left borders
         Example: <div style="background: #ffffff; border-left: 4px solid #3498db; padding: 12px; margin: 8px 0; border-radius: 6px; font-size: 15px; color: #2c3e50; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><strong style="color: #3498db;">A.</strong> Option text here</div>
      
      3. **Solutions**: Structure with sections, highlights, and colored emphasis - ALWAYS use dark text
         - Use <h3> tags with light gradient backgrounds and DARK text for section headers
         - Use <span style="background: #fff3cd; color: #856404; font-weight: 600; padding: 2px 6px; border-radius: 3px;"> for key terms (yellow highlight)
         - Use <div style="background: #d4edda; border-left: 5px solid #28a745; padding: 12px; margin: 10px 0; color: #155724;"> for important notes (green)
         - Use <ul> or <ol> with styled <li style="padding: 8px; background: #e7f3ff; margin: 5px 0; border-radius: 5px; color: #004085;"> for key takeaways
      ` : `
      IMPORTANT: PLAIN TEXT FORMATTING (MANDATORY):
      ALL content fields (questions, options, solutions) MUST be in PLAIN TEXT format only.
      - DO NOT use any HTML tags whatsoever (<div>, <span>, <h3>, <strong>, <p>, etc.)
      - Use simple text with line breaks for structure
      - Use ** for bold emphasis (Markdown style)
      - Use * or - for bullet points
      - Use numbered lists (1., 2., 3.) for ordered lists
      - Keep formatting minimal and readable in plain text
      
      Example Question (Plain Text):
      "What is the capital of India?"
      
      Example Option (Plain Text):
      "A. New Delhi"
      
      Example Solution (Plain Text):
      "**Correct Answer:** Option A
      
      **Explanation:**
      New Delhi is the capital of India. It was declared the capital in 1911, replacing Calcutta.
      
      **Key Points:**
      * New Delhi is located in northern India
      * It serves as the seat of the Government of India
      * The city was designed by British architects Edwin Lutyens and Herbert Baker
      
      **Important:** New Delhi should not be confused with Delhi, which is the larger metropolitan area."
      `}

      IMPORTANT: SOLUTION STRUCTURE (MANDATORY):
      Every solution must follow this EXACT structure:
      
      ${outputFormat === 'html' ? `
      **HTML FORMAT STRUCTURE:**
      1. **Correct Answer Statement** - Simple one-line answer at the top
      2. **📰 In News Section** - Recent news/context with bullet points
      3. **✓ Key Points Section** - Important facts and details with bullet points
      
      Example HTML Solution:
      "<p style='color: #2c3e50; font-weight: 600; margin-bottom: 15px;'>सही उत्तर [Answer text]।</p>
      <h3 style='color: #1976d2; background: #e3f2fd; padding: 10px; border-radius: 6px; margin: 15px 0; display: flex; align-items: center; gap: 8px;'><span style='font-size: 18px;'>📰</span> In News</h3>
      <ul style='list-style: none; padding-left: 0; margin: 10px 0;'>
        <li style='padding: 8px; background: #f5f5f5; margin: 5px 0; border-radius: 5px; color: #2c3e50; border-left: 3px solid #1976d2;'>• News point 1 with relevant details</li>
        <li style='padding: 8px; background: #f5f5f5; margin: 5px 0; border-radius: 5px; color: #2c3e50; border-left: 3px solid #1976d2;'>• News point 2</li>
      </ul>
      <h3 style='color: #28a745; background: #d4edda; padding: 10px; border-radius: 6px; margin: 15px 0; display: flex; align-items: center; gap: 8px;'><span style='font-size: 18px;'>✓</span> Key Points</h3>
      <ul style='list-style: none; padding-left: 0; margin: 10px 0;'>
        <li style='padding: 8px; background: #f5f5f5; margin: 5px 0; border-radius: 5px; color: #2c3e50; border-left: 3px solid #28a745;'>• Key fact 1 with dates, names, or figures</li>
        <li style='padding: 8px; background: #f5f5f5; margin: 5px 0; border-radius: 5px; color: #2c3e50; border-left: 3px solid #28a745;'>• Key fact 2</li>
      </ul>"
      ` : `
      **PLAIN TEXT FORMAT STRUCTURE:**
      1. **Correct Answer Statement** - Simple one-line answer at the top
      2. **📰 In News Section** - Recent news/context with bullet points
      3. **✓ Key Points Section** - Important facts and details with bullet points
      
      Example Plain Text Solution:
      "सही उत्तर [Answer text]।
      
      📰 In News
      • News point 1 with relevant details
      • News point 2 with context
      
      ✓ Key Points
      • Key fact 1 with dates, names, or figures
      • Key fact 2 with important information
      • Key fact 3"
      `}

      Content Guidelines:
      - **In News**: Include 2-3 recent developments, appointments, or events related to this topic
      - **Key Points**: Include 3-5 essential facts with specific details (dates, names, numbers, locations)
      - Keep language clear and concise
      - Include both English and Hindi content appropriately based on language parameter

      
      IMPORTANT: Fill ALL metadata fields accurately:
      - exam: Target exam like "UPSC", "SSC CGL", "RRB NTPC", "IBPS PO", "BPSC", etc.
      - year: Year of question relevance (${currentYear})
      - section: Which section this question fits (e.g., "General Awareness", "Quantitative Aptitude", "Reasoning", "General Science")
      - chapter: Specific chapter/topic name
      - sources: Include 2-3 genuine verification sources for the content.
        - title: Name of the source (e.g. "The Hindu", "NCERT Class 10")
        - uri: **OFFICIAL WEBSITE URL ONLY**. Do not verify with specific article links if you are not 100% sure. Provide the main domain (e.g. "https://www.isro.gov.in/" or "https://pib.gov.in/").
        - credibility: Rate the credibility as "High", "Medium", or "Low"
          - High: Official Govt documents, Major Newspapers (The Hindu, Indian Express), Standard Textbooks (NCERT).
          - Medium: Reputable ed-tech blogs, known news portals.
          - Low: General blogs, social media, unverified sites.
      
      Response Format (JSON):
      ${outputFormat === 'html' ? `{
        "question_eng": "<div style='background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 15px; border-radius: 8px; color: #1a1a1a; font-weight: 600; border: 2px solid #667eea;'>Question text in HTML</div>",
        "question_hin": "<div style='background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 15px; border-radius: 8px; color: #1a1a1a; font-weight: 600; border: 2px solid #667eea;'>प्रश्न पाठ HTML में</div>",
        "option1_eng": "<div style='background: #ffffff; border-left: 4px solid #3498db; padding: 12px; margin: 8px 0; border-radius: 6px; color: #2c3e50; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'><strong style='color: #3498db;'>A.</strong> Option text</div>",
        "option1_hin": "<div style='background: #ffffff; border-left: 4px solid #3498db; padding: 12px; margin: 8px 0; border-radius: 6px; color: #2c3e50; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'><strong style='color: #3498db;'>क.</strong> विकल्प पाठ</div>",
        "option2_eng": "...", "option2_hin": "...",
        "option3_eng": "...", "option3_hin": "...",
        "option4_eng": "...", "option4_hin": "...",
        "option5_eng": "<div style='background: #ffffff; border:1px solid #95a5a6; padding: 12px; margin: 8px 0; border-radius: 6px; color: #2c3e50;'><strong style='color: #7f8c8d;'>E.</strong> None of the above / More than one of the above</div>",
        "option5_hin": "<div style='background: #ffffff; border:1px solid #95a5a6; padding: 12px; margin: 8px 0; border-radius: 6px; color: #2c3e50;'><strong style='color: #7f8c8d;'>ङ.</strong> उपर्युक्त में से कोई नहीं / उपर्युक्त में से एक से अधिक</div>",
        "answer": "1",
        "solution_eng": "<p style='color: #2c3e50; font-weight: 600; margin-bottom: 15px;'>The correct answer is Option A - [Answer details].</p><h3 style='color: #1976d2; background: #e3f2fd; padding: 10px; border-radius: 6px; margin: 15px 0; display: flex; align-items: center; gap: 8px;'><span style='font-size: 18px;'>📰</span> In News</h3><ul style='list-style: none; padding-left: 0; margin: 10px 0;'><li style='padding: 8px; background: #f5f5f5; margin: 5px 0; border-radius: 5px; color: #2c3e50; border-left: 3px solid #1976d2;'>• Recent development or appointment related to this topic with specific date</li><li style='padding: 8px; background: #f5f5f5; margin: 5px 0; border-radius: 5px; color: #2c3e50; border-left: 3px solid #1976d2;'>• Important event or announcement</li></ul><h3 style='color: #28a745; background: #d4edda; padding: 10px; border-radius: 6px; margin: 15px 0; display: flex; align-items: center; gap: 8px;'><span style='font-size: 18px;'>✓</span> Key Points</h3><ul style='list-style: none; padding-left: 0; margin: 10px 0;'><li style='padding: 8px; background: #f5f5f5; margin: 5px 0; border-radius: 5px; color: #2c3e50; border-left: 3px solid #28a745;'>• Essential fact with specific details (dates, names, figures)</li><li style='padding: 8px; background: #f5f5f5; margin: 5px 0; border-radius: 5px; color: #2c3e50; border-left: 3px solid #28a745;'>• Important information related to the topic</li><li style='padding: 8px; background: #f5f5f5; margin: 5px 0; border-radius: 5px; color: #2c3e50; border-left: 3px solid #28a745;'>• Additional key fact or context</li></ul>",
        "solution_hin": "<p style='color: #2c3e50; font-weight: 600; margin-bottom: 15px;'>सही उत्तर विकल्प क - [उत्तर विवरण]।</p><h3 style='color: #1976d2; background: #e3f2fd; padding: 10px; border-radius: 6px; margin: 15px 0; display: flex; align-items: center; gap: 8px;'><span style='font-size: 18px;'>📰</span> समाचार में</h3><ul style='list-style: none; padding-left: 0; margin: 10px 0;'><li style='padding: 8px; background: #f5f5f5; margin: 5px 0; border-radius: 5px; color: #2c3e50; border-left: 3px solid #1976d2;'>• हालिया विकास या नियुक्ति</li></ul><h3 style='color: #28a745; background: #d4edda; padding: 10px; border-radius: 6px; margin: 15px 0; display: flex; align-items: center; gap: 8px;'><span style='font-size: 18px;'>✓</span> मुख्य बिंदु</h3><ul style='list-style: none; padding-left: 0; margin: 10px 0;'><li style='padding: 8px; background: #f5f5f5; margin: 5px 0; border-radius: 5px; color: #2c3e50; border-left: 3px solid #28a745;'>• महत्वपूर्ण तथ्य</li></ul>",
        "exam": "SSC CGL",
        "year": "${currentYear}",
        "section": "General Awareness",
        "chapter": "Indian Economy",
        "sources": [
            { "title": "The Hindu", "uri": "https://www.thehindu.com/", "credibility": "High" },
            { "title": "PIB", "uri": "https://pib.gov.in/", "credibility": "High" }
        ]
      }` : `{
        "question_eng": "What is the capital of India?",
        "question_hin": "भारत की राजधानी क्या है?",
        "option1_eng": "A. New Delhi",
        "option1_hin": "क. नई दिल्ली",
        "option2_eng": "B. Mumbai",
        "option2_hin": "ख. मुंबई",
        "option3_eng": "C. Kolkata",
        "option3_hin": "ग. कोलकाता",
        "option4_eng": "D. Chennai",
        "option4_hin": "घ. चेन्नई",
        "option5_eng": "E. None of the above",
        "option5_hin": "ङ. उपर्युक्त में से कोई नहीं",
        "answer": "1",
        "solution_eng": "The correct answer is Option A - New Delhi.\\n\\n📰 In News\\n• Delhi is hosting the G20 Summit in 2023, showcasing India's capital on the global stage\\n• New Metro corridors inaugurated in New Delhi, improving connectivity across NCR\\n\\n✓ Key Points\\n• New Delhi became the capital of India in 1911, replacing Calcutta (now Kolkata)\\n• The decision was announced during the Delhi Durbar by King George V\\n• Designed by British architects Edwin Lutyens and Herbert Baker\\n• Officially inaugurated on February 13, 1931\\n• New Delhi is the seat of all three branches of the Government of India",
        "solution_hin": "सही उत्तर विकल्प क - नई दिल्ली।\\n\\n📰 समाचार में\\n• दिल्ली में 2023 में G20 शिखर सम्मेलन आयोजित हो रहा है\\n• नई दिल्ली में नई मेट्रो लाइनों का उद्घाटन किया गया\\n\\n✓ मुख्य बिंदु\\n• नई दिल्ली 1911 में भारत की राजधानी बनी\\n• राजा जॉर्ज पंचम ने दिल्ली दरबार में घोषणा की\\n• एडविन लुटियंस और हर्बर्ट बेकर द्वारा डिजाइन किया गया\\n• 13 फरवरी 1931 को आधिकारिक रूप से उद्घाटन हुआ",
        "exam": "SSC CGL",
        "year": "${currentYear}",
        "section": "General Awareness",
        "chapter": "Indian Polity",
        "sources": [
            { "title": "NCERT", "uri": "https://ncert.nic.in/", "credibility": "High" },
            { "title": "India.gov.in", "uri": "https://www.india.gov.in/", "credibility": "High" }
        ]
      }`}
    `;

    try {
      // Prepare content parts (Text + Files)
      let contentParts: any[] = [{ text: prompt }];

      if ((inputMode === 'image' || inputMode === 'pdf') && files && files.length > 0) {
        const fileParts = await Promise.all(files.map(fileToPart));
        contentParts = [...contentParts, ...fileParts];
      }

      let responseText = "";
      let lastError: any = null;

      const ai = getAI();

      for (const modelName of modelsToTry) {
        try {
          console.log(`Attempting generation with model: ${modelName}`);

          const model = ai.getGenerativeModel({ 
            model: modelName,
            generationConfig: {
              responseMimeType: "application/json",
            }
          });

          const result = await model.generateContent(contentParts);
          const response = await result.response;
          responseText = response.text();

          // If successful, break the loop
          if (responseText) break;
        } catch (e: any) {
          console.warn(`Model ${modelName} failed:`, e.message);
          lastError = e;
          // Continue to next model
        }
      }

      if (!responseText) {
        throw lastError || new Error("All models failed to generate content");
      }

      // Cleanup response text (remove markdown code blocks if present)
      const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const rawQuestions = JSON.parse(cleanText || "[]") as any[];

      return rawQuestions.map((q: any) => ({
        ...q,
        id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        question_unique_id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        subject,
        chapter: q.chapter || (date && topic.includes("Daily") ? `Daily News: ${date}` : cleanTopic),
        section: q.section || subject,
        topic: cleanTopic,
        type: 'MCQ',
        difficulty,
        language: language || 'Bilingual',
        createdDate: new Date().toISOString(),
        date: date || todayDate,
        year: q.year || currentYear,
        exam: q.exam || 'Competitive Exams',
        collection: `AI Generated - ${subject}`,
        previous_of: `AI Generated on ${todayDate}`,
        tags: [
          subject,
          cleanTopic,
          q.exam || '',
          q.section || '',
          difficulty,
          currentYear,
          "AI-Generated"
        ].filter(Boolean)
      }));
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      throw new Error(error.message || "Failed to generate questions. Check network or API limits.");
    }
  },

  summarizeExplanation: async (text: string): Promise<string> => {
    try {
      const ai = getAI();
      const model = ai.getGenerativeModel({ model: 'gemini-3-flash-preview' });
      const result = await model.generateContent(`Summarize this in one short sentence: "${text}"`);
      const response = await result.response;
      return response.text().trim() || text;
    } catch (err) {
      console.error(err);
      return text;
    }
  },

  suggestTopics: async (subject: string): Promise<string[]> => {
    if (subject === 'Current Affairs') return CURRENT_AFFAIRS_CATEGORIES;
    try {
      const ai = getAI();
      const model = ai.getGenerativeModel({ 
        model: 'gemini-3-flash-preview',
        generationConfig: {
          responseMimeType: "application/json",
        }
      });
      const result = await model.generateContent(`List 10 popular chapters for competitive exams in ${subject}. JSON array of strings only.`);
      const response = await result.response;
      return JSON.parse(response.text() || "[]") as string[];
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  generateAnswer: async (question: string, options: { detailLevel: 'Brief' | 'Detailed' | 'Step-by-Step'; language: string }): Promise<any> => {
    const prompt = `
      Provide a ${options.detailLevel} answer for this question: "${question}"
      Language: ${options.language}
      
      Format (JSON):
      {
        "answer": "Core answer text...",
        "explanation": "Detailed explanation...",
        "key_points": ["Point 1", "Point 2"],
        "examples": ["Example 1"],
        "common_mistakes": ["Mistake 1"]
      }
    `;

    try {
      const ai = getAI();
      const model = ai.getGenerativeModel({ 
        model: 'gemini-3-flash-preview',
        generationConfig: { responseMimeType: "application/json" }
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text() || "{}");
    } catch (e) {
      console.warn("gemini-3-flash-preview failed for answer, trying fallback", e);
      try {
        const ai = getAI();
        const model = ai.getGenerativeModel({ 
          model: 'gemini-2.0-flash-exp',
          generationConfig: { responseMimeType: "application/json" }
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text() || "{}");
      } catch (e2) {
        console.error("Answer gen failed on fallback", e2);
        throw e2;
      }
    }
  },

  generateBookStructure: async (title: string, subject: string, targetAudience: string, topics: string[]): Promise<any> => {
    const prompt = `
      Create a detailed book structure for: "${title}"
      Subject: ${subject}
      Target Audience: ${targetAudience}
      Key Topics: ${topics.join(", ")}
      
      Format (JSON):
      {
        "title": "${title}",
        "chapters": [
          {
            "title": "Chapter 1: ...",
            "sections": ["1.1 ...", "1.2 ..."],
            "summary": "Brief summary..."
          }
        ]
      }
    `;
    try {
      const ai = getAI();
      const model = ai.getGenerativeModel({ 
        model: 'gemini-3-flash-preview',
        generationConfig: { responseMimeType: "application/json" }
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text() || "{}");
    } catch (e) {
      console.error("Book structure gen failed", e);
      throw e;
    }
  },

  generateBookChapter: async (chapterTitle: string, sections: string[], audience: string): Promise<string> => {
    const prompt = `
      Write a detailed book chapter content for: "${chapterTitle}"
      Sections to cover: ${sections.join(", ")}
      Target Audience: ${audience}
      
      Format: Markdown (Detailed, educational, engaging, with examples)
    `;
    try {
      const ai = getAI();
      const model = ai.getGenerativeModel({ model: 'gemini-3-flash-preview' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text() || "";
    } catch (e) {
      console.error("Chapter content gen failed", e);
      throw e;
    }
  },

  proofreadContent: async (content: string): Promise<any> => {
    const prompt = `
      Act as an expert proofreader and editor for educational content. 
      Analyze the text below for grammar, spelling, punctuation, style, and clarity issues.
      
      Text to Analyze:
      "${content}"

      Return a JSON response with the following structure:
      {
        "segments": [
          {
            "text": "original segment text",
            "type": "text" | "error" | "suggestion", 
            "severity": "info" | "warning" | "critical",
            "message": "Explanation of the issue (if any)",
            "replacement": "Safe replacement text (if error)"
          }
        ],
        "summary": "Brief summary of the quality and main issues found.",
        "score": 85 // Quality score 0-100
      }

      Rules:
      1. Break the text into logical segments (words/phrases). 
      2. Keep "text" type for correct parts.
      3. Use "error" type for objective mistakes (grammar, spelling).
      4. Use "suggestion" type for stylistic improvements.
      5. Ensure reassembling the "text" fields produces the original text approximately.
      6. "replacement" should be the corrected version of that specific segment.
    `;

    try {
      const ai = getAI();
      const model = ai.getGenerativeModel({ 
        model: 'gemini-3-flash-preview',
        generationConfig: { responseMimeType: "application/json" }
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text() || "{}");
    } catch (e) {
      console.error("Proofreading failed", e);
      throw e;
    }
  },

  parseQuestionContent: async (text: string, files: File[]): Promise<Question[]> => {
    const prompt = `
      Extract questions from the provided content.
      The content might be text (including parsed Word docs) or images.
      
      CRITICAL INSTRUCTIONS:
      1. TABLES: Detect if the content contains TABLES. If a question relies on a table, you MUST extract the table structure.
      2. MATH/SCIENCE: Preserve ALL mathematical equations, formulas, and symbols in valid LaTeX format (e.g., $x^2 + y^2 = r^2$). Enclose in $ or $$.
      3. MULTILINGUAL: If content is bilingual (Hindi/English), extract BOTH. If only one is present, leave the other empty.
      4. TYPES: Identify question types:
         - MCQ (Multiple Choice)
         - TrueFalse
         - FillBlanks
         - ShortAnswer (1-2 lines)
         - LongAnswer (Paragraph/Descriptive)
      
      Extract into the following JSON structure (Array of Questions):
      [
        {
          "type": "MCQ" | "TrueFalse" | "FillBlanks" | "ShortAnswer" | "LongAnswer",
          "question_eng": "Question text in English (keep LaTeX)",
          "question_hin": "Question text in Hindi (if available)",
          // Options only for MCQ
          "option1_eng": "...", "option1_hin": "...",
          "option2_eng": "...", "option2_hin": "...",
          "option3_eng": "...", "option3_hin": "...",
          "option4_eng": "...", "option4_hin": "...",
          
          "answer": "1", // Correct option index (1, 2, 3, 4) for MCQ. 'true'/'false' for TrueFalse.
          "answer_text": "Correct answer text for FillBlanks/ShortAnswer",
          
          "solution_eng": "Detailed solution in English",
          "solution_hin": "Detailed solution in Hindi",
          
          "subject": "Inferred subject",
          "topic": "Inferred topic",
          "difficulty": "Medium", 
          "marks": 1, // Estimate marks: MCQ=1, Short=2-3, Long=5+
          "cognitive_level": "Knowledge",
          "context": "Context if any",
          "has_table": true/false,
          "table_data": { ... } // Same as before
        }
      ]

      If the content is just text, use that. If files are provided, analyze them.
      If no questions are found, return an empty array.
    `;

    try {
      let contentParts: any[] = [{ text: prompt }];

      if (text) {
        contentParts.push({ text: `CONTENT TO PROCESS:\n${text}` });
      }

      if (files && files.length > 0) {
        const fileParts = await Promise.all(files.map(fileToPart));
        contentParts = [...contentParts, ...fileParts];
      }

      const ai = getAI();
      const model = ai.getGenerativeModel({ 
        model: 'gemini-3-flash-preview',
        generationConfig: {
          responseMimeType: "application/json",
        }
      });

      const result = await model.generateContent(contentParts);
      const response = await result.response;
      return JSON.parse(response.text() || "[]") as Question[];

    } catch (e) {
      console.error("Extraction failed", e);
      throw e;
    }
  },
  
  refineContent: async (content: string, instruction: string): Promise<string> => {
    const prompt = `
      Act as an expert educational content editor.
      
      Your task is to REFINE the following content based on this instruction: "${instruction}"
      
      Content to Refine:
      """
      ${content}
      """
      
      Rules:
      1. Return ONLY the refined content. No conversational text.
      2. Maintain the original HTML structure if present, unless the instruction is to change formatting.
      3. Improve clarity, grammar, and flow.
      4. Ensure mathematical formulas (LaTeX) are preserved and corrected if needed.
    `;

    try {
        const ai = getAI();
        const model = ai.getGenerativeModel({ model: 'gemini-3-flash-preview' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text()?.trim() || content;
    } catch (e) {
        console.error("Content refinement failed", e);
        throw e;
    }
  }
};
