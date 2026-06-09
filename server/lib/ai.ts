import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function callAI(
  userPrompt: string,
  systemPrompt: string,
  maxTokens: number = 1000
): Promise<string> {
  // Try Groq first
  try {
    const completion = await groq.chat.completions.create({
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

    // Gemini fallback
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Groq failed and no Gemini API key configured');
    }

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
}
