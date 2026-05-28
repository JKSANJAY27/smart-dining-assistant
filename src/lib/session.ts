import { cookies } from "next/headers";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "smart_dining_jwt_secret_key_32chars!";
const SESSION_COOKIE_NAME = "smart_dining_session";
const SESSION_TTL_HOURS = parseInt(process.env.SESSION_TTL_HOURS || "4");

interface SessionPayload {
  sessionId: string;
  tableId: string;
}

/** Create a simple signed token (JWT-like: payload.signature) */
export function signToken(payload: SessionPayload): string {
  const jsonStr = JSON.stringify({
    ...payload,
    exp: Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000,
  });
  const encodedPayload = Buffer.from(jsonStr).toString("base64url");
  
  const hmac = crypto.createHmac("sha256", JWT_SECRET);
  hmac.update(encodedPayload);
  const signature = hmac.digest("base64url");
  
  return `${encodedPayload}.${signature}`;
}

/** Verify and parse a signed token */
export function verifyToken(token: string): SessionPayload | null {
  if (!token) return null;
  
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  
  const [encodedPayload, signature] = parts;
  
  // Verify signature
  const hmac = crypto.createHmac("sha256", JWT_SECRET);
  hmac.update(encodedPayload);
  const expectedSignature = hmac.digest("base64url");
  
  if (signature !== expectedSignature) {
    return null; // Signature mismatch
  }
  
  // Parse and check expiration
  try {
    const jsonStr = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const payload = JSON.parse(jsonStr);
    
    if (payload.exp < Date.now()) {
      return null; // Token expired
    }
    
    return {
      sessionId: payload.sessionId,
      tableId: payload.tableId,
    };
  } catch (error) {
    return null;
  }
}

/** Set the session cookie in Next.js Route Handlers or Server Actions */
export async function setSessionCookie(sessionId: string, tableId: string) {
  const token = signToken({ sessionId, tableId });
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_HOURS * 60 * 60, // in seconds
  });
}

/** Get the active session from cookies */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!cookie || !cookie.value) return null;
  
  return verifyToken(cookie.value);
}

/** Clear the session cookie */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
