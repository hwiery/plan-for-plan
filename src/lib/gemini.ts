
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GOOGLE_GEMINI_API_KEY is not set in the environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

export const geminiPro = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

const cache = new Map<string, string>();

export const generateText = async (prompt: string, maxRetries = 3) => {
  if (cache.has(prompt)) {
    return cache.get(prompt);
  }

  let retries = 0;
  while (retries < maxRetries) {
    try {
      const result = await geminiPro.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      cache.set(prompt, text);
      return text;
    } catch (error) {
      console.error(`Error generating text with Gemini (attempt ${retries + 1}/${maxRetries}):`, error);
      retries++;
      if (retries >= maxRetries) {
        throw new Error('Failed to generate text with Gemini API after multiple retries');
      }
      // Optional: add a delay before retrying
      await new Promise(res => setTimeout(res, 1000 * retries));
    }
  }
  throw new Error('Failed to generate text with Gemini API');
};
