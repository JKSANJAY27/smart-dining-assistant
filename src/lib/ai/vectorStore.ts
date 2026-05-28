import { getAllMenuItems } from "@/lib/db/menu";
import { embedText } from "./embeddings";
import { redis } from "@/lib/redis";
import type { MenuItem } from "@prisma/client";

export interface VectorItem {
  menuItem: MenuItem;
  vector: number[];
}

// In-memory cache of embedded menu items
let inMemoryVectors: VectorItem[] = [];
let isInitialized = false;

// Compute dot product of two normalized vectors (Gemini vectors are normalized)
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return dot;
}

/**
 * Build the semantic string to represent a MenuItem.
 */
export function buildItemEmbeddingText(item: MenuItem): string {
  return `
Dish: ${item.name}
Category: ${item.category}
Description: ${item.description || "Fresh and delicious restaurant specialty"}
Tags: ${item.tags.join(", ")}
Allergens: ${item.allergens.length > 0 ? item.allergens.join(", ") : "None"}
Price: ₹${Number(item.price)}
  `.trim();
}

/**
 * Initialize the vector store by loading all menu items,
 * pulling cached embeddings from Redis, and generating any missing ones.
 */
export async function initializeVectorStore(force = false): Promise<void> {
  if (isInitialized && !force && inMemoryVectors.length > 0) {
    return;
  }

  try {
    console.log("🔍 Initializing AI Semantic Vector Store...");
    const items = await getAllMenuItems();
    const loadedVectors: VectorItem[] = [];
    let cacheMisses = 0;

    for (const item of items) {
      const cacheKey = `menu:embedding:${item.id}`;
      let vector: number[] | null = null;

      try {
        // Try fetching from Redis cache
        vector = await redis.get<number[]>(cacheKey);
      } catch (redisError) {
        console.warn("⚠️ Redis fetch failed, falling back to Gemini generation:", redisError);
      }

      if (!vector) {
        // Cache miss: generate embedding using Gemini
        cacheMisses++;
        const textToEmbed = buildItemEmbeddingText(item);
        console.log(`📡 [Gemini Embed] Generating embedding for: ${item.name}...`);
        
        try {
          vector = await embedText(textToEmbed);
          
          // Store back to Redis
          if (vector) {
            await redis.set(cacheKey, vector);
          }
        } catch (embedError) {
          console.error(`❌ Failed to embed item "${item.name}":`, embedError);
          continue;
        }
      }

      if (vector) {
        loadedVectors.push({
          menuItem: item,
          vector,
        });
      }
    }

    inMemoryVectors = loadedVectors;
    isInitialized = true;
    console.log(`✅ AI Vector Store initialized. Total: ${inMemoryVectors.length} items. Cache misses embedded: ${cacheMisses}`);
  } catch (error) {
    console.error("❌ Critical error initializing vector store:", error);
  }
}

/**
 * Search the menu semantically using Cosine Similarity on Gemini embeddings.
 * @param query The natural language search query
 * @param limit The maximum number of matches to return
 * @returns Array of matching menu items with their similarity scores
 */
export async function searchSemanticMenu(
  query: string,
  limit = 6
): Promise<{ menuItem: MenuItem; score: number }[]> {
  if (!isInitialized || inMemoryVectors.length === 0) {
    await initializeVectorStore();
  }

  if (inMemoryVectors.length === 0) {
    console.warn("⚠️ Vector store is empty, returning empty search results.");
    return [];
  }

  try {
    const queryVector = await embedText(query);
    
    const scored = inMemoryVectors.map((item) => {
      const score = cosineSimilarity(queryVector, item.vector);
      return {
        menuItem: item.menuItem,
        score,
      };
    });

    // Sort by descending similarity score
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  } catch (error) {
    console.error("❌ Error during semantic vector search:", error);
    return [];
  }
}
