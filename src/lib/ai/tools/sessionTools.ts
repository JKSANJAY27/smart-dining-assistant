import { getPreferences, updatePreference, type UserPreferences } from "../agents/contextMemoryAgent";
import { getSessionById } from "@/lib/db/session";

/**
 * Tool wrapper to load the full session entity.
 */
export async function getSessionContextTool(sessionId: string) {
  return getSessionById(sessionId);
}

/**
 * Tool wrapper to load current user preferences.
 */
export async function getPreferencesTool(sessionId: string) {
  return getPreferences(sessionId);
}

/**
 * Tool wrapper to update a specific preference.
 */
export async function updatePreferenceTool<K extends keyof UserPreferences>(
  sessionId: string,
  key: K,
  value: UserPreferences[K]
) {
  return updatePreference(sessionId, key, value);
}
