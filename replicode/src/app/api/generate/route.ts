import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { image, mode } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "No API Key" }, { status: 500 });
    }

    console.log("🚀 Calling Google API (Gemini 2.5)...");

    const headerMatch = image.match(/^data:(image\/[^;]+);base64,/);
    const mimeType = headerMatch ? headerMatch[1] : "image/jpeg";
    const base64Data = image.replace(/^data:image\/[^;]+;base64,/, "");

    const payload = {
      contents: [{
        parts: [
          {
            text: `You are an expert Frontend Developer. Analyze this UI screenshot.
Generate ${mode === 'react' ? 'React component code' : 'HTML/Tailwind code'} to replicate it exactly.

RULES:
- Use Tailwind CSS for styling.
- Use <img src="https://placehold.co/600x400" /> for images.
- Return ONLY the raw code string. Do NOT use markdown backticks.`
          },
          { inline_data: { mime_type: mimeType, data: base64Data } }
        ]
      }]
    };

    const primaryModel = "gemini-2.5-flash";
    const fallbackModel = "gemini-1.5-flash";

    let response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${primaryModel}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    let data = await response.json();

    const fallbackHtml = `\n<div class=\"min-h-screen flex items-center justify-center bg-white\">\n  <div class=\"p-8 rounded-xl border text-gray-700\">\n    <h2 class=\"text-xl font-bold mb-2\">No code generated</h2>\n    <p class=\"text-sm\">Try another screenshot or switch mode.</p>\n  </div>\n</div>`;

    if (!response.ok || data?.error) {
      const msg = typeof data?.error?.message === "string" ? data.error.message : "";
      const m = msg.match(/Please retry in\s+([0-9.]+)s/);
      const retryAfter = m ? Math.ceil(Number(m[1])) : undefined;
      const retryable = /overloaded|Please retry in/i.test(msg || "");

      if (retryable) {
        const waitMs = Math.min((retryAfter || 2) * 1000, 3000);
        await new Promise((r) => setTimeout(r, waitMs));
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${primaryModel}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }
        );
        data = await response.json();
        if (response.ok && !data?.error) {
          const parts = (data?.candidates?.[0]?.content?.parts ?? []) as Array<{ text?: string }>;
          const combined = Array.isArray(parts) ? parts.map((p) => (typeof p.text === "string" ? p.text : "")).join("\n") : "";
          const rawRetry = combined
            ?.replace(/```(html|jsx|tsx|javascript)?/g, "")
            .replace(/```/g, "")
            .trim();
          const sanitize = (input: string) => {
            let out = input;
            out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
            out = out.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
            out = out.replace(/on[a-z]+\s*=\s*(["']).*?\1/gi, "");
            out = out.replace(/javascript:\s*/gi, "");
            return out;
          };
          const codeRetry = rawRetry ? sanitize(rawRetry) : fallbackHtml;
          return NextResponse.json({ code: codeRetry, validated: true });
        }
        // Try older model as a fallback if still overloaded
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${fallbackModel}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }
        );
        data = await response.json();
        if (response.ok && !data?.error) {
          const parts = (data?.candidates?.[0]?.content?.parts ?? []) as Array<{ text?: string }>;
          const combined = Array.isArray(parts) ? parts.map((p) => (typeof p.text === "string" ? p.text : "")).join("\n") : "";
          const rawRetry2 = combined
            ?.replace(/```(html|jsx|tsx|javascript)?/g, "")
            .replace(/```/g, "")
            .trim();
          const sanitize = (input: string) => {
            let out = input;
            out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
            out = out.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
            out = out.replace(/on[a-z]+\s*=\s*(["']).*?\1/gi, "");
            out = out.replace(/javascript:\s*/gi, "");
            return out;
          };
          const codeRetry2 = rawRetry2 ? sanitize(rawRetry2) : fallbackHtml;
          return NextResponse.json({ code: codeRetry2, validated: true });
        }
      }

      const mockHtml = `
<div class="min-h-screen bg-white">
  <header class="px-6 py-4 border-b">
    <h1 class="text-2xl font-bold">Generated UI</h1>
    <p class="text-sm text-gray-500">Mock output shown due to AI error.</p>
  </header>
  <main class="p-6 grid gap-6 md:grid-cols-2">
    <div class="border rounded-xl p-6 shadow-sm">
      <h2 class="text-lg font-semibold mb-2">Card Title</h2>
      <p class="text-gray-600">Placeholder content for preview.</p>
      <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">Primary Action</button>
    </div>
    <div class="border rounded-xl p-6 shadow-sm">
      <h2 class="text-lg font-semibold mb-2">Another Card</h2>
      <p class="text-gray-600">Use a valid API key to get real output.</p>
    </div>
  </main>
</div>`;

      const mockReact = `
import React from "react";

export default function GeneratedUI() {
  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 py-4 border-b">
        <h1 className="text-2xl font-bold">Generated UI</h1>
        <p className="text-sm text-gray-500">Mock output shown due to AI error.</p>
      </header>
      <main className="p-6 grid gap-6 md:grid-cols-2">
        <div className="border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Card Title</h2>
          <p className="text-gray-600">Placeholder content for preview.</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">Primary Action</button>
        </div>
        <div className="border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Another Card</h2>
          <p className="text-gray-600">Use a valid API key to get real output.</p>
        </div>
      </main>
    </div>
  );
}
`;

      const mock = mode === 'react' ? mockReact : mockHtml;
      return NextResponse.json({ code: mock, validated: false, error: msg || "AI error", retryAfter });
    }

    const parts = (data?.candidates?.[0]?.content?.parts ?? []) as Array<{ text?: string }>;
    const combined = Array.isArray(parts) ? parts.map((p) => (typeof p.text === "string" ? p.text : "")).join("\n") : "";
    const raw = combined
      ?.replace(/```(html|jsx|tsx|javascript)?/g, "")
      .replace(/```/g, "")
      .trim();

    const sanitize = (input: string) => {
      let out = input;
      out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
      out = out.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
      out = out.replace(/on[a-z]+\s*=\s*(["']).*?\1/gi, "");
      out = out.replace(/javascript:\s*/gi, "");
      return out;
    };

    const code = raw ? sanitize(raw) : fallbackHtml;

    return NextResponse.json({ code, validated: true });

  } catch {
    const fallbackHtml = `\n<div class=\"min-h-screen flex items-center justify-center bg-white\">\n  <div class=\"p-8 rounded-xl border text-gray-700\">\n    <h2 class=\"text-xl font-bold mb-2\">No code generated</h2>\n    <p class=\"text-sm\">Try another screenshot or switch mode.</p>\n  </div>\n</div>`;
    return NextResponse.json({ code: fallbackHtml, validated: false, error: "Network error" });
  }
}
