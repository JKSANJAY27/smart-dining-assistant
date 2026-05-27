import prisma from "@/lib/prisma";
import type { Session } from "@prisma/client";

const SESSION_TTL_HOURS = parseInt(process.env.SESSION_TTL_HOURS || "4");

/** Get or create a session for a tableId */
export async function getOrCreateSession(tableId: string): Promise<Session> {
  // Try to find an active session for this table
  const existing = await prisma.session.findFirst({
    where: {
      tableId,
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) return existing;

  // Create a new session
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_TTL_HOURS);

  return prisma.session.create({
    data: {
      tableId,
      status: "ACTIVE",
      preferences: {},
      expiresAt,
    },
  });
}

/** Get session by ID */
export async function getSessionById(sessionId: string): Promise<Session | null> {
  return prisma.session.findUnique({ where: { id: sessionId } });
}

/** Update session preferences */
export async function updateSessionPreferences(
  sessionId: string,
  key: string,
  value: unknown
): Promise<Session> {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) throw new Error("Session not found");

  const currentPrefs = (session.preferences as Record<string, unknown>) || {};
  const updatedPrefs = { ...currentPrefs, [key]: value };

  return prisma.session.update({
    where: { id: sessionId },
    data: { preferences: updatedPrefs as any },
  });
}

/** Update conversation summary */
export async function updateConversationSummary(
  sessionId: string,
  summary: string
): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId },
    data: { conversationSummary: summary },
  });
}

/** Close/complete a session */
export async function closeSession(sessionId: string): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId },
    data: { status: "ORDERED" },
  });
}

/** Increment guest count */
export async function incrementGuestCount(sessionId: string): Promise<number> {
  const updated = await prisma.session.update({
    where: { id: sessionId },
    data: { guestCount: { increment: 1 } },
  });
  return updated.guestCount;
}

/** Save a message to conversation history */
export async function saveMessage(
  sessionId: string,
  role: "USER" | "ASSISTANT" | "SYSTEM",
  content: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  await prisma.message.create({
    data: { sessionId, role, content, metadata: metadata as any },
  });
}

/** Get last N messages for context */
export async function getRecentMessages(sessionId: string, limit = 10) {
  return prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
