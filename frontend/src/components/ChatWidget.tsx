// src/components/ChatWidget.tsx — GearSync dark/neon variant
// Floating + Inline modes, matches Home/About/Services aesthetic
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User as UserIcon, Minus } from "lucide-react";
import { motion } from "framer-motion";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  id?: string;
  ts?: number;
};

interface ChatWidgetProps {
  apiUrl?: string;
  temperature?: number;
  maxTokens?: number;
  title?: string;
  subtitle?: string;
  /** "floating" shows FAB; "inline" embeds the chat panel */
  mode?: "floating" | "inline";
  /** Height (px) for inline mode */
  height?: number;
  /** Extra class for inline wrapper */
  className?: string;
}

// Theme tokens (keep in sync with Home)
const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const PANEL_CLASS =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";

const metaEnv = (import.meta as any).env || {};
const DEFAULT_API_URL = metaEnv.VITE_CHAT_API_URL || "http://localhost:8005/chat";
const DEFAULT_TEMPERATURE = metaEnv.VITE_CHAT_TEMPERATURE ? Number(metaEnv.VITE_CHAT_TEMPERATURE) : 0.7;
const DEFAULT_MAX_TOKENS = metaEnv.VITE_CHAT_MAX_TOKENS ? Number(metaEnv.VITE_CHAT_MAX_TOKENS) : 500;

const PERSIST = true;
const STORAGE_KEY = "chat_widget_history_v3";

function uid() {
  return Math.random().toString(36).slice(2);
}

const QUICK_REPLIES = [
  "Book a service",
  "Available slots today?",
  "Estimate for brake repair",
  "Track my appointment",
];

