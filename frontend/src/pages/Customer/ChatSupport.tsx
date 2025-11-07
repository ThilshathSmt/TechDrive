// src/pages/Support/ChatSupport.tsx
import React from "react";
import { MessageSquare, Mail, Sparkles } from "lucide-react";
import ChatWidget from "../../components/ChatWidget";

/** ---- UI TOKENS (shared with Home + ChatWidget) ---- */
const ACCENT_GRADIENT =
  "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";

const ChatSupport: React.FC = () => {
  // Optional env-driven defaults (Vite-style)
  const metaEnv = (import.meta as any).env || {};
  const DEFAULT_API_URL = metaEnv.VITE_CHAT_API_URL || "http://localhost:8005/chat";
  const DEFAULT_TEMPERATURE = metaEnv.VITE_CHAT_TEMPERATURE ? Number(metaEnv.VITE_CHAT_TEMPERATURE) : 0.7;
  const DEFAULT_MAX_TOKENS = metaEnv.VITE_CHAT_MAX_TOKENS ? Number(metaEnv.VITE_CHAT_MAX_TOKENS) : 500;

  return (
    <div className="relative min-h-screen text-white">
      <Backdrop />

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        {/* Page header */}
        <header className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div
              className={`${ACCENT_GRADIENT} p-2 rounded-xl text-slate-950 ring-1 ring-white/10`}
            >
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Chat Support
              </h1>
              <p className="text-slate-300/90 mt-1">
                Fast, friendly help — 24/7
              </p>
            </div>
          </div>

          <a
            href="mailto:support@gearsync.com"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
          >
            <Mail className="w-4 h-4" />
            Email support
          </a>
        </header>

        {/* Layout: Chat left, small helper right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ChatWidget: inline mode renders its own panel (don’t wrap in another card) */}
          <section className="lg:col-span-2">
            <ChatWidget
              mode="inline"
              height={560}                 // comfy height; tweak as you like
              title="AI Assistant"
              subtitle="Typically replies in seconds"
              apiUrl={DEFAULT_API_URL}
              temperature={DEFAULT_TEMPERATURE}
              maxTokens={DEFAULT_MAX_TOKENS}
              className="shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]" // optional extra depth
            />
          </section>

          {/* Right rail: subtle helper card */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-slate-300/90" />
                <h3 className="text-sm font-semibold">Tips</h3>
              </div>
              <ul className="text-sm text-slate-300/90 space-y-2">
                <li>
                  Ask naturally — e.g.{" "}
                  <span className="text-slate-100">
                    “Book a brake inspection tomorrow 3pm”
                  </span>
                </li>
                <li>
                  Track things —{" "}
                  <span className="text-slate-100">“Where’s my appointment?”</span>
                </li>
                <li>
                  Explore services —{" "}
                  <span className="text-slate-100">
                    “Show diagnostics options”
                  </span>
                </li>
              </ul>

              <div className="mt-4 text-xs text-slate-400">
                If the bot can’t resolve an issue, it will escalate to a human
                automatically.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
              <h3 className="text-sm font-semibold mb-2">Hours</h3>
              <p className="text-sm text-slate-300/90">
                Mon–Sat, 08:00–18:00. Same-day slots often available.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ChatSupport;

/** ----- Backdrop (same feel as Home/Widget) ----- */
const Backdrop = () => (
  <div className="absolute inset-0 -z-10">
    <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
    <div
      className="pointer-events-none absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
      style={{
        background:
          "radial-gradient(closest-side, rgba(34,211,238,0.35), transparent 70%)",
      }}
    />
    <div
      className="pointer-events-none absolute top-1/3 right-[-20%] h-[40rem] w-[40rem] rounded-full opacity-15 blur-3xl"
      style={{
        background:
          "radial-gradient(closest-side, rgba(99,102,241,0.35), transparent 70%)",
      }}
    />
    <div
      className="absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage:
          "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
  </div>
);