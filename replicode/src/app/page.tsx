"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CodePreview from "@/components/CodePreview";
import { Loader2, UploadCloud, Code, Image as ImageIcon, Eye, FileCode, Copy as CopyIcon, Download as DownloadIcon, CheckCircle, Brain, BarChart3 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"html" | "react">("html");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const heroUploadRef = useRef<HTMLInputElement>(null);
  const [actionMsg, setActionMsg] = useState<string>("");
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("ui2code_token");
    setIsAuthed(!!t);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateCode = async () => {
    if (!image) return;
    setLoading(true);
    setCode(""); 

    try {
      console.log("🚀 Sending request to backend...");
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, mode }),
      });

      const data = await res.json();
      console.log("✅ Data received:", data);

      if (data.code) {
        setCode(data.code);
        setActiveTab("preview");
      }
    } catch (error) {
      console.error("❌ Error generating code:", error);
      alert("Something went wrong. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setActionMsg("Copied to clipboard");
      setTimeout(() => setActionMsg(""), 2000);
    } catch {
      setActionMsg("Copy failed");
      setTimeout(() => setActionMsg(""), 2000);
    }
  };

  const downloadCode = () => {
    if (!code) return;
    const fileName = mode === "html" ? "generated-ui2code.html" : "GeneratedComponent.tsx";
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setActionMsg("Download started");
    setTimeout(() => setActionMsg(""), 2000);
  };

  const logout = () => {
    localStorage.removeItem("ui2code_token");
    setIsAuthed(false);
    router.push("/auth/login");
  };

  const goLogin = () => {
    router.push("/auth/login");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-black" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20">
                <Code className="h-5 w-5 text-blue-400" />
              </span>
              <span className="text-lg font-bold tracking-tight">UI2Code</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-slate-300">
              <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-white transition">Features</button>
              <button onClick={() => document.getElementById("approach")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-white transition">Approach</button>
              <button onClick={() => document.getElementById("impact")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-white transition">Impact</button>
              <button onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })} className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:bg-slate-200">
                Try Demo
              </button>
              {isAuthed ? (
                <button onClick={logout} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-100 font-semibold hover:bg-slate-700">Log out</button>
              ) : (
                <button onClick={goLogin} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-100 font-semibold hover:bg-slate-700">Log in</button>
              )}
            </div>
          </nav>

          <section className="mt-20 mb-24">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-white max-w-3xl">
              Turn screenshots into clean, production-ready UI code
            </h1>
            <p className="mt-6 text-slate-300 max-w-2xl">
              Upload any UI screenshot and preview auto-generated HTML/Tailwind instantly. Crafted for hackathon velocity with premium dark design and delightful motion.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button onClick={() => heroUploadRef.current?.click()} className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-500">
                Upload Screenshot
              </button>
              <button className="px-5 py-3 rounded-xl bg-slate-800 text-slate-100 font-semibold hover:bg-slate-700">
                Explore Features
              </button>
              <div className="ml-2 flex items-center gap-6 text-slate-400">
                <span>
                  <span className="text-white font-bold">3×</span> faster prototyping
                </span>
                <span>
                  <span className="text-white font-bold">0</span> complex setup
                </span>
              </div>
            </div>
            <input ref={heroUploadRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </section>
        </div>
      </div>

      <section id="features" className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-white mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center gap-2 mb-2 text-blue-400"><CheckCircle className="w-4 h-4" /> Instant Code</div>
            <p className="text-slate-300 text-sm">Upload a screenshot and get HTML/Tailwind or React code in seconds.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center gap-2 mb-2 text-blue-400"><CheckCircle className="w-4 h-4" /> Live Preview</div>
            <p className="text-slate-300 text-sm">Preview HTML output in a sandboxed iframe for rapid iteration.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center gap-2 mb-2 text-blue-400"><CheckCircle className="w-4 h-4" /> Export Ready</div>
            <p className="text-slate-300 text-sm">Copy or download the generated code with one click.</p>
          </div>
        </div>
      </section>

      <section id="approach" className="max-w-7xl mx-auto px-6 mt-12">
        <h2 className="text-2xl font-bold text-white mb-4">Approach</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center gap-2 mb-2 text-purple-400"><Brain className="w-4 h-4" /> Multimodal AI</div>
            <p className="text-slate-300 text-sm">Uses Gemini to interpret UI screenshots and synthesize clean code.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center gap-2 mb-2 text-purple-400"><Brain className="w-4 h-4" /> Validation</div>
            <p className="text-slate-300 text-sm">Zod input checks and structured JSON parsing for predictable outputs.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center gap-2 mb-2 text-purple-400"><Brain className="w-4 h-4" /> DX First</div>
            <p className="text-slate-300 text-sm">Designed for speed with Tailwind, Next.js and minimal friction.</p>
          </div>
        </div>
      </section>

      <section id="impact" className="max-w-7xl mx-auto px-6 mt-12 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center gap-2 mb-2 text-pink-400"><BarChart3 className="w-4 h-4" /> Speed</div>
            <p className="text-slate-300 text-sm">Reduce prototyping time by multiples with instant scaffolds.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center gap-2 mb-2 text-pink-400"><BarChart3 className="w-4 h-4" /> Consistency</div>
            <p className="text-slate-300 text-sm">Stable code formatting yields fewer handoff issues.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center gap-2 mb-2 text-pink-400"><BarChart3 className="w-4 h-4" /> Focus</div>
            <p className="text-slate-300 text-sm">Spend time on product polish instead of boilerplate.</p>
          </div>
        </div>
      </section>
      <section id="demo" className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button onClick={() => setMode("html")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${mode === "html" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"}`}>HTML</button>
            <button onClick={() => setMode("react")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${mode === "react" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"}`}>React</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[800px]">
          <div className="flex flex-col gap-6">
            <div className="flex-1 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-900 flex flex-col items-center justify-center p-8 relative hover:border-blue-500 transition">
              {!image ? (
                <>
                  <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                    <UploadCloud className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-lg font-medium text-slate-200">Upload a screenshot</p>
                </>
              ) : (
                <Image src={image} alt="Preview" width={800} height={600} unoptimized className="max-h-full max-w-full object-contain rounded-lg shadow-sm" />
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>

            <button
              onClick={generateCode}
              disabled={!image || loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-lg font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="animate-spin" /> Generating...</> : "Generate Code 🚀"}
            </button>
          </div>

          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="flex border-b border-slate-800">
              <button 
                onClick={() => setActiveTab("preview")}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'preview' ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-600' : 'text-slate-400'}`}
              >
                <Eye className="w-4 h-4" /> Live Preview
              </button>
              <button 
                onClick={() => setActiveTab("code")}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'code' ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-600' : 'text-slate-400'}`}
              >
                <FileCode className="w-4 h-4" /> Raw Code
              </button>
            </div>
            {code && (
              <div className="flex items-center justify-end gap-2 bg-slate-900 border-b border-slate-800 px-3 py-2">
                <button onClick={copyCode} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 text-slate-100 hover:bg-slate-700 text-xs font-medium">
                  <CopyIcon className="w-3.5 h-3.5" /> Copy
                </button>
                <button onClick={downloadCode} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-500 text-xs font-medium">
                  <DownloadIcon className="w-3.5 h-3.5" /> Download
                </button>
                {actionMsg && <span className="ml-3 text-xs text-slate-400">{actionMsg}</span>}
              </div>
            )}

            <div className="flex-1 relative bg-slate-950 overflow-auto">
              {code ? (
                activeTab === "preview" ? (
                  <CodePreview code={code} mode={mode} />
                ) : (
                  <pre className="p-4 text-xs font-mono text-slate-200 whitespace-pre-wrap">{code}</pre>
                )
              ) : (
                <div className="flex-1 h-full flex flex-col items-center justify-center text-slate-500">
                  <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                  <p>Output will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
