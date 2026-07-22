import * as dotenv from "dotenv";
dotenv.config({ path: "C:\\Users\\User\\Desktop\\mediconnect\\BACKEND\\.env" });

import { generateGeminiText } from "../services/gemini.client";

async function run() {
  try {
    console.log("Calling generateGeminiText...");
    const reply = await generateGeminiText({
      systemInstruction: "You are a helpful assistant.",
      contents: [{ role: "user", parts: [{ text: "Hello, respond in one word." }] }],
    });
    console.log("Result from generateGeminiText:", reply);
  } catch (err: any) {
    console.error("generateGeminiText failed:", err);
  }
}

run();
