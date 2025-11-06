// // ChatWidget.tsx — Polished UI
// // Floating chat widget with enhanced visuals, avatars, quick replies, and better UX
// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { MessageCircle, X, Send, Loader2, Bot, User as UserIcon, Minus } from "lucide-react";

// // Types
// export type ChatMessage = {
//   role: "user" | "assistant";
//   content: string;
//   id?: string;
//   ts?: number; // timestamp
// };

// interface ChatWidgetProps {
//   apiUrl?: string;
//   temperature?: number;
//   maxTokens?: number;
//   title?: string;
//   subtitle?: string;
// }

// // Env with safe fallback
// const metaEnv = (import.meta as any).env || {};
// const DEFAULT_API_URL = metaEnv.VITE_CHAT_API_URL || "http://localhost:8005/chat";
// const DEFAULT_TEMPERATURE = metaEnv.VITE_CHAT_TEMPERATURE ? Number(metaEnv.VITE_CHAT_TEMPERATURE) : 0.7;
// const DEFAULT_MAX_TOKENS = metaEnv.VITE_CHAT_MAX_TOKENS ? Number(metaEnv.VITE_CHAT_MAX_TOKENS) : 500;

// const PERSIST = true; // localStorage persistence
// const STORAGE_KEY = "chat_widget_history_v2";

// function uid() {
//   return Math.random().toString(36).slice(2);
// }

// const QUICK_REPLIES = [
//   "Book a service",
//   "Available slots today?",
//   "Estimate for brake repair",
//   "Track my appointment",
// ];

// const ChatWidget: React.FC<ChatWidgetProps> = ({
//   apiUrl = DEFAULT_API_URL,
//   temperature = DEFAULT_TEMPERATURE,
//   maxTokens = DEFAULT_MAX_TOKENS,
//   title = "AI Assistant",
//   subtitle = "Typically replies in seconds",
// }) => {
//   const [open, setOpen] = useState(false);
//   const [minimized, setMinimized] = useState(false);
//   const [messages, setMessages] = useState<ChatMessage[]>(() => {
//     if (!PERSIST) return [];
//     try {
//       const raw = localStorage.getItem(STORAGE_KEY);
//       if (!raw) return [];
//       const parsed = JSON.parse(raw) as ChatMessage[];
//       return Array.isArray(parsed) ? parsed : [];
//     } catch {
//       return [];
//     }
//   });
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [unread, setUnread] = useState(0);
//   const [hasOpened, setHasOpened] = useState(false);
//   const viewportRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLTextAreaElement>(null);

//   // Persist conversation
//   useEffect(() => {
//     if (!PERSIST) return;
//     try {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
//     } catch {}
//   }, [messages]);

//   // Auto-scroll on messages change
//   useEffect(() => {
//     const el = viewportRef.current;
//     if (!el) return;
//     el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
//   }, [messages, open, minimized]);

//   // Close on ESC
//   useEffect(() => {
//     function onKeyDown(e: KeyboardEvent) {
//       if (e.key === "Escape") setOpen(false);
//     }
//     window.addEventListener("keydown", onKeyDown);
//     return () => window.removeEventListener("keydown", onKeyDown);
//   }, []);

//   // Unread counter when panel closed
//   useEffect(() => {
//     if (!open) {
//       const last = messages[messages.length - 1];
//       if (last && last.role === "assistant") setUnread((u) => u + 1);
//     } else {
//       setUnread(0);
//     }
//   }, [messages, open]);

//   const conversationHistory = useMemo(
//     () => messages.map((m) => ({ role: m.role, content: m.content })),
//     [messages]
//   );
//   const handleOpen = () => {
//   setOpen((v) => {
//     const next = !v;
//     if (next) setHasOpened(true); // mark as seen
//     return next;
//   });
//   setMinimized(false);
//   setTimeout(() => inputRef.current?.focus(), 150);
// };
//   const parseAssistantText = (json: any): string => {
//     if (!json || typeof json !== "object") return "";
//     const candidates = [json.reply, json.assistant, json.content, json.message, json.text];
//     const found = candidates.find((v) => typeof v === "string" && v.trim().length);
//     if (found) return found as string;
//     if (json.data && typeof json.data === "object") {
//       const deep = [json.data.reply, json.data.assistant, json.data.content, json.data.message, json.data.text];
//       const deepFound = deep.find((v) => typeof v === "string" && v.trim().length);
//       if (deepFound) return deepFound as string;
//     }
//     return JSON.stringify(json);
//   };

//   const sendMessage = useCallback(async () => {
//     const trimmed = input.trim();
//     if (!trimmed || loading) return;
//     setError(null);
//     setLoading(true);

