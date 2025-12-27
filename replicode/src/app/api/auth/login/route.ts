import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPassword, generateOtp, users as memUsers, pendingLogins as memPending } from "@/lib/store";
import { sendOtpEmail } from "@/lib/email";
import { getDb, usersCol, pendingLoginsCol } from "@/lib/db";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { email, password } = parsed.data;
  try {
    const db = await getDb();
    const users = usersCol(db);
    const user = await users.findOne({ email });
    if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });
    if (!verifyPassword(password, user.passwordHash as string, user.salt as string)) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const otp = generateOtp();
    const expiresMs = Date.now() + 10 * 60 * 1000;
    const pending = pendingLoginsCol(db);
    await pending.updateOne(
      { email },
      { $set: { email, otp, expiresAt: new Date(expiresMs) } },
      { upsert: true }
    );
    const result = await sendOtpEmail(email, otp, "Verify your login");
    const includeDevOtp = process.env.SHOW_DEV_OTP === "true" || !!result.previewUrl;
    return NextResponse.json({ ok: true, previewUrl: result.previewUrl, ...(includeDevOtp ? { devOtp: otp } : {}) });
  } catch {
    const user = memUsers.get(email);
    if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });
    if (!verifyPassword(password, user.passwordHash, user.salt)) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    const otp = generateOtp();
    const expiresMs = Date.now() + 10 * 60 * 1000;
    memPending.set(email, { email, otp, expiresAt: expiresMs });
    const result = await sendOtpEmail(email, otp, "Verify your login");
    const includeDevOtp = process.env.SHOW_DEV_OTP === "true" || !!result.previewUrl;
    return NextResponse.json({ ok: true, previewUrl: result.previewUrl, fallback: true, ...(includeDevOtp ? { devOtp: otp } : {}) });
  }
}
