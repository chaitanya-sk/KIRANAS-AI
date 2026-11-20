import express from "express";
import {
  processAIChat,
  getConversationHistory,
  clearConversationHistory
} from "../services/aiService.js";

const router = express.Router();

// Simple in-memory rate limiter (30 requests per minute per IP)
const rateLimits = new Map();
function rateLimiter(req, res, next) {
  const ip = req.ip || req.headers["x-forwarded-for"] || "local";
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 40;

  let record = rateLimits.get(ip);
  if (!record || now - record.startTime > windowMs) {
    record = { count: 1, startTime: now };
    rateLimits.set(ip, record);
  } else {
    record.count++;
  }

  if (record.count > maxRequests) {
    return res.status(429).json({
      message: "Too many AI assistant requests. Please wait a minute before sending more queries."
    });
  }
  next();
}

/**
 * POST /api/ai/chat
 * Process shopkeeper question grounded in live database telemetry
 */
router.post("/chat", rateLimiter, async (req, res) => {
  try {
    const { message, sessionId } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Message cannot be empty." });
    }

    const sessionKey = sessionId || req.user?.id || req.user?.email || "default_storekeeper";
    const isDbConnected = req.app.locals.isDbConnected ?? false;
    const memoryStore = req.app.locals.memoryStore ?? null;

    const result = await processAIChat({
      message,
      sessionId: sessionKey,
      isDbConnected,
      memoryStore
    });

    return res.json({
      success: true,
      reply: result.reply,
      engine: result.engine,
      llmConfigured: result.llmConfigured,
      summarySnapshot: result.summarySnapshot,
      timestamp: result.timestamp
    });
  } catch (err) {
    console.error("AI Chat Route Error:", err);
    return res.status(500).json({
      message: err.message || "Failed to process question with AI Assistant."
    });
  }
});

/**
 * GET /api/ai/history
 * Retrieve conversation history for current session
 */
router.get("/history", (req, res) => {
  try {
    const sessionKey = req.query.sessionId || req.user?.id || req.user?.email || "default_storekeeper";
    const history = getConversationHistory(sessionKey);
    return res.json({
      success: true,
      history
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to retrieve chat history." });
  }
});

/**
 * DELETE /api/ai/history
 * Clear conversation history for current session
 */
router.delete("/history", (req, res) => {
  try {
    const sessionKey = req.query.sessionId || req.body?.sessionId || req.user?.id || req.user?.email || "default_storekeeper";
    const result = clearConversationHistory(sessionKey);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: "Failed to clear chat history." });
  }
});

export default router;
