// src/pages/Admin/AdminCustomerDetails.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Phone, Car, Calendar } from "lucide-react";
import {
  getCustomerWithVehicles,
  AdminCustomerWithVehiclesDTO,
} from "../../api/admin";

/** ---- UI TOKENS (match Home UI) ---- */
const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const LABEL = "text-sm font-medium text-slate-200";
const MUTED = "text-slate-300/90";
const INPUT =
  "w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2.5 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 focus:border-transparent";

const AdminCustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AdminCustomerWithVehiclesDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await getCustomerWithVehicles(Number(id));
        setData(res);
      } catch (e: any) {
        setErr(e?.response?.data || "Failed to load customer");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const fullName = useMemo(() => {
    if (!data) return "";
    return data.name || `${data.firstName || ""} ${data.lastName || ""}`.trim();
  }, [data]);

  return (
    <div className="relative min-h-screen text-white">
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
            <Link
              to="/admin-dashboard/customers"
              className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
                <User className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Customer Details</h1>
                <p className={`${MUTED} text-sm`}>Profile & registered vehicles</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <motion.div
            className={`${CARD} p-6 lg:col-span-1`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {loading ? (
              <div className={`${MUTED}`}>Loading…</div>
            ) : err ? (
              <div className="text-rose-200">{err}</div>
            ) : !data ? (
              <div className={`${MUTED}`}>No data</div>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full grid place-items-center text-slate-950 ring-1 ring-white/10 overflow-hidden">
                    <div className={`w-full h-full ${ACCENT_GRADIENT}`} />
                  </div>
                  <div>
                    <div className="text-xl font-semibold">{fullName || "Unnamed"}</div>
                    <div className="text-sm mt-1">
                      <span
                        className={`px-2 py-0.5 rounded-full ring-1 ring-white/10 ${
                          data.isActive
                            ? "bg-emerald-500/15 text-emerald-200"
                            : "bg-slate-500/15 text-slate-200"
                        }`}
                      >
                        {data.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  {data.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-300" />
                      <span className={MUTED}>{data.email}</span>
                    </div>
                  )}
                  {data.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-300" />
                      <span className={MUTED}>{data.phoneNumber}</span>
                    </div>
                  )}
                  {data.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-300" />
                      <span className={MUTED}>
                        Created: {new Date(data.createdAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>

          {/* Vehicles */}
          <motion.div
            className={`${CARD} p-6 lg:col-span-2`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-400/20 ring-1 ring-emerald-300/30">
                  <Car className="w-5 h-5 text-emerald-300" />
                </div>
                <h2 className="text-lg font-semibold">Vehicles</h2>
              </div>
            </div>

            {loading ? (
              <div className={MUTED}>Loading vehicles…</div>
            ) : err ? (
              <div className="text-rose-200">{err}</div>
            ) : !data ? (
              <div className={MUTED}>No customer</div>
            ) : (data.vehicles?.length || 0) === 0 ? (
              <div className={MUTED}>No vehicles</div>
            ) : (
              <div className="overflow-x-auto rounded-xl ring-1 ring-white/10">
                <table className="min-w-full text-sm">
                  <thead className="bg-white/5">
                    <tr className="text-left text-slate-200">
                      <th className="px-4 py-2">Registration</th>
                      <th className="px-4 py-2">Make / Model</th>
                      <th className="px-4 py-2">Year</th>
                      <th className="px-4 py-2">Color</th>
                      <th className="px-4 py-2">VIN</th>
                      <th className="px-4 py-2">Mileage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {data.vehicles?.map((v, i) => (
                      <tr key={v.id ?? i} className="bg-white/5">
                        <td className="px-4 py-2 text-slate-200">{v.registrationNumber || "-"}</td>
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
        </div>
      </main>
    </div>
  );
};

export default AdminCustomerDetails;