//     const newUserMessage: ChatMessage = { role: "user", content: trimmed, id: uid(), ts: Date.now() };
//     setMessages((prev) => [...prev, newUserMessage]);
//     setInput("");

//     try {
//       const payload = {
//         message: trimmed,
//         conversation_history: conversationHistory,
//         temperature,
//         max_tokens: maxTokens,
//       };

//       const res = await fetch(apiUrl, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(`HTTP ${res.status}: ${text}`);
//       }

//       const json = await res.json();
//       const assistantText = parseAssistantText(json) || "(no response)";

//       setMessages((prev) => [
//         ...prev,
//         { role: "assistant", content: assistantText, id: uid(), ts: Date.now() },
//       ]);
//     } catch (err: any) {
//       const msg = err?.message ?? String(err);
//       setError(msg);
//       setMessages((prev) => [
//         ...prev,
//         { role: "assistant", content: "Sorry, I had trouble responding.", id: uid(), ts: Date.now() },
//       ]);
//     } finally {
//       setLoading(false);
//       inputRef.current?.focus();
//     }
//   }, [apiUrl, conversationHistory, input, loading, maxTokens, temperature]);

//   const autoGrow = (el: HTMLTextAreaElement | null) => {
//     if (!el) return;
//     el.style.height = "0px";
//     el.style.height = Math.min(120, el.scrollHeight) + "px";
//   };

//   return (
//     <>
//       {/* FAB */}
//       <div className="fixed bottom-8 right-8 z-[100]">
//         <button
//           onClick={handleOpen}
//           aria-label={open ? "Close chat" : "Open chat"}
//           className="relative bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:shadow-pink-500/25 transform hover:scale-110 transition-all duration-300 group focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-400/40"
//         >
//           {open ? (
//             <X className="w-6 h-6 group-hover:rotate-180 transition-transform" />
//           ) : (
//             <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
//           )}
//           {unread > 0 && !open && !hasOpened && (
//             <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none px-1.5 py-1 rounded-full shadow">{unread}</span>
//             )}
//         </button>
//       </div>

//       {/* Panel */}
//       {open && (
//         <div className="fixed bottom-24 right-8 w-[380px] max-w-[92vw] rounded-2xl shadow-2xl z-[99] overflow-hidden border border-white/20 backdrop-blur-xl bg-white/90 dark:bg-neutral-900/90">
//           {/* Header */}
//           <div className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white flex items-center justify-between">
//             <div>
//               <div className="text-sm font-semibold flex items-center gap-2">
//                 <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
//                   <Bot className="w-4 h-4" />
//                 </span>
//                 {title}
//               </div>
//               <div className="text-[11px] opacity-90 flex items-center gap-2 mt-0.5">
//                 <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
//                 {subtitle}
//               </div>
//             </div>
//             <div className="flex items-center gap-1">
//               <button
//                 className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-white/10 transition"
//                 onClick={() => setMinimized((m) => !m)}
//                 aria-label={minimized ? "Expand" : "Minimize"}
//               >
//                 <Minus className="w-4 h-4" />
//               </button>
//               <button
//                 className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-white/10 transition"
//                 onClick={() => setOpen(false)}
//                 aria-label="Close"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>
//           </div>

//           {!minimized && (
//             <>
//               {/* Messages */}
//               <div ref={viewportRef} className="px-3 py-3 h-80 overflow-y-auto space-y-3 bg-gradient-to-b from-white/70 to-white/30 dark:from-neutral-900/70 dark:to-neutral-900/30">
//                 {messages.length === 0 && (
//                   <div className="text-xs text-neutral-600 dark:text-neutral-400 text-center py-10">
//                     Start the conversation 👋 — try a quick question below
//                   </div>
//                 )}

//                 {messages.map((m) => (
//                   <MessageBubble key={m.id} role={m.role} content={m.content} ts={m.ts} />
//                 ))}

//                 {loading && (
//                   <div className="flex items-center gap-2 text-xs text-neutral-500 px-2">
//                     <Loader2 className="w-3 h-3 animate-spin" />
//                     Thinking...
//                   </div>
//                 )}
//               </div>

//               {/* Error */}
//               {error && (
//                 <div className="px-3 py-2 text-xs bg-red-50 text-red-700 border-t border-red-200">
//                   {error}
//                 </div>
//               )}

