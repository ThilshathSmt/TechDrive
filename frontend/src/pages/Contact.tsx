// src/pages/Contact.tsx
import React from "react";
import { Mail, Phone, MapPin, MessageSquare, SendHorizonal, Shield } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Enhanced Contact page for GearSync
 * - Matches the dark, glassy, neon‑accent aesthetic used on Home/About
 * - Strong contrast, accessible labels, and keyboard focus rings
 * - Reusable design tokens (ACCENT_GRADIENT, cardClass, btnBase)
 */

const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const cardClass =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const btnBase =
  "inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-slate-950 transition";
const inputBase =
  "w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 focus:border-transparent";

const Contact: React.FC = () => {
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    alert("Thanks! We’ll be in touch shortly.");
  };

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
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12 md:py-20">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-sm font-medium border border-white/10">
            <MessageSquare className="w-4 h-4 text-cyan-300" /> Contact GearSync
          </span>
          <h1 className="mt-5 text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
            We’re here to
            <span className={`block bg-clip-text text-transparent ${ACCENT_GRADIENT}`}>help 24/7</span>
          </h1>
          <p className="mt-3 text-slate-300/90 max-w-2xl mx-auto text-lg">
            Got questions or need help? Reach out and we’ll get back to you ASAP.
          </p>
        </motion.header>

        {/* Contact cards */}
        <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              Icon: Mail,
              title: "Email",
              line1: "support@gearsync.example",
              href: "mailto:support@gearsync.example",
            },
            { Icon: Phone, title: "Phone", line1: "+1 (000) 000-0000", href: "tel:+10000000000" },
            { Icon: MapPin, title: "Address", line1: "123 Service St, Auto City" },
          ].map(({ Icon, title, line1, href }, i) => (
            <motion.div
              key={title}
              className={`${cardClass} p-5`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-white/5 ring-1 ring-white/10 text-cyan-300">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-white">{title}</p>
                  {href ? (
                    <a href={href} className="text-sm text-slate-300/90 hover:text-white underline underline-offset-4">
                      {line1}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-300/90">{line1}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Form & Aside */}
        <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className={`${cardClass} p-6 md:p-8 lg:col-span-2`}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.55 }}
            aria-labelledby="contact-form-title"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} shadow-md shadow-cyan-500/10`}>
                <SendHorizonal className="w-5 h-5 text-slate-950" />
              </div>
              <h2 id="contact-form-title" className="text-xl md:text-2xl font-bold">
                Send us a message
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="sr-only">Your name</label>
                <input id="name" name="name" required placeholder="Your name" className={inputBase} />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input id="email" name="email" type="email" required placeholder="Email address" className={inputBase} />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="subject" className="sr-only">Subject</label>
              <input id="subject" name="subject" required placeholder="Subject" className={inputBase} />
            </div>
            <div className="mt-4">
              <label htmlFor="message" className="sr-only">Message</label>
              <textarea id="message" name="message" rows={6} required placeholder="Message" className={inputBase} />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="submit" className={`${btnBase} ${ACCENT_GRADIENT} text-slate-950 shadow-lg shadow-cyan-500/20 hover:brightness-110`}>
                <SendHorizonal className="w-5 h-5" /> Send Message
              </button>
              <div className="flex items-center gap-2 text-sm text-slate-300/80">
                <Shield className="w-4 h-4 text-emerald-400" /> Your info is encrypted in transit
              </div>
            </div>
          </motion.form>

          {/* Aside */}
          <motion.aside
            className={`${cardClass} p-6 md:p-8`}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            <h3 className="text-lg font-semibold">Response times</h3>
            <p className="mt-1 text-slate-300/90 text-sm leading-relaxed">
              We usually reply within a few hours during business days. For time‑sensitive issues,
              call our hotline and we’ll prioritize your request.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { label: "Email", value: "< 6 hrs" },
                { label: "Phone", value: "Instant" },
                { label: "Business hrs", value: "9am‑7pm" },
                { label: "Support", value: "24/7" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                  <div className="text-xl font-extrabold tracking-tight text-cyan-300">{s.value}</div>
                  <div className="mt-1 text-xs text-slate-300/90">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <a href="mailto:support@gearsync.example" className={`${btnBase} bg-white/10 border border-white/10 hover:bg-white/15`}> 
                <Mail className="w-5 h-5" /> Email support
              </a>
            </div>
          </motion.aside>
        </section>
      </main>
    </div>
  );
};

export default Contact;