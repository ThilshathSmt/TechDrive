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
} from  "../../api/appointments";
import { listEmployees, EmployeeLite } from "../../api/admin";

type AssignMode = "assign" | "reassign";

const badgeFor = (status: string) => {
  const map: Record<
    string,
    { bg: string; text: string; Icon: React.FC<any> }
  > = {
    PENDING: { bg: "bg-yellow-100", text: "text-yellow-800", Icon: AlertCircle },
    SCHEDULED: { bg: "bg-blue-100", text: "text-blue-800", Icon: Calendar },
    CONFIRMED: { bg: "bg-blue-100", text: "text-blue-800", Icon: ShieldCheck },
    IN_PROGRESS: { bg: "bg-purple-100", text: "text-purple-800", Icon: Clock },
    COMPLETED: { bg: "bg-green-100", text: "text-green-800", Icon: CheckCircle },
    CANCELLED: { bg: "bg-red-100", text: "text-red-800", Icon: XCircle },
    NO_SHOW: { bg: "bg-orange-100", text: "text-orange-800", Icon: AlertCircle },
    ON_HOLD: { bg: "bg-gray-100", text: "text-gray-800", Icon: Clock },
    RESCHEDULED: { bg: "bg-indigo-100", text: "text-indigo-800", Icon: Calendar },
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

  useEffect(() => {
    (async () => {
      try {
        setEmpLoading(true);
        const emps = await listEmployees(); // MUST return ids!
        setEmployees(emps.filter(e => (e.role || "").toUpperCase() === "EMPLOYEE"));
      } catch (e: any) {
        // still allow page to render; assignment modal will show warning
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
      // refresh local list
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments Management</h1>
          <p className="text-gray-600 mt-1">View and assign appointments</p>
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
              <p className="text-gray-600 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
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
                placeholder="Search by customer, email or vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
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
                <option value={s} key={s}>
                  {s}
                </option>
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
            <p className="mt-4 text-gray-600">Loading appointments...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No appointments found</p>
          </div>
        ) : (
          <div className="p-6">
            <ul className="space-y-4">
              {filtered.map((a) => {
                const Badge = badgeFor(a.status);
                return (
                  <li key={a.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">
                            #{a.id} • {new Date(a.scheduledDateTime).toLocaleString()}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${Badge.bg} ${Badge.text} inline-flex items-center gap-1`}>
                            <Badge.Icon className="w-3 h-3" />
                            {a.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 mt-1 flex flex-wrap gap-3">
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
                          <div className="text-xs text-gray-500 mt-2">
                            Services:{" "}
                            {a.services.map((s) => s.serviceName).join(", ")}
                          </div>
                        )}
                        {a.customerNotes && (
                          <div className="text-sm text-gray-600 mt-2 whitespace-pre-line">
                            Notes: {a.customerNotes}
                          </div>
                        )}
                        {a.assignedEmployeeName && (
                          <div className="text-xs text-gray-500 mt-2">
                            Assigned to: {a.assignedEmployeeName} {a.assignedEmployeeEmail ? `(${a.assignedEmployeeEmail})` : ""}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 shrink-0 text-sm">
                        {!a.assignedEmployeeId ? (
                          <button
                            onClick={() => openAssignModal(a, "assign")}
                            className="text-blue-600 hover:underline"
                          >
                            Assign
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openAssignModal(a, "reassign")}
                              className="text-indigo-600 hover:underline"
                            >
                              Reassign
                            </button>
                            <button
                              onClick={() => doUnassign(a)}
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

      {/* Assign / Reassign Modal */}
      {showAssign && targetAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4 capitalize">
              {assignMode} appointment #{targetAppointment.id}
            </h2>

            {empLoading ? (
              <div className="p-4 text-gray-600">Loading employees…</div>
            ) : employees.length === 0 ? (
              <div className="p-4 text-red-600">
                No employees found. Ensure `/api/admin/employees` returns a list with <b>id</b>, name, email, role.
              </div>
            ) : null}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Employee
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                  className="mt-1 block w-full border rounded-md px-2 py-1"
                >
                  <option value="">Select employee</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} — {e.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Admin Notes (optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(ev) => setAdminNotes(ev.target.value)}
                  className="mt-1 block w-full border rounded-md px-2 py-1 min-h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Final Cost (optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={finalCost}
                  onChange={(ev) => setFinalCost(ev.target.value)}
                  className="mt-1 block w-full border rounded-md px-2 py-1"
                />
              </div>

              {submitErr && <div className="text-red-600 text-sm">{submitErr}</div>}

              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 border rounded-md"
                  onClick={closeAssign}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-60"
                  onClick={doAssign}
                  disabled={submitting || employees.length === 0}
                >
                  {submitting ? "Saving..." : assignMode === "assign" ? "Assign" : "Reassign"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsManagement;