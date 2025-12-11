// test-backend.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testMyCode() {
  console.log("🚀 Testing your AI Engine...");

  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ Error: No API Key found in .env.local");
    return;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // A simple test prompt to simulate an image request
  const prompt = "Generate a code snippet for a blue login button in HTML/Tailwind.";

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("\n✅ SUCCESS! Here is the code your API generated:\n");
    console.log(text);
    console.log("\n------------------------------------------------");
    console.log("Your backend is ALIVE. Now tell Person 1 to connect the UI!");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Error:", message);
  }
}

testMyCode();
