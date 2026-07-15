import { Request, Response } from "express";
import { ChatService } from "../../services/user/chat.service";

const chatService = new ChatService();

/** POST /api/v1/users/chat */
export const sendChatMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const message = String(req.body?.message || "").trim();
    if (!message) {
      return res.status(400).json({ message: "message is required" });
    }

    const history = Array.isArray(req.body?.history) ? req.body.history : [];

    const result = await chatService.chat(userId, message, history);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error("Chat error:", err?.message || err);
    const raw = String(err?.message || "");
    let status = err?.status || 500;
    let message = raw || "Failed to get AI response";

    if (raw.includes("429") || /quota|rate.?limit/i.test(raw)) {
      status = 429;
      message = "AI quota exceeded. Please wait a minute and try again.";
    } else if (raw.includes("API_KEY") || /api key|permission/i.test(raw)) {
      status = 500;
      message = "AI API key is invalid or not configured.";
    }

    return res.status(status).json({ message });
  }
};