const ChatWidget: React.FC<ChatWidgetProps> = ({
  apiUrl = DEFAULT_API_URL,
  temperature = DEFAULT_TEMPERATURE,
  maxTokens = DEFAULT_MAX_TOKENS,
  title = "AI Assistant",
  subtitle = "Typically replies in seconds",
  mode = "floating",
  height = 480,
  className = "",
}) => {
  const isInline = mode === "inline";
  const [open, setOpen] = useState(isInline);
  const [minimized, setMinimized] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (!PERSIST) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as ChatMessage[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  const [hasOpened, setHasOpened] = useState(isInline);
  const viewportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Persist
  useEffect(() => {
    if (!PERSIST) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Autoscroll
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, open, minimized, isInline]);

  // ESC to close (floating)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!isInline && e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isInline]);

  // Unread badge when closed
  useEffect(() => {
    if (isInline) return;
    if (!open) {
      const last = messages[messages.length - 1];
      if (last && last.role === "assistant") setUnread((u) => u + 1);
    } else {
      setUnread(0);
    }
  }, [messages, open, isInline]);

  const conversationHistory = useMemo(
    () => messages.map((m) => ({ role: m.role, content: m.content })),
    [messages]
  );

  const parseAssistantText = (json: any): string => {
    if (!json || typeof json !== "object") return "";
    const candidates = [json.reply, json.assistant, json.content, json.message, json.text];
    const found = candidates.find((v) => typeof v === "string" && v.trim().length);
    if (found) return found as string;
    if (json.data && typeof json.data === "object") {
      const deep = [json.data.reply, json.data.assistant, json.data.content, json.data.message, json.data.text];
      const deepFound = deep.find((v) => typeof v === "string" && v.trim().length);
      if (deepFound) return deepFound as string;
    }
    return JSON.stringify(json);
  };

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setError(null);
    setLoading(true);

    const newUserMessage: ChatMessage = { role: "user", content: trimmed, id: uid(), ts: Date.now() };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");

    try {
      const payload = {
        message: trimmed,
        conversation_history: conversationHistory,
        temperature,
        max_tokens: maxTokens,
      };

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const json = await res.json();
      const assistantText = parseAssistantText(json) || "(no response)";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantText, id: uid(), ts: Date.now() },
      ]);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      setError(msg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I had trouble responding.", id: uid(), ts: Date.now() },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [apiUrl, conversationHistory, input, loading, maxTokens, temperature]);

  const autoGrow = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(120, el.scrollHeight) + "px";
  };

  const Panel = (
    <div className={`${PANEL_CLASS} text-white ${isInline ? className : ""}`}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between rounded-t-2xl ${ACCENT_GRADIENT} text-slate-950`}>
        <div>
          <div className="text-sm font-semibold flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/40">
              <Bot className="w-4 h-4" />
            </span>
            {title}
          </div>
          <div className="text-[11px] opacity-90 flex items-center gap-2 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {subtitle}
          </div>
        </div>

        {!isInline && (
          <div className="flex items-center gap-1">
            <button
              className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-white/20 transition"
              onClick={() => setMinimized((m) => !m)}
              aria-label={minimized ? "Expand" : "Minimize"}
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-white/20 transition"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      {(!minimized || isInline) && (
        <>
          <div
            ref={viewportRef}
            className="px-3 py-3 overflow-y-auto space-y-3 bg-gradient-to-b from-slate-950/40 to-slate-900/20"
            style={{ height: isInline ? height : 320 }}
          >
            {messages.length === 0 && (
              <div className="text-xs text-slate-300/90 text-center py-10">
                Start the conversation 👋 — try a quick question below
              </div>
            )}

            {messages.map((m) => (
              <MessageBubble key={m.id} role={m.role} content={m.content} ts={m.ts} />)
            )}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-300/90 px-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Thinking...
              </div>
            )}
          </div>

          {error && (
            <div className="px-3 py-2 text-xs bg-rose-500/10 text-rose-300 border-t border-rose-500/20">
              {error}
            </div>
          )}

          {messages.length === 0 && !loading && (
            <div className="px-3 pb-2 pt-1 flex flex-wrap gap-2">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs px-2.5 py-1.5 rounded-full ring-1 ring-white/10 bg-white/5 hover:bg-white/10"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 border-t border-white/10 bg-white/5 rounded-b-2xl">
            <div className="flex items-end gap-2">
              <div className={`shrink-0 w-8 h-8 rounded-xl ${ACCENT_GRADIENT} text-slate-950 grid place-items-center ring-1 ring-white/10`}>
                <UserIcon className="w-4 h-4" />
              </div>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoGrow(e.currentTarget); }}
                onInput={(e) => autoGrow(e.currentTarget)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 text-sm px-3 py-2 rounded-xl bg-white/5 ring-1 ring-white/10 placeholder:text-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/70 focus:border-transparent resize-none max-h-28"
              />
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="inline-flex items-center justify-center gap-1 text-sm px-3 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed bg-white/10 ring-1 ring-white/10 hover:bg-white/15"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="sr-only">Send</span>
              </motion.button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {isInline && <div className="w-full">{Panel}</div>}

      {!isInline && (
        <>
          {/* FAB */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              const next = !open;
              if (next) setHasOpened(true);
              setOpen(next);
              setMinimized(false);
              setTimeout(() => inputRef.current?.focus(), 150);
            }}
            aria-label={open ? "Close chat" : "Open chat"}
            className={`fixed bottom-8 right-8 z-[100] ${ACCENT_GRADIENT} text-slate-950 p-4 rounded-full shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/10 hover:brightness-110 transition`}
          >
            {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            {unread > 0 && !open && !hasOpened && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] leading-none px-1.5 py-1 rounded-full shadow">
                {unread}
              </span>
            )}
          </motion.button>

          {/* Floating Panel */}
          {open && (
            <div className="fixed bottom-24 right-8 w-[380px] max-w-[92vw] z-[99]">{Panel}</div>
          )}
        </>
      )}
    </>
  );
};

export default ChatWidget;

// --- Message Bubble ---
const MessageBubble: React.FC<ChatMessage> = ({ role, content, ts }) => {
  const isUser = role === "user";
  const time = ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className={`mr-2 mt-0.5 shrink-0 w-7 h-7 rounded-xl ${ACCENT_GRADIENT} text-slate-950 grid place-items-center ring-1 ring-white/10`}>
          <Bot className="w-4 h-4" />
        </div>
      )}
      <div
        className={
          "max-w-[80%] text-sm whitespace-pre-wrap break-words px-3 py-2 rounded-2xl shadow " +
          (isUser
            ? `${ACCENT_GRADIENT} text-slate-950 rounded-br-sm`
            : "bg-white/5 text-white ring-1 ring-white/10 rounded-bl-sm")
        }
      >
        {content}
        {time && (
          <div className={`mt-1 text-[10px] ${isUser ? "text-slate-900/70" : "text-slate-300/80"}`}>{time}</div>
        )}
      </div>
      {isUser && (
        <div className={`ml-2 mt-0.5 shrink-0 w-7 h-7 rounded-xl ${ACCENT_GRADIENT} text-slate-950 grid place-items-center ring-1 ring-white/10`}>
          <UserIcon className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};