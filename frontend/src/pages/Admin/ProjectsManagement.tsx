// src/pages/Admin/ProjectsManagement.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Car,
  ShieldCheck,
} from "lucide-react";
import {
  listAllProjects,
  AdminProjectDTO,
  approveAndAssignProject,
  assignProject,
  unassignProject,
  rejectProject,
  ProjectStatus,
} from "../../api/projects";
import { listEmployees, EmployeeLite } from "../../api/admin";
import { motion } from "framer-motion";

/** ---- UI TOKENS (match Home) ---- */
const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const INPUT =
  "w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2.5 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 focus:border-transparent";
const LABEL = "block text-sm font-medium text-slate-200";
const MUTED = "text-slate-300/90";
const CHIP = "px-2 py-0.5 text-xs rounded-full ring-1 ring-white/10";

type AssignMode = "assign" | "reassign" | "approveAssign" | "reject";

const badgeFor = (status: string) => {
  const map: Record<
    string,
    { cls: string; Icon: React.FC<any> }
  > = {
    PENDING: { cls: "bg-yellow-500/15 text-yellow-200 ring-yellow-400/30", Icon: AlertCircle },
    APPROVED: { cls: "bg-blue-500/15 text-blue-200 ring-blue-400/30", Icon: ShieldCheck },
    IN_PROGRESS: { cls: "bg-purple-500/15 text-purple-200 ring-purple-400/30", Icon: Clock },
    ON_HOLD: { cls: "bg-slate-500/15 text-slate-200 ring-slate-400/30", Icon: Clock },
    COMPLETED: { cls: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30", Icon: CheckCircle },
    CANCELLED: { cls: "bg-rose-500/15 text-rose-200 ring-rose-400/30", Icon: XCircle },
    REJECTED: { cls: "bg-rose-600/15 text-rose-200 ring-rose-400/30", Icon: XCircle },
  };
  return map[status] || map.PENDING;
};

const ProjectsManagement: React.FC = () => {
  const [projects, setProjects] = useState<AdminProjectDTO[]>([]);
  const [employees, setEmployees] = useState<EmployeeLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [empLoading, setEmpLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<AssignMode>("assign");
  const [target, setTarget] = useState<AdminProjectDTO | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">("");
  const [estimatedCost, setEstimatedCost] = useState<string>("");
  const [estimatedHours, setEstimatedHours] = useState<string>("");
  const [expectedCompletionDate, setExpectedCompletionDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [rejectReason, setRejectReason] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAllProjects();
      setProjects(data);
    } catch (e: any) {
      setError(e?.response?.data || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setEmpLoading(true);
        const emps = await listEmployees();
        setEmployees(emps.filter((e) => (e.role || "").toUpperCase() === "EMPLOYEE"));
      } catch {
        // continue; modal will surface
      } finally {
        setEmpLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return projects.filter((p) => {
      const matchStatus = statusFilter === "ALL" || p.status === (statusFilter as ProjectStatus);
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
      const matchSearch = !search || summary.includes(search);
      return matchStatus && matchSearch;
    });
  }, [projects, statusFilter, searchTerm]);

  const stats = useMemo(() => {
    const total = projects.length;
    const by = (s: ProjectStatus) => projects.filter((p) => p.status === s).length;
    return {
      total,
      pending: by("PENDING"),
      active: by("APPROVED") + by("IN_PROGRESS") + by("ON_HOLD"),
      completed: by("COMPLETED"),
    };
  }, [projects]);

  const openModal = (p: AdminProjectDTO, m: AssignMode) => {
    setTarget(p);
    setMode(m);
    setSelectedEmployeeId(p.assignedEmployeeId || "");
    setEstimatedCost(p.estimatedCost ? String(p.estimatedCost) : "");
    setEstimatedHours(p.estimatedDurationHours ? String(p.estimatedDurationHours) : "");
    setExpectedCompletionDate(p.expectedCompletionDate || "");
    setNotes("");
    setRejectReason("");
    setSubmitErr(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTarget(null);
    setSelectedEmployeeId("");
    setEstimatedCost("");
    setEstimatedHours("");
    setExpectedCompletionDate("");
    setNotes("");
    setRejectReason("");
    setSubmitErr(null);
  };

  const doSubmit = async () => {
    if (!target) return;
    setSubmitting(true);
    setSubmitErr(null);
    try {
      if (mode === "approveAssign") {
        if (!selectedEmployeeId || typeof selectedEmployeeId !== "number") {
          setSubmitErr("Please select an employee.");
          setSubmitting(false);
          return;
        }
        if (!estimatedCost || !estimatedHours) {
          setSubmitErr("Estimated cost and duration are required.");
          setSubmitting(false);
          return;
        }
        await approveAndAssignProject(target.id, {
          employeeId: selectedEmployeeId,
          estimatedCost: Number(estimatedCost),
          estimatedDurationHours: Number(estimatedHours),
          expectedCompletionDate: expectedCompletionDate || undefined,
          approvalNotes: notes.trim() || undefined,
        });
      } else if (mode === "assign" || mode === "reassign") {
        if (!selectedEmployeeId || typeof selectedEmployeeId !== "number") {
          setSubmitErr("Please select an employee.");
          setSubmitting(false);
          return;
        }
        if (!estimatedCost || !estimatedHours) {
          setSubmitErr("Estimated cost and duration are required.");
          setSubmitting(false);
          return;
        }
        await assignProject(target.id, {
          employeeId: selectedEmployeeId,
          estimatedCost: Number(estimatedCost),
          estimatedDurationHours: Number(estimatedHours),
          adminNotes: notes.trim() || undefined,
        });
      } else if (mode === "reject") {
        if (!rejectReason.trim()) {
          setSubmitErr("Rejection reason is required.");
          setSubmitting(false);
          return;
        }
        await rejectProject(target.id, { rejectionReason: rejectReason.trim() });
      }
      await refresh();
      closeModal();
    } catch (e: any) {
      setSubmitErr(e?.response?.data || "Action failed");
    } finally {
      setSubmitting(false);
    }
  };

  const doUnassign = async (p: AdminProjectDTO) => {
    if (!confirm("Unassign the employee from this project?")) return;
    try {
      await unassignProject(p.id);
      await refresh();
    } catch (e: any) {
      alert(e?.response?.data || "Failed to unassign");
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* Themed Backdrop */}
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
            <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Projects Management</h1>
              <p className={`${MUTED} text-sm`}>Approve, assign, and manage projects</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            { label: "Total", value: stats.total, icon: Calendar, accent: "text-cyan-300" },
            { label: "Pending", value: stats.pending, icon: AlertCircle, accent: "text-yellow-300" },
            { label: "Active", value: stats.active, icon: Clock, accent: "text-indigo-300" },
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
                  <div className="text-3xl font-extrabold tracking-tight text-cyan-300">{s.value}</div>
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
                  placeholder="Search by name, customer, email or vehicle..."
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
                className={`${INPUT} mt-1`}
              >
                <option className="bg-slate-800" value="ALL">All Status</option>
                {["PENDING","APPROVED","IN_PROGRESS","ON_HOLD","COMPLETED","CANCELLED","REJECTED"].map((s) => (
                  <option key={s} value={s} className="bg-slate-800">
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
            <div className="p-12 text-center text-rose-200">{error}</div>
          ) : loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-cyan-300 border-t-transparent rounded-full animate-spin"></div>
              <p className={`${MUTED} mt-4`}>Loading projects...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className={MUTED}>No projects found</p>
            </div>
          ) : (
            <div className="p-6">
              <ul className="space-y-4">
                {filtered.map((p) => {
                  const B = badgeFor(p.status);
                  return (
                    <motion.li
                      key={p.id}
                      className="p-4 rounded-xl ring-1 ring-white/10 bg-white/5"
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold truncate">#{p.id} • {p.projectName}</p>
                            <span className={`${CHIP} ${B.cls} inline-flex items-center gap-1`}>
                              <B.Icon className="w-3 h-3" />
                              {p.status}
                            </span>
                            {typeof p.progressPercentage === "number" && (
                              <span className={`${MUTED} text-xs`}>• {p.progressPercentage}% done</span>
                            )}
                          </div>

                          <div className={`${MUTED} mt-1 flex flex-wrap gap-3 text-sm`}>
                            <span className="inline-flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {p.customerName || p.customerEmail || "Customer"}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Car className="w-4 h-4" />
                              {p.vehicleMake} {p.vehicleModel}
                              {p.vehicleYear ? ` (${p.vehicleYear})` : ""}{" "}
                              {p.vehicleRegistrationNumber ? `• ${p.vehicleRegistrationNumber}` : ""}
                            </span>
                          </div>

                          {p.description && (
                            <div className="text-sm text-slate-200/90 mt-2 whitespace-pre-line line-clamp-3">
                              {p.description}
                            </div>
                          )}

                          {p.assignedEmployeeName && (
                            <div className="text-xs text-slate-300 mt-2">
                              Assigned to: {p.assignedEmployeeName} {p.assignedEmployeeEmail ? `(${p.assignedEmployeeEmail})` : ""}
                            </div>
                          )}

                          {p.timeLogsCount !== undefined && p.timeLogsCount > 0 && (
                            <div className="flex items-center gap-2 mt-2 text-xs">
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-400/20">
                                <Clock className="w-3 h-3" />
                                {p.timeLogsCount} time log{p.timeLogsCount > 1 ? 's' : ''}
                              </span>
                              {p.totalTimeLoggedHours !== undefined && p.totalTimeLoggedHours > 0 && (
                                <span className="text-slate-400">
                                  • {p.totalTimeLoggedHours.toFixed(1)}h logged
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 shrink-0 text-sm">
                          {p.status === "PENDING" ? (
                            <>
                              <button
                                onClick={() => openModal(p, "approveAssign")}
                                className="text-cyan-300 hover:underline"
                              >
                                Approve & Assign
                              </button>
                              <button
                                onClick={() => openModal(p, "reject")}
                                className="text-rose-300 hover:underline"
                              >
                                Reject
                              </button>
                            </>
                          ) : p.status === "COMPLETED" || p.status === "CANCELLED" || p.status === "REJECTED" ? (
                            <span className={`${MUTED} italic`}>No actions</span>
                          ) : !p.assignedEmployeeId ? (
                            <button
                              onClick={() => openModal(p, "assign")}
                              className="text-cyan-300 hover:underline"
                            >
                              Assign
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => openModal(p, "reassign")}
                                className="text-indigo-300 hover:underline"
                              >
                                Reassign
                              </button>
                              <button
                                onClick={() => doUnassign(p)}
                                className="text-rose-300 hover:underline"
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

      {/* Modal */}
      {showModal && target && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${CARD} max-w-lg w-full p-6 text-white relative`}
          >
            <h2 className="text-xl font-bold mb-4">
              {mode === "approveAssign" && <>Approve & assign project #{target.id}</>}
              {mode === "assign" && <>Assign project #{target.id}</>}
              {mode === "reassign" && <>Reassign project #{target.id}</>}
              {mode === "reject" && <>Reject project #{target.id}</>}
            </h2>

            {mode !== "reject" && (
              <>
                {empLoading ? (
                  <div className={`${MUTED} p-2`}>Loading employees…</div>
                ) : employees.length === 0 ? (
                  <div className="text-rose-200">
                    No employees found. Ensure <b>/api/admin/employees</b> returns a list with <b>id</b>, name, email, role.
                  </div>
                ) : null}

                <div className="space-y-4 mt-3">
                  <div>
                    <label className={LABEL}>Employee</label>
                    <select
                      value={selectedEmployeeId}
                      onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                      className={`${INPUT} mt-1`}
                    >
                      <option className="bg-slate-800" value="">Select employee</option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.id} className="bg-slate-800">
                          {e.name} — {e.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Estimated Cost</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={estimatedCost}
                        onChange={(e) => setEstimatedCost(e.target.value)}
                        className={`${INPUT} mt-1`}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Estimated Hours</label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={estimatedHours}
                        onChange={(e) => setEstimatedHours(e.target.value)}
                        className={`${INPUT} mt-1`}
                      />
                    </div>
                  </div>

                  {mode === "approveAssign" && (
                    <div>
                      <label className={LABEL}>Expected Completion (optional)</label>
                      <input
                        type="datetime-local"
                        value={expectedCompletionDate}
                        onChange={(e) => setExpectedCompletionDate(e.target.value)}
                        className={`${INPUT} mt-1`}
                      />
                    </div>
                  )}

                  <div>
                    <label className={LABEL}>
                      {mode === "approveAssign" ? "Approval Notes (optional)" : "Admin Notes (optional)"}
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className={`${INPUT} mt-1 min-h-24`}
                    />
                  </div>
                </div>
              </>
            )}

            {mode === "reject" && (
              <div className="space-y-2 mt-3">
                <label className={LABEL}>Rejection Reason</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className={`${INPUT} min-h-28`}
                />
              </div>
            )}

            {submitErr && (
              <div className="mt-4 inline-flex items-center gap-2 text-sm text-rose-200 bg-rose-500/10 ring-1 ring-rose-400/20 px-3 py-2 rounded-xl">
                {submitErr}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
                onClick={closeModal}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded-xl font-semibold ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10 hover:brightness-110 disabled:opacity-60`}
                onClick={doSubmit}
                disabled={submitting || (mode !== "reject" && employees.length === 0)}
              >
                {submitting
                  ? "Saving..."
                  : mode === "approveAssign"
                  ? "Approve & Assign"
                  : mode === "assign"
                  ? "Assign"
                  : mode === "reassign"
                  ? "Reassign"
                  : "Reject"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectsManagement;