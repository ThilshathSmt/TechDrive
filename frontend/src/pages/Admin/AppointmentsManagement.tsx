// src/pages/Admin/AppointmentsManagement.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Search,
  Clock,
  User,
  Car,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import {
  listAllAppointments,
  AdminAppointmentDTO,
  assignAppointment,
  reassignAppointment,
  unassignAppointment,
} from "../../api/appointments";
import { listEmployees, EmployeeLite } from "../../api/admin";
import { motion } from "framer-motion";

/** ---- UI TOKENS (match Home) ---- */
const ACCENT_GRADIENT =
  "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const INPUT =
  "w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2.5 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 focus:border-transparent";
const SELECT = INPUT;
const LABEL = "block text-sm font-medium text-slate-200";
const MUTED = "text-slate-300/90";

type AssignMode = "assign" | "reassign";

const badgeFor = (status: string) => {
  const map: Record<
    string,
    { chip: string; text: string; Icon: React.FC<any> }
  > = {
    PENDING: { chip: "bg-amber-500/15 ring-amber-400/30", text: "text-amber-200", Icon: AlertCircle },
    SCHEDULED: { chip: "bg-sky-500/15 ring-sky-400/30", text: "text-sky-200", Icon: Calendar },
    CONFIRMED: { chip: "bg-cyan-500/15 ring-cyan-400/30", text: "text-cyan-200", Icon: ShieldCheck },
    IN_PROGRESS: { chip: "bg-violet-500/15 ring-violet-400/30", text: "text-violet-200", Icon: Clock },
    COMPLETED: { chip: "bg-emerald-500/15 ring-emerald-400/30", text: "text-emerald-200", Icon: CheckCircle },
    CANCELLED: { chip: "bg-rose-500/15 ring-rose-400/30", text: "text-rose-200", Icon: XCircle },
    NO_SHOW: { chip: "bg-orange-500/15 ring-orange-400/30", text: "text-orange-200", Icon: AlertCircle },
    ON_HOLD: { chip: "bg-slate-500/15 ring-slate-400/30", text: "text-slate-200", Icon: Clock },
    RESCHEDULED: { chip: "bg-indigo-500/15 ring-indigo-400/30", text: "text-indigo-200", Icon: Calendar },
  };
  return map[status] || map.PENDING;
};

const AppointmentsManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<AdminAppointmentDTO[]>([]);
  const [employees, setEmployees] = useState<EmployeeLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [empLoading, setEmpLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Assign modal state
  const [showAssign, setShowAssign] = useState(false);
  const [assignMode, setAssignMode] = useState<AssignMode>("assign");
  const [targetAppointment, setTargetAppointment] = useState<AdminAppointmentDTO | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">("");
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [finalCost, setFinalCost] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);

  // Load appointments
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listAllAppointments();
        setAppointments(data);
      } catch (e: any) {
        setError(e?.response?.data || "Failed to load appointments");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load employees
  useEffect(() => {
    (async () => {
      try {
        setEmpLoading(true);
        const emps = await listEmployees(); // MUST return ids!
        setEmployees(emps.filter((e: any) => (e.role || "").toUpperCase() === "EMPLOYEE"));
      } catch {
        // keep UI usable
      } finally {
        setEmpLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return appointments.filter((a) => {
      const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
      const summary = [
        a.customerName,
        a.customerEmail,
        a.vehicleMake,
        a.vehicleModel,
        a.vehicleRegistrationNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchSearch = !search || summary.includes(search);
      return matchStatus && matchSearch;
    });
  }, [appointments, statusFilter, searchTerm]);

  const stats = useMemo(() => {
    const total = appointments.length;
    const byStatus = (s: string) => appointments.filter((a) => a.status === s).length;
    return {
      total,
      pending: byStatus("PENDING") + byStatus("SCHEDULED"),
      inProgress: byStatus("IN_PROGRESS"),
      completed: byStatus("COMPLETED"),
    };
  }, [appointments]);

  const openAssignModal = (appointment: AdminAppointmentDTO, mode: AssignMode) => {
    setTargetAppointment(appointment);
    setAssignMode(mode);
    setSelectedEmployeeId(appointment.assignedEmployeeId || "");
    setAdminNotes("");
    setFinalCost(appointment.finalCost ? String(appointment.finalCost) : "");
    setSubmitErr(null);
    setShowAssign(true);
  };

  const closeAssign = () => {
    setShowAssign(false);
    setTargetAppointment(null);
    setSelectedEmployeeId("");
    setAdminNotes("");
    setFinalCost("");
    setSubmitErr(null);
  };

  const doAssign = async () => {
    if (!targetAppointment) return;
    if (!selectedEmployeeId || typeof selectedEmployeeId !== "number") {
      setSubmitErr("Please select an employee.");
      return;
    }
    setSubmitting(true);
    setSubmitErr(null);
    try {
      const payload = {
        employeeId: selectedEmployeeId,
        adminNotes: adminNotes.trim() || undefined,
        finalCost:
          finalCost.trim() === "" ? undefined : Number(finalCost.replace(/,/g, "")),
      };
      if (assignMode === "assign") {
        await assignAppointment(targetAppointment.id, payload);
      } else {
        await reassignAppointment(targetAppointment.id, payload);
      }
      const refreshed = await listAllAppointments();
      setAppointments(refreshed);
      closeAssign();
    } catch (e: any) {
      setSubmitErr(e?.response?.data || "Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const doUnassign = async (a: AdminAppointmentDTO) => {
    if (!confirm("Unassign the employee from this appointment?")) return;
    try {
      await unassignAppointment(a.id);
      const refreshed = await listAllAppointments();
      setAppointments(refreshed);
    } catch (e: any) {
      alert(e?.response?.data || "Failed to unassign");
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* Backdrop like Home */}
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
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Appointments</h1>
              <p className={`${MUTED} text-sm`}>View and assign appointments</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            { label: "Total", value: stats.total, icon: Calendar, accent: "text-cyan-300" },
            { label: "Pending", value: stats.pending, icon: AlertCircle, accent: "text-amber-300" },
            { label: "In Progress", value: stats.inProgress, icon: Clock, accent: "text-violet-300" },
            { label: "Completed", value: stats.completed, icon: CheckCircle, accent: "text-emerald-300" },
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

        {/* Filters */}
        <section className={`${CARD} p-6`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className={LABEL} htmlFor="search">Search</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search by customer, email or vehicle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${INPUT} pl-10`}
                />
              </div>
            </div>
            <div className="md:w-56">
              <label className={LABEL} htmlFor="status">Status</label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`${SELECT} appearance-none`}
              >
                <option className="bg-slate-900" value="ALL">All Status</option>
                {[
                  "PENDING",
                  "SCHEDULED",
                  "CONFIRMED",
                  "RESCHEDULED",
                  "IN_PROGRESS",
                  "ON_HOLD",
                  "COMPLETED",
                  "CANCELLED",
                  "NO_SHOW",
                ].map((s) => (
                  <option className="bg-slate-900" value={s} key={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* List */}
        <section className={`${CARD} overflow-hidden`}>
          {error ? (
            <div className="p-10 text-rose-200">{error}</div>
          ) : loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-cyan-300 border-t-transparent rounded-full animate-spin"></div>
              <p className={`${MUTED} mt-4`}>Loading appointments...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className={MUTED}>No appointments found</p>
            </div>
          ) : (
            <div className="p-6">
              <ul className="space-y-4">
                {filtered.map((a) => {
                  const Badge = badgeFor(a.status);
                  return (
                    <motion.li
                      key={a.id}
                      className="rounded-xl ring-1 ring-white/10 bg-white/5 p-4"
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold truncate">
                              #{a.id} • {new Date(a.scheduledDateTime).toLocaleString()}
                            </p>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ring-1 inline-flex items-center gap-1 ${Badge.chip} ${Badge.text}`}
                            >
                              <Badge.Icon className="w-3 h-3" />
                              {a.status}
                            </span>
                          </div>

                          <div className={`${MUTED} text-sm mt-1 flex flex-wrap gap-3`}>
                            <span className="inline-flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {a.customerName || a.customerEmail || "Customer"}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Car className="w-4 h-4" />
                              {a.vehicleMake} {a.vehicleModel}
                              {a.vehicleYear ? ` (${a.vehicleYear})` : ""}{" "}
                              {a.vehicleRegistrationNumber ? `• ${a.vehicleRegistrationNumber}` : ""}
                            </span>
                          </div>

                          {a.services && a.services.length > 0 && (
                            <div className="text-xs text-slate-400 mt-2">
                              Services: {a.services.map((s) => s.serviceName).join(", ")}
                            </div>
                          )}

                          {a.customerNotes && (
                            <div className={`${MUTED} text-sm mt-2 whitespace-pre-line`}>
                              Notes: {a.customerNotes}
                            </div>
                          )}

                          {a.assignedEmployeeName && (
                            <div className="text-xs text-slate-400 mt-2">
                              Assigned to: {a.assignedEmployeeName}{" "}
                              {a.assignedEmployeeEmail ? `(${a.assignedEmployeeEmail})` : ""}
                            </div>
                          )}

                          {a.timeLogsCount !== undefined && a.timeLogsCount > 0 && (
                            <div className="flex items-center gap-2 mt-2 text-xs">
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-400/20">
                                <Clock className="w-3 h-3" />
                                {a.timeLogsCount} time log{a.timeLogsCount > 1 ? 's' : ''}
                              </span>
                              {a.totalTimeLoggedMinutes !== undefined && a.totalTimeLoggedMinutes > 0 && (
                                <span className="text-slate-400">
                                  • {(a.totalTimeLoggedMinutes / 60).toFixed(1)}h logged
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 shrink-0 text-sm">
                          {!a.assignedEmployeeId ? (
                            <button
                              onClick={() => openAssignModal(a, "assign")}
                              className={`${ACCENT_GRADIENT} text-slate-950 px-3 py-1.5 rounded-lg ring-1 ring-white/10 hover:brightness-110`}
                            >
                              Assign
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => openAssignModal(a, "reassign")}
                                className="px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
                              >
                                Reassign
                              </button>
                              <button
                                onClick={() => doUnassign(a)}
                                className="px-3 py-1.5 rounded-lg bg-rose-500/15 ring-1 ring-rose-400/30 text-rose-200 hover:bg-rose-500/20"
                              >
                                Unassign
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      </main>

      {/* Assign / Reassign Modal */}
      {showAssign && targetAppointment && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeAssign} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`${CARD} relative z-10 w-full max-w-xl p-6 text-white`}
          >
            <h2 className="text-xl font-bold mb-2 capitalize">
              {assignMode} appointment #{targetAppointment.id}
            </h2>
            <p className={`${MUTED} text-sm mb-4`}>
              Scheduled: {new Date(targetAppointment.scheduledDateTime).toLocaleString()}
            </p>

            {empLoading ? (
              <div className={`${MUTED}`}>Loading employees…</div>
            ) : employees.length === 0 ? (
              <div className="text-rose-200">
                No employees found. Ensure <code>/api/admin/employees</code> returns a list with <b>id</b>, name, email, role.
              </div>
            ) : null}

            <div className="grid gap-4">
              <div>
                <label className={LABEL}>Employee</label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                  className={`${SELECT} mt-1 appearance-none`}
                >
                  <option className="bg-slate-900" value="">
                    Select employee
                  </option>
                  {employees.map((e) => (
                    <option className="bg-slate-900" key={e.id} value={e.id}>
                      {e.name} — {e.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL}>Admin Notes (optional)</label>
                <textarea
                  value={adminNotes}
                  onChange={(ev) => setAdminNotes(ev.target.value)}
                  className={`${INPUT} mt-1 min-h-24`}
                />
              </div>

              <div>
                <label className={LABEL}>Final Cost (optional)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={finalCost}
                  onChange={(ev) => setFinalCost(ev.target.value)}
                  className={`${INPUT} mt-1`}
                />
              </div>

              {submitErr && (
                <div className="text-rose-200 text-sm bg-rose-500/10 ring-1 ring-rose-400/20 px-3 py-2 rounded-xl">
                  {submitErr}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  className="px-4 py-2 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
                  onClick={closeAssign}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  className={`${ACCENT_GRADIENT} text-slate-950 px-4 py-2 rounded-xl ring-1 ring-white/10 hover:brightness-110 disabled:opacity-60`}
                  onClick={doAssign}
                  disabled={submitting || employees.length === 0}
                >
                  {submitting ? "Saving..." : assignMode === "assign" ? "Assign" : "Reassign"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsManagement;