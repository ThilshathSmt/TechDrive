// src/pages/Admin/AdminCustomers.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  Car,
  Mail,
  Phone,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  listCustomersWithVehicles,
  AdminCustomerWithVehiclesDTO,
} from "../../api/admin";
import { motion } from "framer-motion";

/** ---- UI TOKENS (match Home) ---- */
const ACCENT_GRADIENT =
  "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const CHIP =
  "px-2 py-0.5 text-xs rounded-full ring-1 ring-white/10";
const INPUT =
  "w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2.5 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 focus:border-transparent";
const LABEL = "block text-sm font-medium text-slate-200";
const MUTED = "text-slate-300/90";

const AdminCustomers: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<AdminCustomerWithVehiclesDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Record<number, boolean>>({}); // expand map by id

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await listCustomersWithVehicles();
        setRows(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setErr(e?.response?.data || "Failed to load customers");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rows;
    return rows.filter((c) => {
      const fullName = (c.name || `${c.firstName || ""} ${c.lastName || ""}`).toLowerCase();
      return (
        fullName.includes(qq) ||
        (c.email || "").toLowerCase().includes(qq) ||
        (c.phoneNumber || "").toLowerCase().includes(qq)
      );
    });
  }, [rows, q]);

  const totalVehicles = useMemo(
    () => rows.reduce((acc, r) => acc + (r.vehicles?.length || 0), 0),
    [rows]
  );

  return (
    <div className="relative min-h-screen text-white">
      {/* Themed Backdrop */}
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

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Customers</h1>
              <p className={`${MUTED} text-sm`}>View customers and their vehicles</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: "Total Customers", value: rows.length, icon: Users, accent: "text-cyan-300" },
            { label: "Total Vehicles", value: totalVehicles, icon: Car, accent: "text-emerald-300" },
            {
              label: "With Vehicles",
              value: rows.filter((r) => (r.vehicles?.length || 0) > 0).length,
              icon: Car,
              accent: "text-indigo-300",
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              className={`${CARD} p-5`}
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-extrabold tracking-tight text-cyan-300">
                    {s.value}
                  </div>
                  <div className={`${MUTED} mt-1`}>{s.label}</div>
                </div>
                <s.icon className={`w-8 h-8 ${s.accent}`} />
              </div>
            </motion.div>
          ))}
        </section>

        {/* Search */}
        <section className={`${CARD} p-6`}>
          <label className={LABEL} htmlFor="search">Search</label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              id="search"
              type="text"
              placeholder="Search by name, email, or phone…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className={`${INPUT} pl-10`}
            />
          </div>
        </section>

        {/* Content */}
        <section className={`${CARD} overflow-hidden`}>
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-cyan-300 border-t-transparent rounded-full animate-spin"></div>
              <p className={`${MUTED} mt-4`}>Loading customers…</p>
            </div>
          ) : err ? (
            <div className="p-12 text-center text-rose-200">{err}</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className={MUTED}>No customers found</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {filtered.map((c, idx) => {
                const id = c.id ?? -idx;
                const name =
                  c.name ||
                  `${c.firstName || ""} ${c.lastName || ""}`.trim() ||
                  "Unnamed";
                const vehicleCount = c.vehicles?.length || 0;
                const isOpen = open[id] || false;

                return (
                  <li key={id} className="p-0">
                    <motion.div
                      className="p-4"
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                    >
                      {/* Row head */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setOpen((m) => ({ ...m, [id]: !isOpen }))
                              }
                              className="p-1 rounded-lg hover:bg-white/10 ring-1 ring-white/10"
                              aria-label={isOpen ? "Collapse" : "Expand"}
                            >
                              {isOpen ? (
                                <ChevronDown className="w-5 h-5 text-slate-300" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-slate-300" />
                              )}
                            </button>

                            <p className="font-semibold truncate">{name}</p>

                            <span
                              className={`${CHIP} ${
                                c.isActive
                                  ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30"
                                  : "bg-slate-500/15 text-slate-200 ring-slate-400/30"
                              }`}
                            >
                              {c.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <div className={`${MUTED} mt-1 flex flex-wrap items-center gap-3 text-sm`}>
                            {c.email && (
                              <span className="inline-flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {c.email}
                              </span>
                            )}
                            {c.phoneNumber && (
                              <span className="inline-flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {c.phoneNumber}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <Car className="w-4 h-4" />
                              {vehicleCount} vehicle{vehicleCount === 1 ? "" : "s"}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          <button
                            onClick={() => navigate(`/admin-dashboard/customers/${id}`)}
                            className={`${ACCENT_GRADIENT} text-slate-950 px-3 py-1.5 rounded-lg ring-1 ring-white/10 hover:brightness-110`}
                          >
                            View details
                          </button>
                        </div>
                      </div>

                      {/* Expand vehicles */}
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3 rounded-xl ring-1 ring-white/10 bg-white/5 overflow-hidden"
                        >
                          {vehicleCount === 0 ? (
                            <div className="p-4 text-sm text-slate-300">
                              No vehicles
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead className="bg-white/5 text-slate-200">
                                  <tr>
                                    <th className="px-4 py-2 text-left">Registration</th>
                                    <th className="px-4 py-2 text-left">Make / Model</th>
                                    <th className="px-4 py-2 text-left">Year</th>
                                    <th className="px-4 py-2 text-left">Color</th>
                                    <th className="px-4 py-2 text-left">VIN</th>
                                    <th className="px-4 py-2 text-left">Mileage</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                  {c.vehicles?.map((v, i) => (
                                    <tr key={v.id ?? `${id}-v-${i}`} className="bg-transparent">
                                      <td className="px-4 py-2 text-slate-200">
                                        {v.registrationNumber || "-"}
                                      </td>
                                      <td className="px-4 py-2 text-slate-200">
                                        {(v.make || "-") + " " + (v.model || "")}
                                      </td>
                                      <td className="px-4 py-2 text-slate-200">{v.year ?? "-"}</td>
                                      <td className="px-4 py-2 text-slate-200">{v.color || "-"}</td>
                                      <td className="px-4 py-2 text-slate-200">{v.vinNumber || "-"}</td>
                                      <td className="px-4 py-2 text-slate-200">
                                        {typeof v.mileage === "number" ? v.mileage : "-"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminCustomers;