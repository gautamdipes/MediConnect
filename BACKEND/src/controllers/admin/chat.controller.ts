import { Request, Response } from "express";
import { AdminChatService, ChatHistoryItem } from "../../services/admin/chat.service";

const chatService = new AdminChatService();

/** POST /api/v1/admin/chat */
export const sendAdminChatMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const message = String(req.body?.message || "").trim();
    if (!message) {
      return res.status(400).json({ message: "message is required" });
    }
    if (message.length > 2000) {
      return res.status(400).json({ message: "message is too long" });
    }

    const history = (Array.isArray(req.body?.history) ? req.body.history : []) as ChatHistoryItem[];
    const result = await chatService.chat(userId, message, history);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error("Admin chat error:", err?.message || err);
    const raw = String(err?.message || err || "");
    let status = typeof err?.status === "number" ? err.status : 500;
    let message = err?.message || "Failed to get AI response";

    if (raw.includes("429") || /quota|rate.?limit/i.test(raw)) {
      status = 429;
      message = "AI quota exceeded. Please wait a minute and try again.";
    } else if (raw.includes("503") || /high demand|unavailable|overloaded|busy/i.test(raw)) {
      status = 503;
      message = "AI is busy right now. Please try again in a few seconds.";
    } else if (/API_KEY_INVALID|api key|API key not valid/i.test(raw)) {
      status = 500;
      message = "AI API key is invalid or not configured.";
    } else if (/GEMINI_API_KEY is not configured/i.test(raw)) {
      status = 500;
      message = "GEMINI_API_KEY is not configured on the server";
    }

    return res.status(status).json({ message });
  }
};
