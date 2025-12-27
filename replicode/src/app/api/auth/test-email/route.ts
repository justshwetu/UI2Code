import { NextResponse } from "next/server";
import { sendOtpEmail } from "@/lib/email";
import { generateOtp } from "@/lib/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const to = url.searchParams.get("to");
  const otp = url.searchParams.get("otp") || generateOtp();
  if (!to) return NextResponse.json({ error: "Missing 'to' query param" }, { status: 400 });

  try {
    const result = await sendOtpEmail(to, otp, "Nodemailer Test");
    return NextResponse.json({ ok: result.sent, id: result.id, otp, previewUrl: result.previewUrl });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { to, otp } = await req.json();
  if (!to) return NextResponse.json({ error: "Missing 'to' field" }, { status: 400 });
  const code = otp || generateOtp();
  try {
    const result = await sendOtpEmail(to, code, "Nodemailer Test");
    return NextResponse.json({ ok: result.sent, id: result.id, otp: code, previewUrl: result.previewUrl });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
