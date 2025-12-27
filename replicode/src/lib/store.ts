import crypto from "crypto";
import { User, PendingSignup, PendingLogin, Session } from "@/types/auth";

export const users = new Map<string, User>();
export const pendingSignups = new Map<string, PendingSignup>();
export const pendingLogins = new Map<string, PendingLogin>();
export const sessions = new Map<string, Session>();

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
}

export function createSession(email: string): string {
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, { email, createdAt: Date.now() });
  return token;
}

export function makePendingToken(payload: Record<string, unknown>): string {
  const secret = process.env.PENDING_SECRET || "dev-pending-secret";
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function parsePendingToken(token?: string): Record<string, unknown> | null {
  if (!token) return null;
  const secret = process.env.PENDING_SECRET || "dev-pending-secret";
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const json = Buffer.from(data, "base64url").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}
