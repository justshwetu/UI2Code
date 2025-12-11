import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, pendingLogins as memPending } from "../../auth/store";
import { getDb, pendingLoginsCol, sessionsCol } from "../../auth/db";

const verifySchema = z.object({ email: z.string().email(), otp: z.string().length(6) });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { email, otp } = parsed.data;
  try {
    const db = await getDb();
    const pending = await pendingLoginsCol(db).findOne({ email });
    if (!pending) return NextResponse.json({ error: "No pending login" }, { status: 404 });
    const expires = pending.expiresAt instanceof Date ? pending.expiresAt.getTime() : (pending.expiresAt as number);
    if (expires < Date.now()) return NextResponse.json({ error: "Code expired" }, { status: 410 });
    if ((pending.otp as string) !== otp) return NextResponse.json({ error: "Incorrect code" }, { status: 401 });

    await pendingLoginsCol(db).deleteOne({ email });
    const token = createSession(email);
    await sessionsCol(db).insertOne({ token, email, createdAt: Date.now() });
    return NextResponse.json({ ok: true, token });
  } catch {
    const pending = memPending.get(email);
    if (!pending) return NextResponse.json({ error: "No pending login" }, { status: 404 });
    if (pending.expiresAt < Date.now()) return NextResponse.json({ error: "Code expired" }, { status: 410 });
    if (pending.otp !== otp) return NextResponse.json({ error: "Incorrect code" }, { status: 401 });
    memPending.delete(email);
    const token = createSession(email);
    return NextResponse.json({ ok: true, token, fallback: true });
  }
}
