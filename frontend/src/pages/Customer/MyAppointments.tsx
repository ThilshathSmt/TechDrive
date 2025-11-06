import React from "react";
import { Calendar, Plus } from "lucide-react";
import {
  listMyAppointments,
  MyAppointmentDTO,
  deleteMyAppointment,
  cancelMyAppointment,
  updateMyAppointment,
  bookAppointment,
  getMyAppointment,
} from "../../api/appointments";
import useApi from "../../hooks/useApi";
import { listAllServices } from "../../api/services";
import { listMyVehicles } from "../../api/vehicles";

// ---- Local types just for form state ----
type FormState = {
  vehicleId?: number;
  serviceIds: number[];
  scheduledDateTime: string; // "YYYY-MM-DDTHH:mm" from <input type="datetime-local">
  customerNotes: string;
};

const toInputLocal = (isoOrLocal: string | undefined) => {
  // Accepts "YYYY-MM-DDTHH:mm" or ISO; returns "YYYY-MM-DDTHH:mm" for input control
  if (!isoOrLocal) return "";
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(isoOrLocal)) return isoOrLocal;
  const d = new Date(isoOrLocal);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};

const toBackendSeconds = (localDT: string) => {
  // Input gives "YYYY-MM-DDTHH:mm". Backend expects seconds.
  if (!localDT) return "";
  return `${localDT}:00`;
};

const MyAppointments: React.FC = () => {
  const {
    data: appointments = [],
    loading,
    error,
    refetch,
  } = useApi<MyAppointmentDTO[]>(() => listMyAppointments(), []);

  const [showModal, setShowModal] = React.useState(false);
  const [editApp, setEditApp] = React.useState<MyAppointmentDTO | null>(null);
  const [form, setForm] = React.useState<FormState>({
    vehicleId: undefined,
    serviceIds: [],
    scheduledDateTime: "",
    customerNotes: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // fetch vehicles and services for dropdowns
  const { data: services = [] } = useApi(() => listAllServices(), []);
  const { data: myVehicles = [] } = useApi(() => listMyVehicles(), []);

  const openBook = () => {
    const defaultVehicleId = myVehicles.length ? myVehicles[0].id : undefined;
    const defaultServiceIds = services.length ? [services[0].id] : [];
    setEditApp(null);
    setForm({
      vehicleId: defaultVehicleId,
      serviceIds: defaultServiceIds,
      scheduledDateTime: "",
      customerNotes: "",
    });
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = async (app: MyAppointmentDTO) => {
    setEditApp(app);
    try {
      const full = await getMyAppointment(app.id);
      setForm({
        vehicleId: full?.vehicle?.id ?? undefined,
        serviceIds: (full?.services ?? []).map((s: any) => s.id),
        scheduledDateTime: toInputLocal(full?.scheduledDateTime),
        customerNotes: full?.customerNotes ?? "",
      });
    } catch {
      // fallback to whatever is in the list item
      setForm({
        vehicleId: app?.vehicle?.id ?? undefined,
        serviceIds: (app?.services ?? []).map((s: any) => s.id),
        scheduledDateTime: toInputLocal(app?.scheduledDateTime),
        customerNotes: "",
      });
    }
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditApp(null);
    setForm({
      vehicleId: undefined,
      serviceIds: [],
      scheduledDateTime: "",
      customerNotes: "",
    });
    setFormError(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this appointment?")) return;
    setIsSubmitting(true);
    try {
      await deleteMyAppointment(id);
      await refetch();
    } catch {
      setFormError("Failed to delete appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm("Cancel this appointment?")) return;
    setIsSubmitting(true);
    try {
      await cancelMyAppointment(id);
      await refetch();
    } catch {
      setFormError("Failed to cancel appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validate = (f: FormState): string | null => {
    if (!f.vehicleId) return "Please select a vehicle.";
    if (!f.serviceIds?.length) return "Please select at least one service.";
    if (!f.scheduledDateTime) return "Please choose a date & time.";
    const dt = new Date(f.scheduledDateTime);
    if (isNaN(dt.getTime())) return "Invalid date & time.";
    if (dt < new Date()) return "Please choose a future date & time.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const msg = validate(form);
    if (msg) {
      setFormError(msg);
      setIsSubmitting(false);
      return;
    }

    const payload = {
      vehicleId: form.vehicleId!,
      serviceIds: form.serviceIds,
      scheduledDateTime: toBackendSeconds(form.scheduledDateTime),
      customerNotes: form.customerNotes?.trim() || undefined,
    };

    try {
      if (editApp) {
        await updateMyAppointment(editApp.id, payload);
      } else {
        await bookAppointment(payload);
      }
      await refetch();
      closeModal();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Failed to save appointment";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 mt-1">View and manage your service appointments</p>
        </div>
        <button
          onClick={openBook}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Book Appointment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{appointments?.length ?? 0}</p>
            </div>
            <Calendar className="w-10 h-10 text-green-500" />
          </div>
        </div>
        {/* ...other stats... */}
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading appointments...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-600">Error loading appointments</div>
        ) : !appointments || appointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No appointments yet</p>
            <button
              onClick={openBook}
              className="mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              Book your first appointment
            </button>
          </div>
        ) : (
          <div className="p-6">
            <ul className="space-y-4">
              {appointments.map((a) => (
                <li key={a.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {a.services?.map((s) => s.serviceName).join(", ") || "Services"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {a.scheduledDateTime
                          ? new Date(a.scheduledDateTime).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">{a.status}</div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => openEdit(a)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleCancel(a.id)}
                      className="text-orange-600 hover:underline text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Modal for Book/Edit Appointment */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {editApp ? "Edit Appointment" : "Book Appointment"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Vehicle */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                <select
                  value={form.vehicleId ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, vehicleId: Number(e.target.value) || undefined }))
                  }
                  required
                  className="mt-1 block w-full border rounded-md px-2 py-1"
                >
                  <option value="">Select vehicle</option>
                  {myVehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Services (multi-select) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Services</label>
                <select
                  multiple
                  value={form.serviceIds.map(String)}
                  onChange={(e) => {
                    const vals = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
                    setForm((f) => ({ ...f, serviceIds: vals }));
                  }}
                  required
                  className="mt-1 block w-full border rounded-md px-2 py-1 min-h-28"
                >
                  {services.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.serviceName} — {(s.basePrice ?? 0).toLocaleString()}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple.</p>
              </div>

              {/* Date & Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                <input
                  type="datetime-local"
                  value={form.scheduledDateTime}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, scheduledDateTime: e.target.value }))
                  }
                  required
                  className="mt-1 block w-full border rounded-md px-2 py-1"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <input
                  type="text"
                  value={form.customerNotes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customerNotes: e.target.value }))
                  }
                  className="mt-1 block w-full border rounded-md px-2 py-1"
                  placeholder="Anything specific you'd like us to check?"
                />
              </div>

              {formError && <div className="text-red-600 text-sm">{formError}</div>}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : editApp ? "Update" : "Book"}
                </button>
              </div>
            </form>
            {/* Hidden submit payload preview for debugging (optional)
            <pre className="text-xs mt-3 bg-gray-50 p-2 rounded">
              {JSON.stringify(
                {
                  ...form,
                  scheduledDateTime: toBackendSeconds(form.scheduledDateTime),
                },
                null,
                2
              )}
            </pre>
            */}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;