//               {/* Quick Replies */}
//               {messages.length === 0 && !loading && (
//                 <div className="px-3 pb-2 pt-1 flex flex-wrap gap-2">
//                   {QUICK_REPLIES.map((q) => (
//                     <button
//                       key={q}
//                       onClick={() => setInput(q)}
//                       className="text-xs px-2.5 py-1.5 rounded-full border border-neutral-200/70 dark:border-neutral-700 bg-white/70 dark:bg-neutral-800/70 hover:bg-white transition"
//                     >
//                       {q}
//                     </button>
//                   ))}
//                 </div>
//               )}

//               {/* Composer */}
//               <div className="p-3 border-t border-neutral-200/60 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80">
//                 <div className="flex items-end gap-2">
//                   <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white grid place-items-center shadow">
//                     <UserIcon className="w-4 h-4" />
//                   </div>
//                   <textarea
//                     ref={inputRef}
//                     value={input}
//                     onChange={(e) => {
//                       setInput(e.target.value);
//                       autoGrow(e.currentTarget);
//                     }}
//                     onInput={(e) => autoGrow(e.currentTarget)}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter" && !e.shiftKey) {
//                         e.preventDefault();
//                         sendMessage();
//                       }
//                     }}
//                     placeholder="Type your message..."
//                     rows={1}
//                     className="flex-1 text-sm px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-400 bg-white/90 dark:bg-neutral-900/90 dark:text-neutral-100 dark:border-neutral-700 resize-none max-h-28"
//                   />
//                   <button
//                     onClick={sendMessage}
//                     disabled={loading || !input.trim()}
//                     className="inline-flex items-center justify-center gap-1 text-sm px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95 transition-opacity"
//                   >
//                     {loading ? (
//                       <Loader2 className="w-4 h-4 animate-spin" />
//                     ) : (
//                       <Send className="w-4 h-4" />
//                     )}
//                     <span className="sr-only">Send</span>
//                   </button>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       )}
//     </>
//   );
// };

// export default ChatWidget;

// // --- Message Bubble ---
// const MessageBubble: React.FC<ChatMessage> = ({ role, content, ts }) => {
//   const isUser = role === "user";
//   const time = ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
//   return (
//     <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
//       {!isUser && (
//         <div className="mr-2 mt-0.5 shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white grid place-items-center shadow">
//           <Bot className="w-4 h-4" />
//         </div>
//       )}
//       <div
//         className={
//           "max-w-[80%] text-sm whitespace-pre-wrap break-words px-3 py-2 rounded-2xl shadow " +
//           (isUser
//             ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-sm"
//             : "bg-white/90 dark:bg-neutral-800/90 text-neutral-900 dark:text-neutral-100 border border-neutral-200/70 dark:border-neutral-700 rounded-bl-sm")
//         }
//       >
//         {content}
//         {time && (
//           <div className={`mt-1 text-[10px] ${isUser ? "text-white/80" : "text-neutral-500"}`}>{time}</div>
//         )}
//       </div>
//       {isUser && (
//         <div className="ml-2 mt-0.5 shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white grid place-items-center shadow">
//           <UserIcon className="w-4 h-4" />
//         </div>
//       )}
//     </div>
//   );
// };

// ChatWidget.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User as UserIcon, Minus } from "lucide-react";

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

  /** NEW: "floating" (default) shows FAB; "inline" embeds the chat panel */
  mode?: "floating" | "inline";

  /** NEW: only for inline mode – content area height (px) */
  height?: number;

  /** NEW: additional className for outer wrapper in inline mode */
  className?: string;
}

const metaEnv = (import.meta as any).env || {};
const DEFAULT_API_URL = metaEnv.VITE_CHAT_API_URL || "http://localhost:8005/chat";
const DEFAULT_TEMPERATURE = metaEnv.VITE_CHAT_TEMPERATURE ? Number(metaEnv.VITE_CHAT_TEMPERATURE) : 0.7;
const DEFAULT_MAX_TOKENS = metaEnv.VITE_CHAT_MAX_TOKENS ? Number(metaEnv.VITE_CHAT_MAX_TOKENS) : 500;

