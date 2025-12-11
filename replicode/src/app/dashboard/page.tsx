"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Code } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("ui2code_token") || "" : "";
  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center px-6">
      <div className="auth-bg"><div className="grid" /><div className="orb orb--blue" /><div className="orb orb--purple" /><div className="orb orb--pink" /></div>
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur p-8 shadow">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20">
            <Code className="h-5 w-5 text-blue-400" />
          </span>
          <span className="text-lg font-bold tracking-tight">UI2Code</span>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Dashboard</h1>
        <p className="text-sm text-slate-300 text-center">Welcome to your dashboard.</p>
        {token && <p className="mt-4 text-xs text-slate-400 break-all">Token: {token}</p>}
        <div className="mt-6 flex justify-center gap-4">
          <Link href="/" className="text-blue-400">Home</Link>
          <button onClick={() => { localStorage.removeItem("ui2code_token"); router.push("/auth/login"); }} className="text-blue-400">Log out</button>
        </div>
      </div>
    </main>
  );
}
