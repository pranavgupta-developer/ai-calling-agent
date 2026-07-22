import OpenAI from 'openai';

// Assuming we have OpenAI configured. If the key is missing, we'll return a mock embedding for local dev.
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn('OPENAI_API_KEY is not set. Generating a mock embedding (vector of 1536 zeros) for development.');
    return new Array(1536).fill(0);
  }

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Return mock on failure to not block UI during dev, but in production we might want to throw
    return new Array(1536).fill(0);
  }
}