const PERSIST = true;
const STORAGE_KEY = "chat_widget_history_v2";

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

  // In inline mode, panel is always open; in floating mode, controlled by FAB
  const [open, setOpen] = useState(isInline ? true : false);
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
  const [hasOpened, setHasOpened] = useState(isInline ? true : false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!PERSIST) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, open, minimized, isInline]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!isInline && e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isInline]);

  useEffect(() => {
    if (isInline) return; // unread indicator only for floating
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

  const handleOpen = () => {
    if (isInline) return;
    setOpen((v) => {
      const next = !v;
      if (next) setHasOpened(true);
      return next;
    });
    setMinimized(false);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

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

  // ---------- RENDER ----------
  const Panel = (
    <div
      className={
        (isInline
          ? `rounded-2xl shadow border border-white/20 bg-white/90 dark:bg-neutral-900/90 ${className}`
          : "rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl bg-white/90 dark:bg-neutral-900/90") +
        ""
      }
      style={isInline ? {} : {}}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white flex items-center justify-between rounded-t-2xl">
        <div>
          <div className="text-sm font-semibold flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
              <Bot className="w-4 h-4" />
            </span>
            {title}
          </div>
          <div className="text-[11px] opacity-90 flex items-center gap-2 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {subtitle}
          </div>
        </div>

        {/* Controls (floating only) */}
        {!isInline && (
          <div className="flex items-center gap-1">
            <button
              className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-white/10 transition"
              onClick={() => setMinimized((m) => !m)}
              aria-label={minimized ? "Expand" : "Minimize"}
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-white/10 transition"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content (hidden when minimized in floating mode) */}
      {(!minimized || isInline) && (
        <>
          {/* Messages */}
          <div
            ref={viewportRef}
            className="px-3 py-3 overflow-y-auto space-y-3 bg-gradient-to-b from-white/70 to-white/30 dark:from-neutral-900/70 dark:to-neutral-900/30"
            style={{ height: isInline ? height : 320 }}
          >
            {messages.length === 0 && (
              <div className="text-xs text-neutral-600 dark:text-neutral-400 text-center py-10">
                Start the conversation 👋 — try a quick question below
              </div>
            )}

            {messages.map((m) => (
              <MessageBubble key={m.id} role={m.role} content={m.content} ts={m.ts} />
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-neutral-500 px-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Thinking...
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="px-3 py-2 text-xs bg-red-50 text-red-700 border-t border-red-200">
              {error}
            </div>
          )}

          {/* Quick Replies */}
          {messages.length === 0 && !loading && (
            <div className="px-3 pb-2 pt-1 flex flex-wrap gap-2">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs px-2.5 py-1.5 rounded-full border border-neutral-200/70 dark:border-neutral-700 bg-white/70 dark:bg-neutral-800/70 hover:bg-white transition"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Composer */}
          <div className="p-3 border-t border-neutral-200/60 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 rounded-b-2xl">
            <div className="flex items-end gap-2">
              <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white grid place-items-center shadow">
                <UserIcon className="w-4 h-4" />
              </div>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  autoGrow(e.currentTarget);
                }}
                onInput={(e) => autoGrow(e.currentTarget)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 text-sm px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-400 bg-white/90 dark:bg-neutral-900/90 dark:text-neutral-100 dark:border-neutral-700 resize-none max-h-28"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="inline-flex items-center justify-center gap-1 text-sm px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95 transition-opacity"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="sr-only">Send</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Inline mode: render panel directly */}
      {isInline && <div className="w-full">{Panel}</div>}

      {/* Floating mode: FAB + floating panel */}
      {!isInline && (
        <>
          {/* FAB */}
          <div className="fixed bottom-8 right-8 z-[100]">
            <button
              onClick={() => {
                const next = !open;
                if (next) setHasOpened(true);
                setOpen(next);
                setMinimized(false);
                setTimeout(() => inputRef.current?.focus(), 150);
              }}
              aria-label={open ? "Close chat" : "Open chat"}
              className="relative bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:shadow-pink-500/25 transform hover:scale-110 transition-all duration-300 group focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-400/40"
            >
              {open ? (
                <X className="w-6 h-6 group-hover:rotate-180 transition-transform" />
              ) : (
                <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              )}
              {unread > 0 && !open && !hasOpened && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none px-1.5 py-1 rounded-full shadow">
                  {unread}
                </span>
              )}
            </button>
          </div>

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

const MessageBubble: React.FC<ChatMessage> = ({ role, content, ts }) => {
  const isUser = role === "user";
  const time = ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="mr-2 mt-0.5 shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white grid place-items-center shadow">
          <Bot className="w-4 h-4" />
        </div>
      )}
      <div
        className={
          "max-w-[80%] text-sm whitespace-pre-wrap break-words px-3 py-2 rounded-2xl shadow " +
          (isUser
            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-sm"
            : "bg-white/90 dark:bg-neutral-800/90 text-neutral-900 dark:text-neutral-100 border border-neutral-200/70 dark:border-neutral-700 rounded-bl-sm")
        }
      >
        {content}
        {time && (
          <div className={`mt-1 text-[10px] ${isUser ? "text-white/80" : "text-neutral-500"}`}>{time}</div>
        )}
      </div>
      {isUser && (
        <div className="ml-2 mt-0.5 shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white grid place-items-center shadow">
          <UserIcon className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};