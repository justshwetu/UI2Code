import nodemailer from "nodemailer";

type SendResult = { sent: boolean; id?: string; previewUrl?: string };

export async function sendOtpEmail(to: string, otp: string, subject: string): Promise<SendResult> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM || user || "no-reply@example.com";

  if (!host || !port || !user || !pass) {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || "no-reply@ui2code.test",
      to,
      subject,
      text: `Your verification code is ${otp}`,
      html: `<div style="font-family:Inter,Arial,sans-serif"><h2>Verification Code</h2><p>Your code is <strong>${otp}</strong>. It expires in 10 minutes.</p></div>`,
    });
    return { sent: true, id: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) || undefined };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text: `Your verification code is ${otp}`,
    html: `<div style="font-family:Inter,Arial,sans-serif"><h2>Verification Code</h2><p>Your code is <strong>${otp}</strong>. It expires in 10 minutes.</p></div>`,
  });

  return { sent: true, id: info.messageId };
}
