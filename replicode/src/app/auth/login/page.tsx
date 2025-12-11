"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Code } from "lucide-react";

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [token] = useState("");

  const submitLogin = async () => {
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) { setMessage("Invalid input"); return; }
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
    const data = await res.json();
    setLoading(false);
    if (data.ok) setOtpSent(true); else setMessage(data.error || "Error");
  };

  const verifyOtp = async () => {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/auth/verify-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp }) });
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      if (data.token) localStorage.setItem("ui2code_token", data.token);
      router.push("/dashboard");
    } else setMessage(data.error || "Error");
  };

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center px-6">
      <div className="auth-bg"><div className="grid" /><div className="orb orb--blue" /><div className="orb orb--purple" /><div className="orb orb--pink" /></div>
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur p-8 shadow transition-transform duration-300 hover:-translate-y-0.5">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20">
            <Code className="h-5 w-5 text-blue-400" />
          </span>
          <span className="text-lg font-bold tracking-tight">UI2Code</span>
        </div>
        <h1 className="text-2xl font-bold text-center">Log in</h1>
        {!otpSent ? (
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-slate-300">Email</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="mt-1 w-full rounded-lg bg-slate-800 text-slate-200 border border-slate-700 px-3 py-2" placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-sm text-slate-300">Password</label>
              <input value={password} onChange={e=>setPassword(e.target.value)} type="password" className="mt-1 w-full rounded-lg bg-slate-800 text-slate-200 border border-slate-700 px-3 py-2" placeholder="at least 8 characters" />
            </div>
            <button onClick={submitLogin} disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 shadow-lg shadow-blue-900/30">{loading ? "Please wait" : "Continue"}</button>
            <p className="text-sm text-slate-400">No account? <Link href="/auth/signup" className="text-blue-400">Sign up</Link></p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-slate-300">Enter the 6-digit code sent to your email.</p>
            <input value={otp} onChange={e=>setOtp(e.target.value)} maxLength={6} className="mt-1 w-full rounded-lg bg-slate-800 text-slate-200 border border-slate-700 px-3 py-2 tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-700" />
            <button onClick={verifyOtp} disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 shadow-lg shadow-blue-900/30">{loading ? "Verifying" : "Verify"}</button>
            {token && <p className="text-xs text-slate-400 break-all">Token: {token}</p>}
          </div>
        )}
        {message && <p className="mt-4 text-sm text-slate-300">{message}</p>}
      </div>
    </main>
  );
}
