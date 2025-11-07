// src/pages/Admin/ServicesManagement.tsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Wrench, Plus, Search, X, Loader2, Tag, Timer } from "lucide-react";
import { createService, listAllServices, ServiceItem, AdminServiceDTO } from "../../api/services";

type FormData = AdminServiceDTO;

/** ---- UI TOKENS (match Home UI) ---- */
const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const BADGE = "px-2 py-1 rounded-full text-xs ring-1 ring-white/10 bg-white/10 text-slate-200";
const INPUT =
  "w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2.5 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 focus:border-transparent";
const LABEL = "text-sm font-medium text-slate-200";
const MUTED = "text-slate-300/90";

const ServicesManagement: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormData>({
    serviceName: "",
    description: "",
    basePrice: 0,
    estimatedDurationMinutes: 30,
    category: "OTHER",
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      setErr(null);
      const data = await listAllServices();
      setServices(data);
    } catch (e: any) {
      setErr(e?.response?.data || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return services.filter((s) =>
      [s.serviceName, s.category, s.description].some((v) =>
        (v || "").toLowerCase().includes(q)
      )
    );
  }, [services, search]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await createService(form);
      setOpen(false);
      setForm({
        serviceName: "",
        description: "",
        basePrice: 0,
        estimatedDurationMinutes: 30,
        category: "OTHER",
      });
      await fetchAll();
    } catch (e: any) {
      alert(e?.response?.data || "Failed to create service (check you’re logged in as ADMIN).");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* Backdrop */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div
          className="pointer-events-none absolute -top-40 right-1/3 h-[45rem] w-[45rem] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(34,211,238,0.35), transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-[-20%] left-[-10%] h-[40rem] w-[40rem] rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(99,102,241,0.35), transparent 70%)" }}
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

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Services</h1>
              <p className={`${MUTED} text-sm`}>View & create services</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(true)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10 hover:brightness-110`}
          >
            <Plus className="w-4 h-4" /> New Service
          </button>
        </div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className={`${CARD} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${MUTED} text-sm`}>Total Services</p>
                <p className="text-3xl font-bold">{services.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/10 ring-1 ring-white/10">
                <Wrench className="w-7 h-7 text-slate-100" />
              </div>
            </div>
          </div>
          {/* (Add more stat cards here if needed) */}
        </motion.div>

        {/* Search */}
        <motion.div
          className={`${CARD} p-6`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
            <input
              type="text"
              placeholder="Search services…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${INPUT} pl-10`}
            />
          </div>
        </motion.div>

        {/* List */}
        <motion.div
          className={`${CARD} overflow-hidden`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" />
              <span className={MUTED}>Loading services…</span>
            </div>
          ) : err ? (
            <div className="p-12 text-center text-rose-200">{err}</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Wrench className="w-14 h-14 text-white/30 mx-auto mb-4" />
              <p className={MUTED}>No services found</p>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((s, i) => (
                <div
                  key={s.id ?? `${s.serviceName}-${i}`}
                  className="rounded-2xl ring-1 ring-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{s.serviceName}</p>
                      <p className={`${MUTED} text-sm mt-1 line-clamp-3`}>
                        {s.description || "No description"}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                        <span className={`${BADGE} inline-flex items-center gap-1`}>
                          <Tag className="w-3 h-3" />
                          {s.category || "Uncategorized"}
                        </span>
                        <span className={`${BADGE}`}>
                          {typeof s.basePrice === "number" ? `$${s.basePrice.toFixed(2)}` : "-"}
                        </span>
                        <span className={`${BADGE} inline-flex items-center gap-1`}>
                          <Timer className="w-3 h-3" />
                          {s.estimatedDurationMinutes ?? "-"} min
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Create Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/60 grid place-items-center p-4 z-50">
          <motion.div
            className={`${CARD} w-full max-w-lg p-6`}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
                  <Plus className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-semibold">Create Service</h2>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onCreate} className="space-y-4">
              <div>
                <label className={LABEL}>Service Name<span className="text-rose-300">*</span></label>
                <input
                  required
                  value={form.serviceName}
                  onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
                  className={INPUT}
                  placeholder="e.g., Full Synthetic Oil Change"
                />
              </div>

              <div>
                <label className={LABEL}>Category<span className="text-rose-300">*</span></label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={INPUT}
                >
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="REPAIR">Repair</option>
                  <option value="INSPECTION">Inspection</option>
                  <option value="TIRE_SERVICE">Tire Service</option>
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="BODYWORK">Bodywork</option>
                  <option value="DIAGNOSTIC">Diagnostic</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className={LABEL}>Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={INPUT}
                  placeholder="Short summary of what this service includes"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Base Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.basePrice}
                    onChange={(e) =>
                      setForm({ ...form, basePrice: e.target.value ? parseFloat(e.target.value) : 0 })
                    }
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className={LABEL}>Duration (min)</label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={form.estimatedDurationMinutes}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        estimatedDurationMinutes: e.target.value ? parseInt(e.target.value) : 0,
                      })
                    }
                    className={INPUT}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-4 py-2 rounded-xl font-semibold ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10 hover:brightness-110 disabled:opacity-60`}
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                    </span>
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </form>

            <p className="text-xs text-slate-300/80 mt-3">
              Note: Creating requires an admin token (Bearer) in the request.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ServicesManagement;