import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  Sparkles,
  X,
  Send,
  Trash2,
  Bot,
  User,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  Info
} from "lucide-react";
import api from "../api";

export default function AIChatbot() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "msg_init",
      role: "assistant",
      content: "Namaste! I am **KIRANAS AI**, your smart store assistant. I am connected directly to your store inventory, counter sales, supplier lead times, and demand predictions.\n\nAsk me anything about your stock, what needs to be reordered today, dead stock risks, or supplier purchase orders!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [engineInfo, setEngineInfo] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  // Load chat history from backend on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.get("/ai/history");
        if (res.data?.history && res.data.history.length > 0) {
          setMessages(
            res.data.history.map((m) => ({
              ...m,
              timestamp: m.timestamp
                ? new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }))
          );
        }
      } catch (err) {
        console.warn("Could not fetch AI history:", err.message);
      }
    }
    loadHistory();
  }, []);

  // Suggested prompt chips
  const suggestedPrompts = [
    { label: "📦 Reorder today", query: "Which products should I reorder today?" },
    { label: "⚠️ Dead stock status", query: "What is my dead stock status and frozen capital?" },
    { label: "🔥 Top fast sellers", query: "Show top 5 fast-moving FMCG items" },
    { label: "🚨 Stockout shortages", query: "Are there any expected stock shortages or low inventory?" },
    { label: "💰 Today's sales trend", query: "What is our today's counter revenue and sales trend?" },
    { label: "🚚 Supplier orders", query: "List active supplier purchase orders and delivery status" }
  ];

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMessage = {
      id: `msg_u_${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      const res = await api.post("/ai/chat", { message: query });
      const assistantMessage = {
        id: `msg_a_${Date.now()}`,
        role: "assistant",
        content: res.data.reply,
        engine: res.data.engine,
        timestamp: res.data.timestamp
          ? new Date(res.data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setEngineInfo(res.data.engine);
    } catch (err) {
      const errorMessage = {
        id: `msg_err_${Date.now()}`,
        role: "assistant",
        content: `⚠️ **Error:** ${err.response?.data?.message || "Could not retrieve response from KIRANAS AI. Please verify backend connection."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.delete("/ai/history");
      setMessages([
        {
          id: `msg_init_${Date.now()}`,
          role: "assistant",
          content: "Chat history cleared. How can I help you manage your store today?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err) {
      console.warn("Failed to clear history:", err.message);
    }
  };

  // Helper to format basic markdown (bold, lists, headings, tables)
  const formatMessage = (content) => {
    const lines = content.split("\n");
    const elements = [];
    let tableBuffer = [];
    let inTable = false;

    const renderTable = (rows, key) => {
      if (rows.length < 2) return null;
      const headers = rows[0].split("|").filter((c) => c.trim().length > 0).map((c) => c.trim());
      const bodyRows = rows.slice(2).map((r) => r.split("|").filter((c) => c.trim().length > 0).map((c) => c.trim()));

      return (
        <div key={key} className="overflow-x-auto my-3 border border-slate-200 rounded-xl">
          <table className="w-full text-[11px] text-left border-collapse bg-white">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="p-2 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/70">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2">
                      {cell.replace(/\*\*/g, "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Check Table
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        inTable = true;
        tableBuffer.push(trimmed);
        return;
      } else if (inTable) {
        elements.push(renderTable(tableBuffer, `tbl_${idx}`));
        tableBuffer = [];
        inTable = false;
      }

      // Headings
      if (trimmed.startsWith("### ")) {
        elements.push(
          <h4 key={idx} className="text-xs sm:text-sm font-black text-emerald-950 mt-2 mb-1 flex items-center gap-1.5">
            {trimmed.replace("### ", "")}
          </h4>
        );
      } else if (trimmed.startsWith("## ")) {
        elements.push(
          <h3 key={idx} className="text-sm font-black text-emerald-950 mt-2.5 mb-1.5">
            {trimmed.replace("## ", "")}
          </h3>
        );
      } else if (trimmed.startsWith("> ")) {
        elements.push(
          <div key={idx} className="my-2 p-2.5 bg-emerald-50/90 border-l-4 border-emerald-600 rounded-r-xl text-[11px] text-emerald-900 font-medium">
            {trimmed.replace("> ", "").replace(/\*\*/g, "")}
          </div>
        );
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const itemText = trimmed.slice(2);
        elements.push(
          <li key={idx} className="text-xs leading-relaxed text-slate-700 ml-4 list-disc my-0.5">
            <span dangerouslySetInnerHTML={{ __html: itemText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
          </li>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        const itemText = trimmed.replace(/^\d+\.\s/, "");
        elements.push(
          <li key={idx} className="text-xs leading-relaxed text-slate-700 ml-4 list-decimal my-0.5">
            <span dangerouslySetInnerHTML={{ __html: itemText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
          </li>
        );
      } else if (trimmed.length > 0) {
        elements.push(
          <p key={idx} className="text-xs leading-relaxed text-slate-700 my-1">
            <span dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
          </p>
        );
      }
    });

    if (inTable && tableBuffer.length > 0) {
      elements.push(renderTable(tableBuffer, `tbl_end`));
    }

    return elements;
  };

  // Hide floating chatbot on login & register pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  return (
    <>
      {/* ===================================================
          1. FLOATING ACTION TRIGGER BUTTON (BOTTOM-RIGHT)
          =================================================== */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-tr from-emerald-800 via-emerald-700 to-emerald-600 hover:from-emerald-900 hover:to-emerald-700 text-white rounded-full shadow-2xl shadow-emerald-900/40 border-2 border-emerald-300/40 hover:scale-105 active:scale-95 transition-all duration-200 group cursor-pointer"
          title="Open KIRANAS AI Assistant"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 border-2 border-emerald-800 rounded-full animate-ping" />
            )}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-black tracking-tight flex items-center gap-1.5">
              <span>KIRANAS AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            </div>
            <div className="text-[10px] text-emerald-100/90 font-medium leading-none mt-0.5">
              Smart Store Assistant
            </div>
          </div>
        </button>
      )}

      {/* ===================================================
          2. FLOATING CHAT WINDOW MODAL
          =================================================== */}
      {isOpen && (
        <div className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-50 w-[94vw] sm:w-[410px] h-[580px] max-h-[88vh] bg-white rounded-3xl shadow-2xl shadow-slate-900/30 border border-slate-200/90 flex flex-col overflow-hidden animate-fade-in select-text">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-950/40 ring-2 ring-emerald-300/30">
                <Bot size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black tracking-tight text-white">KIRANAS AI</h3>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-400/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Data
                  </span>
                </div>
                <p className="text-[10px] text-emerald-200/80 font-medium">
                  Your Smart Store Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearHistory}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800/60 rounded-lg transition"
                title="Clear Chat History"
              >
                <Trash2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800/60 rounded-lg transition"
                title="Minimize Chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/40">
            {/* Suggested Question Chips (Always handy at the top) */}
            <div className="space-y-1.5 pb-2 border-b border-slate-100">
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} className="text-emerald-700" />
                <span>Suggested Questions:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestedPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(p.query)}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-lg text-[10px] font-semibold transition-all duration-150 shadow-xs cursor-pointer text-left"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Flow */}
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-end gap-1.5 max-w-[92%]">
                    {!isUser && (
                      <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 mb-1 shadow-xs">
                        <Bot size={13} />
                      </div>
                    )}

                    <div
                      className={`p-3 rounded-2xl text-xs shadow-xs ${
                        isUser
                          ? "bg-slate-900 text-white rounded-br-xs"
                          : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs"
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      ) : (
                        <div className="space-y-1">{formatMessage(m.content)}</div>
                      )}
                    </div>
                  </div>

                  <span className="text-[9px] text-slate-400 mt-1 px-1">
                    {m.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot size={13} />
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-bl-xs shadow-xs flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">
                    Analyzing store telemetry & forecasting...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about stock, reorders, dead stock..."
                disabled={loading}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition shadow-xs"
              />

              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="w-9 h-9 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 transition active:scale-95 cursor-pointer"
                title="Send Message"
              >
                <Send size={15} />
              </button>
            </form>

            <div className="text-center mt-1.5 text-[9px] text-slate-400 flex items-center justify-center gap-1">
              <Info size={10} />
              <span>Grounded in live Kirana database & mathematical forecasting.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
