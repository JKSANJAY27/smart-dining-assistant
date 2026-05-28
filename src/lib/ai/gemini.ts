import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️ Warning: GEMINI_API_KEY environment variable is not defined.");
}

// Singleton instances for genAI
export const genAI = new GoogleGenerativeAI(apiKey || "");

export const DEFAULT_LLM = process.env.LLM_MODEL || "gemini-2.0-flash-exp";
export const DEFAULT_EMBEDDING = process.env.EMBEDDING_MODEL || "text-embedding-004";

/**
 * Returns a configured Generative Model instance.
 * @param modelName The model name to load (defaults to LLM_MODEL env)
 * @param temperature The temperature parameter (defaults to AI_TEMPERATURE env)
 */
export function getLLM(modelName = DEFAULT_LLM, temperature?: number) {
  const temp = temperature ?? Number(process.env.AI_TEMPERATURE || "0.7");
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: temp,
      maxOutputTokens: Number(process.env.AI_MAX_TOKENS || "1000"),
    },
  });
}

/**
 * Generates an embedding vector for a given text.
 * @param text The input string to embed
 */
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const embeddingModel = genAI.getGenerativeModel({ model: DEFAULT_EMBEDDING });
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("❌ Error generating embedding from Gemini:", error);
    throw error;
  }
}
