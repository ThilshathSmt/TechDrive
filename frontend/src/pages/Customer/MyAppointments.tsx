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

/* ---- Theme tokens (match Admin/UserManagement) ---- */
const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const BTN_BASE =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-0 ring-1 ring-white/10";
const INPUT =
  "mt-1 w-full rounded-xl bg-white/5 text-white placeholder:text-slate-400 px-3 py-2.5 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/70";

/* ---- Local types just for form state ---- */
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
    <div className="relative text-white">
      {/* Backdrop (dark/neon grid) */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/80 to-slate-950/80" />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[50rem] w-[50rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(34,211,238,0.35), transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute top-1/3 right-[-20%] h-[40rem] w-[40rem] rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(99,102,241,0.35), transparent 70%)" }}
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
            <Calendar className="w-5 h-5" />
          </div>
        </div>
        <button
          onClick={openBook}
          className={`${BTN_BASE} ${ACCENT_GRADIENT} text-slate-950 hover:brightness-110`}
        >
          <Plus className="w-5 h-5" />
          Book Appointment
        </button>
      </div>
      <h1 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight">My Appointments</h1>
      <p className="text-slate-300/90 text-sm">View and manage your service appointments</p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        <div className={`${CARD} p-5`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300/90 text-sm">Total Appointments</p>
              <p className="text-3xl font-extrabold tracking-tight text-cyan-300">
                {appointments?.length ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 grid place-items-center rounded-xl bg-white/5 ring-1 ring-emerald-300 text-emerald-300">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>
        {/* add more stat cards here if needed */}
      </div>

      {/* Appointments List */}
      <div className={`${CARD} mt-6 overflow-hidden`}>
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-cyan-300 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-slate-300/90">Loading appointments...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-300">Error loading appointments</div>
        ) : !appointments || appointments.length === 0 ? (
          <div className="p-12 text-center">
            <div className={`w-16 h-16 ${ACCENT_GRADIENT} text-slate-950 mx-auto mb-4 rounded-xl grid place-items-center ring-1 ring-white/10`}>
              <Calendar className="w-7 h-7" />
            </div>
            <p className="text-slate-300/90">No appointments yet</p>
            <button
              onClick={openBook}
              className={`${BTN_BASE} mt-4 ${ACCENT_GRADIENT} text-slate-950 hover:brightness-110`}
            >
              Book your first appointment
            </button>
          </div>
        ) : (
          <div className="p-6 overflow-x-auto">
            <ul className="space-y-4">
              {appointments.map((a) => (
                <li key={a.id} className="rounded-xl ring-1 ring-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">
                        {a.services?.map((s) => s.serviceName).join(", ") || "Services"}
                      </p>
                      <p className="text-sm text-slate-300/90">
                        {a.scheduledDateTime
                          ? new Date(a.scheduledDateTime).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                    <span className="shrink-0 px-2 py-1 rounded-full text-xs bg-white/10 ring-1 ring-white/10 text-slate-200">
                      {a.status}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => openEdit(a)}
                      className={`${BTN_BASE} bg-white/5 hover:bg-white/10 text-sm`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleCancel(a.id)}
                      className={`${BTN_BASE} bg-white/5 hover:bg-white/10 text-sm`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className={`${BTN_BASE} bg-white/5 hover:bg-white/10 text-sm`}
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
          className="fixed inset-0 z-50 grid place-items-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <div className={`${CARD} relative w-full max-w-md mx-4 p-6`}>
            <h2 className="text-xl font-semibold">
              {editApp ? "Edit Appointment" : "Book Appointment"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Vehicle */}
              <div>
                <label className="block text-sm font-medium text-slate-200">Vehicle</label>
                <select
                  value={form.vehicleId ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, vehicleId: Number(e.target.value) || undefined }))
                  }
                  required
                  className={`${INPUT} appearance-none`}
                >
                  <option className="bg-slate-900" value="">Select vehicle</option>
                  {myVehicles.map((v: any) => (
                    <option className="bg-slate-900" key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Services (multi-select) */}
              <div>
                <label className="block text-sm font-medium text-slate-200">Services</label>
                <select
                  multiple
                  value={form.serviceIds.map(String)}
                  onChange={(e) => {
                    const vals = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
                    setForm((f) => ({ ...f, serviceIds: vals }));
                  }}
                  required
                  className={`${INPUT} min-h-28`}
                >
                  {services.map((s: any) => (
                    <option className="bg-slate-900" key={s.id} value={s.id}>
                      {s.serviceName} — {(s.basePrice ?? 0).toLocaleString()}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">Hold Ctrl/Cmd to select multiple.</p>
              </div>

              {/* Date & Time */}
              <div>
                <label className="block text-sm font-medium text-slate-200">Date &amp; Time</label>
                <input
                  type="datetime-local"
                  value={form.scheduledDateTime}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, scheduledDateTime: e.target.value }))
                  }
                  required
                  className={INPUT}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-200">Notes</label>
                <input
                  type="text"
                  value={form.customerNotes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customerNotes: e.target.value }))
                  }
                  className={INPUT}
                  placeholder="Anything specific you'd like us to check?"
                />
              </div>

              {formError && (
                <div className="text-sm text-rose-300 bg-rose-500/10 ring-1 ring-rose-500/20 px-3 py-2 rounded-xl">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className={`${BTN_BASE} bg-white/5 hover:bg-white/10`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${BTN_BASE} ${ACCENT_GRADIENT} text-slate-950 disabled:opacity-60`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : editApp ? "Update" : "Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;