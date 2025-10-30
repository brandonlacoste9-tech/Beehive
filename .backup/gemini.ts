import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function runGeminiPrompt(systemPrompt: string, userInput: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const res = await model.generateContent([
    { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userInput }] },
  ]);
  return res.response.text();
}

