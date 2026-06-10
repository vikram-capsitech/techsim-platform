import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function callAI(
  userPrompt: string,
  systemPrompt: string,
  maxTokens: number = 1000,
  customGroqKey?: string,
  customGeminiKey?: string
): Promise<string> {
  const groqKey = customGroqKey || process.env.GROQ_API_KEY;
  const geminiKey = customGeminiKey || process.env.GEMINI_API_KEY;

  console.log('AI Key Debug:', {
    customGroqKey,
    envGroqKey: process.env.GROQ_API_KEY,
    groqKey,
    customGeminiKey,
    envGeminiKey: process.env.GEMINI_API_KEY,
    geminiKey
  });

  if (!groqKey && !geminiKey) {
    throw new Error('No Groq or Gemini API key configured on server or client');
  }

  let lastError: Error | null = null;

  // Try Groq first if key is available
  if (groqKey) {
    try {
      const groqClient = new Groq({ apiKey: groqKey });
      const completion = await groqClient.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: maxTokens,
        temperature: 0.3,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      });
      return completion.choices[0].message.content || '';
    } catch (groqError) {
      console.warn('Groq failed, trying Gemini fallback:', groqError);
      lastError = groqError instanceof Error ? groqError : new Error(String(groqError));
    }
  }

  // Gemini fallback
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemPrompt
      });
      const result = await model.generateContent(userPrompt);
      return result.response.text();
    } catch (geminiError) {
      console.error('Gemini fallback failed:', geminiError);
      lastError = geminiError instanceof Error ? geminiError : new Error(String(geminiError));
    }
  }

  throw lastError || new Error('No Groq or Gemini API key configured on server or client');
}
