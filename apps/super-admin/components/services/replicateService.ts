import { GenerateParams, Question } from '../types';

// Helper to run Replicate prediction via local proxy (to avoid CORS)
const runReplicate = async (modelId: string, input: any) => {
  const token = process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN || process.env.VITE_REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error('NEXT_PUBLIC_REPLICATE_API_TOKEN is not set in environment variables');
  }

  // Parse owner and name from modelId (e.g. "x-ai/grok-4")
  const [owner, name] = modelId.split('/');
  if (!owner || !name) {
    throw new Error(`Invalid model ID format: ${modelId}. Expected "owner/name"`);
  }

  console.log(`Starting Replicate prediction for ${modelId}...`);

  // 1. Start Prediction
  // POST /replicate-api/models/{owner}/{name}/predictions
  const startRes = await fetch(`/replicate-api/models/${owner}/${name}/predictions`, {
    method: "POST",
    headers: {
      "Authorization": `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input })
  });

  if (!startRes.ok) {
    const errText = await startRes.text();
    console.error("Replicate API Error:", errText);
    try {
      const errJson = JSON.parse(errText);
      throw new Error(errJson.detail || errText);
    } catch (e) {
      throw new Error(`Replicate API Failed (${startRes.status}): ${errText}`);
    }
  }

  let prediction = await startRes.json();
  console.log(`Prediction started: ${prediction.id}`);

  // 2. Poll for completion
  const maxAttempts = 60; // 60 seconds roughly
  let attempts = 0;

  while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && prediction.status !== 'canceled') {
    if (attempts >= maxAttempts) {
      throw new Error("Prediction timed out");
    }
    attempts++;
    await new Promise(r => setTimeout(r, 1000)); // Wait 1s

    const pollRes = await fetch(`/replicate-api/predictions/${prediction.id}`, {
      headers: { "Authorization": `Token ${token}` }
    });

    if (!pollRes.ok) {
      throw new Error(`Polling failed: ${pollRes.statusText}`);
    }

    prediction = await pollRes.json();
    console.log(`Polling ${prediction.id}: ${prediction.status}`);
  }

  if (prediction.status === 'failed') {
    console.error("Prediction failed logs:", prediction.logs);
    throw new Error(`Prediction failed: ${prediction.error || 'Unknown error'}`);
  }

  return prediction.output;
};

export const replicateService = {
  generateQuestions: async (params: GenerateParams, modelId: string = 'xai/grok-4'): Promise<Question[]> => {
    const { subject, topic, difficulty, count, language, context, date } = params;

    const isCurrentAffairs = subject === 'Current Affairs';
    const cleanTopic = topic.includes('(') ? topic.split('(')[1].replace(')', '') : topic;
    const dateContext = date ? `STRICTLY for the date: ${date}. Only include events that occurred on this specific day.` : `Focus on late 2024 to early 2025 events.`;
    const currentYear = new Date().getFullYear().toString();
    const todayDate = new Date().toISOString().split('T')[0];

    let contextInstruction = '';
    if (context) {
      contextInstruction = `SOURCE MATERIAL:\n${context}\n\nINSTRUCTION: Generate questions STRICTLY based on the provided source material above.`;
    }

    const prompt = `Generate ${count} educational questions for an Indian competitive exam (UPSC, SSC, Railway, State PSC, Banking).
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

IMPORTANT: SOLUTION QUALITY REQUIREMENTS (CRITICAL):
For every question, the "solution_eng" and "solution_hin" must be HIGHLY COMPREHENSIVE and cover the topic exhaustively.
Structure the solution to include:
1. **Detailed Explanation**: Cover the 'Why' and 'How', not just the 'What'. Explain the core answer in depth.
2. **Context & Background**: Provide the background story or context necessary to understand the event.
3. **Key Details**: Explicitly mention relevant Dates, Names, Figures, Locations, and Constitutional Articles/Acts if applicable.
4. **Related Information**: Briefly cover related sub-topics or connected events to give a holistic view.
5. **Key Takeaways**: Bullet points of facts to remember.

Objective: A student reading this solution should grasp the ENTIRE topic and be able to answer related questions without needing further reference.

IMPORTANT: Fill ALL metadata fields accurately:
- exam: Target exam like "UPSC", "SSC CGL", "RRB NTPC", "IBPS PO", "BPSC", etc.
- year: Year of question relevance (${currentYear})
- section: Which section this question fits (e.g., "General Awareness", "Quantitative Aptitude", "Reasoning", "General Science")
- chapter: Specific chapter/topic name

Response Format (JSON Array):
[
  {
    "question_eng": "...", "question_hin": "...",
    "option1_eng": "...", "option1_hin": "...",
    "option2_eng": "...", "option2_hin": "...",
    "option3_eng": "...", "option3_hin": "...",
    "option4_eng": "...", "option4_hin": "...",
    "option5_eng": "None of the above / More than one of the above", "option5_hin": "उपर्युक्त में से कोई नहीं / उपर्युक्त में से एक से अधिक",
    "answer": "1",
    "solution_eng": "**Correct Answer:** [Option]\n\n**Detailed Explanation:** ...\n\n**Context:** ...\n\n**Key Takeaways:** ...", 
    "solution_hin": "**सही उत्तर:** [विकल्प]\n\n**विस्तृत व्याख्या:** ...\n\n**संदर्भ:** ...\n\n**मुख्य बिंदु:** ...",
    "exam": "SSC CGL",
    "year": "${currentYear}",
    "section": "General Awareness",
    "chapter": "Indian Economy"
  }
]

CRITICAL: Return ONLY valid JSON array. No additional text before or after.`;

    try {
      console.log(`Attempting generation with Replicate model: ${modelId}`);

      const output = await runReplicate(modelId, {
        prompt: prompt,
        max_tokens: 2048,
        temperature: 0.1,
        top_p: 1,
        presence_penalty: 0,
        frequency_penalty: 0
      });

      // Replicate returns output as array of strings or single string
      let responseText = '';
      if (Array.isArray(output)) {
        responseText = output.join('');
      } else if (typeof output === 'string') {
        responseText = output;
      } else {
        responseText = JSON.stringify(output);
      }

      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in response');
      }

      const rawQuestions = JSON.parse(jsonMatch[0]) as any[];

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
        collection: `AI Generated - ${subject} (Grok)`,
        previous_of: `AI Generated on ${todayDate} via Grok`,
        tags: [
          subject,
          cleanTopic,
          q.exam || '',
          q.section || '',
          difficulty,
          currentYear,
          "AI-Generated",
          "Grok"
        ].filter(Boolean)
      }));
    } catch (error: any) {
      console.error(`Replicate (${modelId}) Generation Error:`, error);
      throw new Error(error.message || `Failed to generate questions via ${modelId}`);
    }
  },

  generateAnswer: async (question: string, options: { detailLevel: 'Brief' | 'Detailed' | 'Step-by-Step'; language: string }, modelId: string = 'xai/grok-4'): Promise<any> => {
    const prompt = `Provide a ${options.detailLevel} answer for this question: "${question}"
Language: ${options.language}

Format (JSON):
{
  "answer": "Core answer text...",
  "explanation": "Detailed explanation...",
  "key_points": ["Point 1", "Point 2"],
  "examples": ["Example 1"],
  "common_mistakes": ["Mistake 1"]
}

Return ONLY valid JSON. No additional text.`;

    try {
      const output = await runReplicate(modelId, {
        prompt: prompt,
        max_tokens: 2048,
        temperature: 0.1,
        top_p: 1,
        presence_penalty: 0,
        frequency_penalty: 0
      });

      let responseText = '';
      if (Array.isArray(output)) {
        responseText = output.join('');
      } else if (typeof output === 'string') {
        responseText = output;
      } else {
        responseText = JSON.stringify(output);
      }

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      console.error(`Replicate Answer Generation Error:`, error);
      throw error;
    }
  }
};
