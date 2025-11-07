import React from "react";
import {
  ShieldCheck,
  Users2,
  Target,
  HeartHandshake,
  Sparkles,
  Mail,
  Phone,
  Clock,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * Enhanced About page for GearSync
 * - Matches the dark, glassy, neon‑accent aesthetic of the Home page
 * - Clear visual hierarchy, subtle motion, strong contrast & accessibility
 * - Keeps your original content; elevates layout, components, and CTA
 */

const ACCENT_GRADIENT =
  "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400"; // primary sweep

const cardClass =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";

const chipClass =
  "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-sm font-medium border border-white/10";

const btnBase =
  "inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-slate-950 transition";

const About: React.FC = () => {
  const pillars = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Our Mission",
      text: "Deliver effortless auto care with real-time visibility and trusted service.",
      tone: "from-cyan-400/20",
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "What We Value",
      text: "Transparency, safety, and craftsmanship — plus great communication at every step.",
      tone: "from-emerald-400/20",
    },
    {
      icon: <Users2 className="w-6 h-6" />,
      title: "Who We Serve",
      text: "Drivers, fleet owners, and technicians who want simple, dependable workflows.",
      tone: "from-indigo-400/20",
    },
  ];

  const expectations = [
    "Fast booking with clear availability",
    "Real‑time status updates & progress tracking",
    "Transparent estimates and final invoices",
    "Centralized vehicle history for smarter decisions",
    "Secure authentication with role-based access",
  ];

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Backdrop */}
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
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Page content */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:py-20">
        {/* Hero */}
        <section className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className={`${chipClass}`}>
              <Sparkles className="w-4 h-4 text-cyan-300" /> About GearSync
            </span>
            <h1 className="mt-5 text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              Keeping you on the road —
              <span className={`block bg-clip-text text-transparent ${ACCENT_GRADIENT}`}>
                reliably & transparently
              </span>
            </h1>
            <p className="mt-4 text-slate-300/90 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
              GearSync is a modern auto service platform connecting customers, vehicles, and technicians.
              We streamline bookings, progress updates, and service history — all in one place.
            </p>
          </motion.div>
        </section>

        {/* Pillars */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              className={`${cardClass} p-6`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.tone} to-transparent ring-1 ring-white/10 grid place-items-center text-cyan-300`}>
                {p.icon}
              </div>
              <h3 className="mt-4 font-semibold text-white">{p.title}</h3>
              <p className="mt-2 text-sm text-slate-300/90">{p.text}</p>
            </motion.div>
          ))}
        </section>

        {/* Story + Expectation */}
        <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            className={`${cardClass} p-6 md:p-8`}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.55 }}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} shadow-md shadow-cyan-500/10`}>
                <Clock className="w-5 h-5 text-slate-950" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold">Our Story</h2>
            </div>
            <p className="mt-4 text-slate-300/90">
              We started GearSync after years of seeing how confusing service queues, missed updates,
              and scattered notes could be. We built a platform that makes it easy to book, track,
              and complete service with confidence — for everyone involved.
            </p>
            <p className="mt-3 text-slate-300/90">
              Today, GearSync supports appointments, projects, time logs, and clear communication
              between customers and skilled technicians.
            </p>

            {/* Mini stats strip */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { value: "15K+", label: "Jobs completed" },
                { value: "98%", label: "Satisfaction" },
                { value: "24/7", label: "Support" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                  <div className="text-2xl font-extrabold tracking-tight text-cyan-300">{s.value}</div>
                  <div className="mt-1 text-xs text-slate-300/90">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className={`${cardClass} p-6 md:p-8`}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} shadow-md shadow-cyan-500/10`}>
                <CheckCircle className="w-5 h-5 text-slate-950" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold">What You Can Expect</h2>
            </div>
            <ul className="mt-2 space-y-2 text-slate-200">
              {expectations.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <span className="text-slate-300/90">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </section>

        {/* CTA / Contact */}
        <section className="mt-10">
          <motion.div
            className={`${cardClass} p-6 md:p-8 relative overflow-hidden`}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-2xl" />
            <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-indigo-400/20 blur-2xl" />

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <span className={`${chipClass} bg-white/5`}>
                  <HeartHandshake className="w-4 h-4 text-rose-400" /> We’re here to help
                </span>
                <h3 className="mt-3 text-2xl font-bold tracking-tight">Want to work with us or have questions?</h3>
                <p className="mt-1 text-slate-300/90">Reach out to our team — we typically reply the same day.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:support@gearsync.example"
                  className={`${btnBase} ${ACCENT_GRADIENT} text-slate-950 shadow-lg shadow-cyan-500/20 hover:brightness-110`}
                  aria-label="Email support"
                >
                  <Mail className="w-5 h-5" /> Email Support
                </a>
                <a
                  href="tel:+10000000000"
                  className={`${btnBase} bg-white/10 border border-white/10 hover:bg-white/15`}
                  aria-label="Call sales"
                >
                  <Phone className="w-5 h-5" /> Call Sales
                </a>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default About;