import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, pendingSignupsCol, usersCol } from "@/lib/db";
import { pendingSignups as memPending, users as memUsers, parsePendingToken } from "@/lib/store";
import { PendingPayload } from "@/types/auth";

const verifySchema = z.object({ email: z.string().email(), otp: z.string().length(6) });

function isPendingPayload(x: Record<string, unknown> | null): x is PendingPayload {
  return !!x && typeof x.email === "string" && typeof x.passwordHash === "string" && typeof x.salt === "string" && typeof x.otp === "string" && typeof x.expiresAt === "number";
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { email, otp } = parsed.data;
  try {
    const db = await getDb();
    const pendingCol = pendingSignupsCol(db);
    const pending = await pendingCol.findOne({ email });
    if (!pending) return NextResponse.json({ error: "No pending signup" }, { status: 404 });
    const expires = pending.expiresAt instanceof Date ? pending.expiresAt.getTime() : (pending.expiresAt as number);
    if (expires < Date.now()) return NextResponse.json({ error: "Code expired" }, { status: 410 });
    if ((pending.otp as string) !== otp) return NextResponse.json({ error: "Incorrect code" }, { status: 401 });

    const users = usersCol(db);
    await users.insertOne({ email, passwordHash: pending.passwordHash, salt: pending.salt, createdAt: Date.now() });
    await pendingCol.deleteOne({ email });
    return NextResponse.json({ ok: true });
  } catch {
    const pendingToken = (body as { pendingToken?: string }).pendingToken;
    const decoded = parsePendingToken(pendingToken);
    const pending = isPendingPayload(decoded) && decoded.email === email ? decoded : memPending.get(email);
    if (!pending) return NextResponse.json({ error: "No pending signup" }, { status: 404 });
    if (pending.expiresAt < Date.now()) return NextResponse.json({ error: "Code expired" }, { status: 410 });
    if (pending.otp !== otp) return NextResponse.json({ error: "Incorrect code" }, { status: 401 });
    memUsers.set(email, { email, passwordHash: pending.passwordHash, salt: pending.salt, createdAt: Date.now() });
    memPending.delete(email);
    return NextResponse.json({ ok: true, fallback: true });
  }
}
