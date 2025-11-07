// src/pages/Employee/ActiveProjects.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  FolderKanban,
  Car,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
} from "lucide-react";
import { listAssignedProjects, AssignedProjectDTO, ProjectStatus } from "../../api/employee";

/** ---- Theme tokens (match Admin/UserManagement glass) ---- */
const ACCENT_GRADIENT =
  "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const INPUT =
  "w-full rounded-xl bg-white/5 text-white placeholder:text-slate-400 px-3 py-2.5 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/70";
const MUTED = "text-slate-300/90";

/** Translucent status badges to match the theme */
const glassBadgeFor = (status: ProjectStatus) => {
  const base =
    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ring-1";
  const map: Record<ProjectStatus, { cls: string; Icon: React.FC<any> }> = {
    PENDING: {
      cls: `${base} bg-amber-500/10 text-amber-200 ring-amber-500/20`,
      Icon: AlertCircle,
    },
    APPROVED: {
      cls: `${base} bg-sky-500/10 text-sky-200 ring-sky-500/20`,
      Icon: FolderKanban,
    },
    IN_PROGRESS: {
      cls: `${base} bg-violet-500/10 text-violet-200 ring-violet-500/20`,
      Icon: Clock,
    },
    ON_HOLD: {
      cls: `${base} bg-slate-500/10 text-slate-200 ring-slate-500/20`,
      Icon: Clock,
    },
    COMPLETED: {
      cls: `${base} bg-emerald-500/10 text-emerald-200 ring-emerald-500/20`,
      Icon: CheckCircle,
    },
    CANCELLED: {
      cls: `${base} bg-red-500/10 text-red-200 ring-red-500/20`,
      Icon: XCircle,
    },
    REJECTED: {
      cls: `${base} bg-rose-500/10 text-rose-200 ring-rose-500/20`,
      Icon: XCircle,
    },
  };
  return map[status] ?? map.PENDING;
};

const ActiveProjects: React.FC = () => {
  const [projects, setProjects] = useState<AssignedProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listAssignedProjects();
        setProjects(Array.isArray(data) ? data : []);
        setErr(null);
      } catch (e: any) {
        setErr(e?.response?.data || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      const summary = [
        p.projectName,
        p.description,
        p.customerName,
        p.customerEmail,
        p.vehicleMake,
        p.vehicleModel,
        p.vehicleRegistrationNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return !q || summary.includes(q);
    });
  }, [projects, search]);

  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) =>
      ["APPROVED", "IN_PROGRESS", "ON_HOLD"].includes(p.status)
    ).length;
    const completedToday = 0; // keep placeholder
    return { total, active, completedToday };
  }, [projects]);

  return (
    <div className="relative text-white">
      <Backdrop />

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Active Projects</h1>
              <p className={`${MUTED} text-sm`}>Manage your assigned projects</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: "Total Projects", value: stats.total, Icon: FolderKanban },
            { label: "Active", value: stats.active, Icon: Clock },
            { label: "Completed Today", value: stats.completedToday, Icon: Calendar },
          ].map((s) => (
            <div key={s.label} className={`${CARD} p-5`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${MUTED} text-sm`}>{s.label}</p>
                  <p className="text-3xl font-extrabold tracking-tight text-cyan-300">{s.value}</p>
                </div>
                <div className="w-10 h-10 grid place-items-center rounded-xl ring-1 ring-white/10 bg-white/5">
                  <s.Icon className="w-6 h-6 text-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Search */}
        <section className={`${CARD} p-5`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by project, customer, email or vehicle…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${INPUT} pl-10`}
            />
          </div>
        </section>

        {/* List */}
        <section className={`${CARD} overflow-hidden`}>
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-cyan-300 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-300/90">Loading projects...</p>
            </div>
          ) : err ? (
            <div className="p-12 text-center text-rose-300">{err}</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl ring-1 ring-white/10 bg-white/5 grid place-items-center mb-4">
                <FolderKanban className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-lg font-semibold">No active projects</p>
              <p className={`${MUTED} mt-1`}>When projects are assigned to you, they’ll appear here.</p>
            </div>
          ) : (
            <div className="p-6">
              <ul className="space-y-4">
                {filtered.map((p) => {
                  const badge = glassBadgeFor(p.status);
                  return (
                    <li key={p.id} className="rounded-xl ring-1 ring-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`w-8 h-8 rounded-lg ${ACCENT_GRADIENT} text-slate-950 grid place-items-center ring-1 ring-white/10`}>
                              <FolderKanban className="w-4 h-4" />
                            </span>
                            <p className="font-semibold truncate">#{p.id} • {p.projectName}</p>
                            <span className={badge.cls}>
                              <badge.Icon className="w-3 h-3" />
                              {p.status}
                            </span>
                            {typeof p.progressPercentage === "number" && (
                              <span className="text-xs text-slate-300/90">• {p.progressPercentage}% done</span>
                            )}
                          </div>

                          <div className="text-sm text-slate-200 mt-2 flex flex-wrap gap-3">
                            <span className="inline-flex items-center gap-1">
                              <User className="w-4 h-4 text-slate-400" />
                              {p.customerName || p.customerEmail || "Customer"}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Car className="w-4 h-4 text-slate-400" />
                              {p.vehicleMake} {p.vehicleModel}
                              {p.vehicleYear ? ` (${p.vehicleYear})` : ""}{" "}
                              {p.vehicleRegistrationNumber ? `• ${p.vehicleRegistrationNumber}` : ""}
                            </span>
                          </div>

                          {p.description && (
                            <div className="text-sm text-slate-300/90 mt-2 whitespace-pre-line line-clamp-3">
                              {p.description}
                            </div>
                          )}
                        </div>

                        {/* Actions placeholder */}
                        <div className="flex flex-col gap-2 shrink-0 text-xs text-slate-300/80">
                          <span className="italic">Actions coming soon</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ActiveProjects;

/** ----- Backdrop (shared with Admin look) ----- */
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