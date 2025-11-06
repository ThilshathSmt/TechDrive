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

type AssignMode = "assign" | "reassign" | "approveAssign" | "reject";

const badgeFor = (status: string) => {
  const map: Record<
    string,
    { bg: string; text: string; Icon: React.FC<any> }
  > = {
    PENDING: { bg: "bg-yellow-100", text: "text-yellow-800", Icon: AlertCircle },
    APPROVED: { bg: "bg-blue-100", text: "text-blue-800", Icon: ShieldCheck },
    IN_PROGRESS: { bg: "bg-purple-100", text: "text-purple-800", Icon: Clock },
    ON_HOLD: { bg: "bg-gray-100", text: "text-gray-800", Icon: Clock },
    COMPLETED: { bg: "bg-green-100", text: "text-green-800", Icon: CheckCircle },
    CANCELLED: { bg: "bg-red-100", text: "text-red-800", Icon: XCircle },
    REJECTED: { bg: "bg-rose-100", text: "text-rose-800", Icon: XCircle },
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
        // ok to continue without employees; modal will show message
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
        // validations
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects Management</h1>
          <p className="text-gray-600 mt-1">Approve, assign, and manage projects</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Calendar className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
            <Clock className="w-10 h-10 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, customer, email or vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="md:w-56">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              {[
                "PENDING",
                "APPROVED",
                "IN_PROGRESS",
                "ON_HOLD",
                "COMPLETED",
                "CANCELLED",
                "REJECTED",
              ].map((s) => (
                <option value={s} key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {error ? (
          <div className="p-12 text-center text-red-600">{error}</div>
        ) : loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No projects found</p>
          </div>
        ) : (
          <div className="p-6">
            <ul className="space-y-4">
              {filtered.map((p) => {
                const Badge = badgeFor(p.status);
                return (
                  <li key={p.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold truncate">
                            #{p.id} • {p.projectName}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${Badge.bg} ${Badge.text} inline-flex items-center gap-1`}>
                            <Badge.Icon className="w-3 h-3" />
                            {p.status}
                          </span>
                          {typeof p.progressPercentage === "number" && (
                            <span className="text-xs text-gray-500">
                              • {p.progressPercentage}% done
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-gray-700 mt-1 flex flex-wrap gap-3">
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
                          <div className="text-sm text-gray-600 mt-2 whitespace-pre-line line-clamp-3">
                            {p.description}
                          </div>
                        )}

                        {p.assignedEmployeeName && (
                          <div className="text-xs text-gray-500 mt-2">
                            Assigned to: {p.assignedEmployeeName} {p.assignedEmployeeEmail ? `(${p.assignedEmployeeEmail})` : ""}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 shrink-0 text-sm">
                        {p.status === "PENDING" ? (
                          <>
                            <button
                              onClick={() => openModal(p, "approveAssign")}
                              className="text-blue-600 hover:underline"
                            >
                              Approve & Assign
                            </button>
                            <button
                              onClick={() => openModal(p, "reject")}
                              className="text-red-600 hover:underline"
                            >
                              Reject
                            </button>
                          </>
                        ) : p.status === "COMPLETED" || p.status === "CANCELLED" || p.status === "REJECTED" ? (
                          <span className="text-gray-500 italic">No actions</span>
                        ) : !p.assignedEmployeeId ? (
                          <button
                            onClick={() => openModal(p, "assign")}
                            className="text-blue-600 hover:underline"
                          >
                            Assign
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openModal(p, "reassign")}
                              className="text-indigo-600 hover:underline"
                            >
                              Reassign
                            </button>
                            <button
                              onClick={() => doUnassign(p)}
                              className="text-red-600 hover:underline"
                            >
                              Unassign
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && target && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {mode === "approveAssign" && <>Approve & assign project #{target.id}</>}
              {mode === "assign" && <>Assign project #{target.id}</>}
              {mode === "reassign" && <>Reassign project #{target.id}</>}
              {mode === "reject" && <>Reject project #{target.id}</>}
            </h2>

            {mode !== "reject" && (
              <>
                {empLoading ? (
                  <div className="p-4 text-gray-600">Loading employees…</div>
                ) : employees.length === 0 ? (
                  <div className="p-4 text-red-600">
                    No employees found. Ensure <b>/api/admin/employees</b> returns a list with <b>id</b>, name, email, role.
                  </div>
                ) : null}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employee</label>
                    <select
                      value={selectedEmployeeId}
                      onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                      className="mt-1 block w-full border rounded-md px-2 py-1"
                    >
                      <option value="">Select employee</option>
                      {employees.map((e) => (
                        // key is guaranteed by AdminController now setting dto.setId()
                        <option key={e.id} value={e.id}>
                          {e.name} — {e.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Estimated Cost
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={estimatedCost}
                        onChange={(e) => setEstimatedCost(e.target.value)}
                        className="mt-1 block w-full border rounded-md px-2 py-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Estimated Hours
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={estimatedHours}
                        onChange={(e) => setEstimatedHours(e.target.value)}
                        className="mt-1 block w-full border rounded-md px-2 py-1"
                      />
                    </div>
                  </div>

                  {mode === "approveAssign" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Expected Completion (optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={expectedCompletionDate}
                        onChange={(e) => setExpectedCompletionDate(e.target.value)}
                        className="mt-1 block w-full border rounded-md px-2 py-1"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {mode === "approveAssign" ? "Approval Notes (optional)" : "Admin Notes (optional)"}
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1 block w-full border rounded-md px-2 py-1 min-h-20"
                    />
                  </div>
                </div>
              </>
            )}

            {mode === "reject" && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="mt-1 block w-full border rounded-md px-2 py-1 min-h-24"
                />
              </div>
            )}

            {submitErr && <div className="text-red-600 text-sm mt-4">{submitErr}</div>}

            <div className="flex justify-end gap-2 mt-6">
              <button className="px-4 py-2 border rounded-md" onClick={closeModal} disabled={submitting}>
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-60"
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
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsManagement;