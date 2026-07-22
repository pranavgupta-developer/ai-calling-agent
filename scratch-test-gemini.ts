import * as dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config({ path: '.env.local' });

async function testGemini() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const text = "What documents are required to buy a property?";
  try {
    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: text,
    });
    const embedding = response.embeddings?.[0]?.values;
    if (!embedding) throw new Error("No embedding returned");
    console.log("Gemini Embedding Length:", embedding.length);
    
    const padded = new Array(1536).fill(0);
    for (let i = 0; i < embedding.length; i++) {
      padded[i] = embedding[i];
    }
    console.log("Padded Length:", padded.length);
    console.log("Success!");
  } catch (error) {
    console.error(error);
  }
}

testGemini();
