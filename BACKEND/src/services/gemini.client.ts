import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Prefer env model first, then fallbacks when Google returns 503 / overload / 404.
 * Only includes models listed by ListModels on current Gemini API keys.
 */
export function geminiModelCandidates(): string[] {
  const preferred = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const fallbacks = [
    preferred,
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-flash-lite-latest",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.0-flash-lite",
    "gemini-flash-latest",
  ];
  return [...new Set(fallbacks.filter(Boolean))];
}

function errorMessage(err: unknown): string {
  return String((err as { message?: string })?.message || err || "");
}

function isRetryableGeminiError(err: unknown): boolean {
  const msg = errorMessage(err);
  return (
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("404") ||
    /not found|high demand|unavailable|overloaded|rate.?limit|quota|try again/i.test(msg)
  );
}

function friendlyGeminiError(err: unknown): { status: number; message: string } {
  const raw = errorMessage(err);
  if (raw.includes("429") || /quota|rate.?limit/i.test(raw)) {
    return { status: 429, message: "AI quota exceeded. Please wait a minute and try again." };
  }
  if (raw.includes("503") || /high demand|unavailable|overloaded/i.test(raw)) {
    return { status: 503, message: "AI is busy right now. Please try again in a few seconds." };
  }
  if (raw.includes("404") || /not found/i.test(raw)) {
    return { status: 502, message: "AI model is unavailable. Please try again shortly." };
  }
  if (/API_KEY|api key|permission|401|403/i.test(raw)) {
    return { status: 500, message: "AI API key is invalid or not configured." };
  }
  return { status: 502, message: "Failed to get AI response. Please try again." };
}

export async function generateGeminiText(opts: {
  systemInstruction: string;
  contents: Array<{ role: string; parts: Array<{ text: string }> }>;
  maxOutputTokens?: number;
  temperature?: number;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw { status: 500, message: "GEMINI_API_KEY is not configured on the server" };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const models = geminiModelCandidates();
  let lastError: unknown;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: opts.systemInstruction,
      });

      const result = await model.generateContent({
        contents: opts.contents,
        generationConfig: {
          maxOutputTokens: opts.maxOutputTokens ?? 512,
          temperature: opts.temperature ?? 0.4,
        },
      });

      const reply = result.response.text()?.trim();
      if (!reply) {
        throw { status: 502, message: "Empty response from AI" };
      }
      return reply;
    } catch (err) {
      lastError = err;
      if (!isRetryableGeminiError(err)) {
        throw friendlyGeminiError(err);
      }
      console.warn(
        `Gemini model ${modelName} failed, trying next fallback...`,
        errorMessage(err).slice(0, 160)
      );
    }
  }

  throw friendlyGeminiError(lastError);
}
