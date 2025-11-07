// src/pages/Employee/MyAssignments.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Car,
  User,
  Loader,
  AlertCircle,
  Search,
  CheckCircle,
  XCircle,
  ClipboardList,
} from "lucide-react";
import { listAssignedAppointments } from "../../api/employee";

// ---------------------------
// Theme tokens
// ---------------------------
const ACCENT_GRADIENT =
  "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const INPUT =
  "w-full rounded-xl bg-white/5 text-white placeholder:text-slate-400 px-3 py-2.5 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/70";
const PILL = "px-2 py-0.5 rounded-full text-xs inline-flex items-center gap-1";

// ---------------------------
// Status badge mapper
// ---------------------------
type StatusKey =
  | "PENDING"
  | "APPROVED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED"
  | string;

const statusBadge = (status: StatusKey) => {
  const map: Record<
    string,
    { cls: string; Icon: React.FC<any> }
  > = {
    PENDING: { cls: "bg-yellow-500/10 text-yellow-300 ring-1 ring-yellow-500/20", Icon: AlertCircle },
    APPROVED: { cls: "bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/20", Icon: ClipboardList },
    IN_PROGRESS: { cls: "bg-purple-500/10 text-purple-300 ring-1 ring-purple-500/20", Icon: Clock },
    ON_HOLD: { cls: "bg-slate-500/10 text-slate-300 ring-1 ring-slate-500/20", Icon: Clock },
    COMPLETED: { cls: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20", Icon: CheckCircle },
    CANCELLED: { cls: "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20", Icon: XCircle },
    REJECTED: { cls: "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20", Icon: XCircle },
  };
  return map[status] || map.PENDING;
};

const MyAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listAssignedAppointments();
        setAssignments(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setErr(e?.response?.data || "Failed to load assignments");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return assignments;
    return assignments.filter((a) => {
      const hay =
        [
          a.id,
          a.status,
          a.customerName,
          a.customerEmail,
          a.vehicleMake,
          a.vehicleModel,
          a.vehicleRegistrationNumber,
          a.services?.map((s: any) => s?.serviceName).join(" "),
          a.scheduledDateTime,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase() || "";
      return hay.includes(q);
    });
  }, [assignments, search]);

  const stats = useMemo(() => {
    const total = assignments.length;
    const inProgress = assignments.filter(
      (a) => String(a.status).toUpperCase() === "IN_PROGRESS"
    ).length;
    const active = assignments.filter((a) =>
      ["APPROVED", "IN_PROGRESS", "ON_HOLD"].includes(String(a.status).toUpperCase())
    ).length;
    const completedToday = 0; // wire up if you track completion dates
    return { total, inProgress, active, completedToday };
  }, [assignments]);

  return (
    <div className="relative text-white">
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

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                My Assignments
              </h1>
              <p className="text-slate-300/90 mt-1">
                View your assigned appointments
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            { label: "Total", value: stats.total, Icon: Calendar },
            { label: "Active", value: stats.active, Icon: Clock },
            { label: "In Progress", value: stats.inProgress, Icon: Clock },
            { label: "Completed Today", value: stats.completedToday, Icon: Calendar },
          ].map((s) => (
            <div key={s.label} className={`${CARD} p-5`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300/90 text-sm">{s.label}</p>
                  <p className="text-3xl font-extrabold tracking-tight text-cyan-300">
                    {s.value}
                  </p>
                </div>
                <div className="w-10 h-10 grid place-items-center rounded-xl ring-1 ring-white/10 bg-white/5">
                  <s.Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className={`${CARD} p-5`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by customer, email, vehicle, status…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${INPUT} pl-10`}
            />
          </div>
        </div>

        {/* List */}
        <div className={`${CARD} overflow-hidden`}>
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center gap-3 text-slate-200">
                <Loader className="w-6 h-6 animate-spin text-cyan-300" />
                <span>Loading assignments…</span>
              </div>
            </div>
          ) : err ? (
            <div className="p-12 text-center text-rose-300">{err}</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-300/90">No assignments found</p>
            </div>
          ) : (
            <div className="p-6">
              <ul className="space-y-4">
                {filtered.map((a: any) => {
                  const S = statusBadge(String(a.status).toUpperCase());
                  return (
                    <li key={a.id} className="ring-1 ring-white/10 rounded-xl p-4 bg-white/5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold truncate">
                              #{a.id} •{" "}
                              {a.scheduledDateTime
                                ? new Date(a.scheduledDateTime).toLocaleString()
                                : "—"}
                            </p>
                            <span className={`${PILL} ${S.cls}`}>
                              <S.Icon className="w-3.5 h-3.5" />
                              {a.status}
                            </span>
                          </div>

                          <div className="text-sm text-slate-200/90 mt-1 flex flex-wrap gap-3">
                            <span className="inline-flex items-center gap-1">
                              <User className="w-4 h-4 text-slate-400" />
                              {a.customerName || a.customerEmail || "Customer"}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Car className="w-4 h-4 text-slate-400" />
                              {a.vehicleMake} {a.vehicleModel}
                              {a.vehicleYear ? ` (${a.vehicleYear})` : ""}{" "}
                              {a.vehicleRegistrationNumber
                                ? `• ${a.vehicleRegistrationNumber}`
                                : ""}
                            </span>
                          </div>

                          {a.services && a.services.length > 0 && (
                            <div className="text-xs text-slate-300 mt-2">
                              Services:{" "}
                              {a.services.map((s: any) => s?.serviceName).join(", ")}
                            </div>
                          )}
                        </div>

                        {/* Future actions area */}
                        <div className="shrink-0 text-sm text-slate-400 italic">
                          Actions coming soon
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyAssignments;