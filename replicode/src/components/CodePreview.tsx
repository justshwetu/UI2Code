"use client";
import React, { useMemo } from 'react';

interface CodePreviewProps {
  code: string;
  mode: 'html' | 'react';
}

export default function CodePreview({ code, mode }: CodePreviewProps) {
  const srcDoc = useMemo(() => {
    if (!code) return "";

    if (mode === 'react' || code.includes("import") || code.includes("export default")) {
      return `
        <div style="font-family: sans-serif; padding: 40px; text-align: center; color: #666;">
          <h2 style="color: #333; margin-bottom: 10px;">React Component Generated</h2>
          <p>Browsers cannot render raw JSX (React) code directly.</p>
          <p>Please switch to the <strong>Raw Code</strong> tab to copy it into your project.</p>
          <div style="margin-top: 20px; padding: 20px; background: #f3f4f6; border-radius: 8px; text-align: left; font-family: monospace; font-size: 12px; overflow: hidden; opacity: 0.7;">
            ${code.substring(0, 150)}...
          </div>
        </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>body { background-color: white; }</style>
        </head>
        <body>
          ${code}
        </body>
      </html>
    `;
  }, [code, mode]);

  return (
    <div className="w-full h-full min-h-[500px] bg-white">
      <iframe 
        srcDoc={srcDoc}
        className="w-full h-full border-none" 
        title="Preview" 
        sandbox="allow-scripts"
      />
    </div>
  );
}
