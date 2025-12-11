import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, generateOtp, pendingSignups as memPending, users as memUsers, makePendingToken } from "../../auth/store";
import { sendOtpEmail } from "../../auth/email";
import { getDb, usersCol, pendingSignupsCol } from "../../auth/db";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { email, password } = parsed.data;
  try {
    const db = await getDb();
    const users = usersCol(db);
    const existing = await users.findOne({ email });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const { hash, salt } = hashPassword(password);
    const otp = generateOtp();
    const expiresMs = Date.now() + 10 * 60 * 1000;

    const pending = pendingSignupsCol(db);
    await pending.updateOne(
      { email },
      { $set: { email, passwordHash: hash, salt, otp, expiresAt: new Date(expiresMs) } },
      { upsert: true }
    );

    const result = await sendOtpEmail(email, otp, "Verify your signup");
    const pendingToken = makePendingToken({ email, passwordHash: hash, salt, otp, expiresAt: expiresMs });
    const includeDevOtp = process.env.SHOW_DEV_OTP === "true" || !!result.previewUrl;
    return NextResponse.json({ ok: true, previewUrl: result.previewUrl, pendingToken, ...(includeDevOtp ? { devOtp: otp } : {}) });
  } catch {
    const { hash, salt } = hashPassword(password);
    const otp = generateOtp();
    const expiresMs = Date.now() + 10 * 60 * 1000;
    if (memUsers.has(email)) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    memPending.set(email, { email, passwordHash: hash, salt, otp, expiresAt: expiresMs });
    const result = await sendOtpEmail(email, otp, "Verify your signup");
    const pendingToken = makePendingToken({ email, passwordHash: hash, salt, otp, expiresAt: expiresMs });
    const includeDevOtp = process.env.SHOW_DEV_OTP === "true" || !!result.previewUrl;
    return NextResponse.json({ ok: true, previewUrl: result.previewUrl, pendingToken, fallback: true, ...(includeDevOtp ? { devOtp: otp } : {}) });
  }
}
