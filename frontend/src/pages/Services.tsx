// src/pages/Services.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Wrench,
  Search,
  RefreshCcw,
  AlertTriangle,
  Clock,
  Tag,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { listAllServices, ServiceItem } from "../api/services";

/**
 * Enhanced Services page for GearSync
 * - Matches the dark, glassy, neon‑accent aesthetic (Home/About/Contact)
 * - Search + Category filter, resilient empty/error/loading states
 * - Accessible controls, keyboard focus rings, and responsive grid
 */

const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const cardClass =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const btnBase =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-slate-950 transition";
const inputBase =
  "w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 focus:border-transparent";
const badgeBase =
  "inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-md ring-1";

function formatPrice(value: unknown) {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(value);
  }
  return "—";
}

const Services: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");

  const fetchServices = async () => {
    try {
      setLoading(true);
      setErr(null);
      const data = await listAllServices();
      setServices(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErr(e?.response?.data || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => s.category && set.add(String(s.category)));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [services]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return services.filter((s) => {
      const matchesQuery = !query
        ? true
        : [s.serviceName, s.category, s.description]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(query));
      const matchesCategory = category === "all" || String(s.category || "").toLowerCase() === category.toLowerCase();
      return matchesQuery && matchesCategory;
    });
  }, [services, q, category]);

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(34,211,238,0.35), transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute top-1/3 right-[-20%] h-[40rem] w-[40rem] rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(99,102,241,0.35), transparent 70%)" }}
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

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:py-16">
        {/* Header */}
        <section className="flex items-center justify-between gap-4">
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-sm font-medium border border-white/10`}>
              <Wrench className="w-4 h-4 text-cyan-300" /> Services
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">Browse our services</h1>
            <p className="text-slate-300/90 mt-1">Find the right job and get transparent pricing.</p>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className={`${cardClass} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300/80 text-sm">Total services</p>
                <p className="text-3xl font-extrabold tracking-tight text-cyan-300">{services.length}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 ring-1 ring-white/10 text-cyan-300">
                <Wrench className="w-6 h-6" />
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className={`${cardClass} mt-6 p-5`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <label htmlFor="service-search" className="sr-only">Search services</label>
              <input
                id="service-search"
                type="text"
                placeholder="Search services…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className={`${inputBase} pl-10`}
                aria-label="Search services"
              />
            </div>
            <div>
              <label htmlFor="category" className="sr-only">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`${inputBase}`}
                aria-label="Filter by category"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-slate-900">
                    {c === "all" ? "All categories" : c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="mt-6">
          <div className={`${cardClass} overflow-hidden`}>
            {loading ? (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 animate-pulse">
                    <div className="h-4 w-24 bg-white/10 rounded" />
                    <div className="mt-3 h-3 w-3/4 bg-white/10 rounded" />
                    <div className="mt-2 h-3 w-2/3 bg-white/10 rounded" />
                    <div className="mt-5 h-8 w-24 bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            ) : err ? (
              <div className="p-10 text-center">
                <AlertTriangle className="w-10 h-10 text-amber-300 mx-auto" />
                <p className="mt-3 text-slate-200 font-semibold">{err}</p>
                <button onClick={fetchServices} className={`${btnBase} mt-4 bg-white/10 border border-white/10 hover:bg-white/15`}>
                  <RefreshCcw className="w-4 h-4" /> Try again
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center">
                <Wrench className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="mt-3 text-slate-300/90">No services found</p>
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((s, i) => (
                  <motion.div
                    key={s.id ?? `${s.serviceName}-${i}`}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/[0.07] transition"
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 250, damping: 20 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 grid place-items-center rounded-xl bg-white/5 ring-1 ring-white/10 text-cyan-300">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate text-white">{s.serviceName}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className={`${badgeBase} ring-white/10 bg-white/5 text-slate-300`}>
                            <Tag className="w-3.5 h-3.5" /> {s.category || "Uncategorized"}
                          </span>
                          <span className={`${badgeBase} ring-emerald-400/20 bg-emerald-500/10 text-emerald-300`}>
                            <Clock className="w-3.5 h-3.5" /> {s.estimatedDurationMinutes ?? "—"} min
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300/90 mt-3 line-clamp-3">
                      {s.description || "No description"}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-cyan-300 font-extrabold tracking-tight inline-flex items-center gap-1">
                        <DollarSign className="w-4 h-4" /> {formatPrice(s.basePrice)}
                      </span>
                      <span className={`${badgeBase} ring-emerald-400/20 bg-emerald-500/10 text-emerald-300`}>
                        <CheckCircle className="w-3.5 h-3.5" /> Available
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Services;