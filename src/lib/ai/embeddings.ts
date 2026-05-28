import { getEmbedding } from "./gemini";

/**
 * Embed a single string into a high-dimensional vector.
 */
export async function embedText(text: string): Promise<number[]> {
  return getEmbedding(text);
}

/**
 * Embed an array of strings in parallel.
 */
export async function embedMany(texts: string[]): Promise<number[][]> {
  return Promise.all(texts.map((t) => getEmbedding(t)));
}
