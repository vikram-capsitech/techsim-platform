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

  if (!groqKey && !geminiKey) {
    throw new Error('No Groq or Gemini API key configured on server or client');
  }

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
      throw new Error('All AI providers failed');
    }
  }

  throw new Error('No Groq or Gemini API key configured on server or client');
}
