// src/pages/Customer/MyVehicles.tsx
import React from "react";
import { Car, Plus } from "lucide-react";
import {
  listMyVehicles,
  addMyVehicle,
  updateMyVehicle,
  deleteMyVehicle,
  Vehicle,
  VehicleRequest,
} from "../../api/vehicles";
import useApi from "../../hooks/useApi";

/** ---- Theme tokens (match Admin/UserManagement) ---- */
const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const BTN_BASE =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-0 ring-1 ring-white/10";
const INPUT =
  "mt-1 w-full rounded-xl bg-white/5 text-white placeholder:text-slate-400 px-3 py-2.5 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/70";

const MyVehicles: React.FC = () => {
  const { data: vehiclesData, loading, error, refetch } = useApi<Vehicle[]>(
    () => listMyVehicles(),
    []
  );
  const vehicles = vehiclesData ?? [];

  const [showModal, setShowModal] = React.useState(false);
  const [editVehicle, setEditVehicle] = React.useState<Vehicle | null>(null);
  const [form, setForm] = React.useState<Partial<Vehicle>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const openAdd = () => {
    setEditVehicle(null);
    setForm({});
    setShowModal(true);
  };
  const openEdit = (vehicle: Vehicle) => {
    setEditVehicle(vehicle);
    setForm(vehicle);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditVehicle(null);
    setForm({});
    setFormError(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this vehicle?")) return;
    setIsSubmitting(true);
    try {
      await deleteMyVehicle(id);
      await refetch();
    } catch (e) {
      setFormError("Failed to delete vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editVehicle) {
        await updateMyVehicle(editVehicle.id, form);
      } else {
        await addMyVehicle(form as VehicleRequest);
      }
      await refetch();
      closeModal();
    } catch (err: any) {
      setFormError(err?.response?.data || "Failed to save vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const safeNumber = (n: any) =>
    typeof n === "number" && Number.isFinite(n) ? n : undefined;

  return (
    <div className="relative text-white">
      {/* Backdrop (dark neon, matches Admin) */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/80 to-slate-950/80" />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[50rem] w-[50rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Vehicles</h1>
            <p className="text-slate-300/90 text-sm">Manage your vehicles</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className={`${BTN_BASE} ${ACCENT_GRADIENT} text-slate-950 hover:brightness-110`}
        >
          <Plus className="w-5 h-5" />
          Add Vehicle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        <div className={`${CARD} p-5`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300/90 text-sm">Total Vehicles</p>
              <p className="text-3xl font-extrabold tracking-tight text-cyan-300">
                {vehicles.length}
              </p>
            </div>
            <div className="w-10 h-10 grid place-items-center rounded-xl bg-white/5 ring-1 ring-emerald-300 text-emerald-300">
              <Car className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className={`${CARD} mt-6 overflow-hidden`}>
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-cyan-300 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-slate-300/90">Loading vehicles...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-300">
            Error loading vehicles
          </div>
        ) : vehicles.length === 0 ? (
          <div className="p-12 text-center">
            <div
              className={`w-16 h-16 ${ACCENT_GRADIENT} text-slate-950 mx-auto mb-4 rounded-xl grid place-items-center ring-1 ring-white/10`}
            >
              <Car className="w-7 h-7" />
            </div>
            <p className="text-slate-300/90">No vehicles yet</p>
            <button
              onClick={openAdd}
              className={`${BTN_BASE} mt-4 ${ACCENT_GRADIENT} text-slate-950 hover:brightness-110`}
            >
              Add your first vehicle
            </button>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((vehicle) => {
              const mileage = safeNumber(vehicle.mileage);
              return (
                <div
                  key={vehicle.id}
                  className="rounded-xl ring-1 ring-white/10 bg-white/5 p-4 hover:bg-white/[0.07] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 ${ACCENT_GRADIENT} rounded-xl grid place-items-center text-slate-950 ring-1 ring-white/10`}
                    >
                      <Car className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">
                            {vehicle.make} {vehicle.model}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Year: {vehicle.year ?? "—"}
                          </p>
                        </div>
                        <p className="text-xs font-medium text-slate-200 whitespace-nowrap">
                          {vehicle.registrationNumber}
                        </p>
                      </div>

                      <div className="mt-2 text-sm text-slate-300/90 space-y-0.5">
                        <p>Color: {vehicle.color ?? "—"}</p>
                        <p>
                          Mileage:{" "}
                          {typeof mileage === "number"
                            ? `${mileage.toLocaleString()} km`
                            : "—"}
                        </p>
                        <p className="truncate">VIN: {vehicle.vinNumber ?? "—"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/10 flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(vehicle)}
                      className={`${BTN_BASE} bg-white/5 hover:bg-white/10 text-sm`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className={`${BTN_BASE} bg-white/5 hover:bg-white/10 text-sm`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Vehicle */}
      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <div className={`${CARD} relative w-full max-w-md mx-4 p-6`}>
            <h2 className="text-xl font-semibold">
              {editVehicle ? "Edit Vehicle" : "Add Vehicle"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-white">
              <div>
                <label className="block text-sm font-medium text-slate-200">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={form.registrationNumber || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, registrationNumber: e.target.value }))
                  }
                  required
                  className={INPUT}
                  placeholder="e.g. 123ABCS"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200">Make</label>
                  <input
                    type="text"
                    value={form.make || ""}
                    onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
                    required
                    className={INPUT}
                    placeholder="e.g. BMW"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200">Model</label>
                  <input
                    type="text"
                    value={form.model || ""}
                    onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                    required
                    className={INPUT}
                    placeholder="e.g. X5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200">Year</label>
                  <input
                    type="number"
                    value={(form.year as number) || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, year: Number(e.target.value) }))
                    }
                    required
                    className={INPUT}
                    min="1900"
                    max="2035"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200">Color</label>
                  <input
                    type="text"
                    value={form.color || ""}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    required
                    className={INPUT}
                    placeholder="e.g. Blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200">
                  VIN Number
                </label>
                <input
                  type="text"
                  value={form.vinNumber || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, vinNumber: e.target.value }))
                  }
                  required
                  className={INPUT}
                  placeholder="e.g. 1HGCM82633A123886"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200">Mileage</label>
                <input
                  type="number"
                  value={(form.mileage as number) || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, mileage: Number(e.target.value) }))
                  }
                  required
                  className={INPUT}
                  min="0"
                  placeholder="e.g. 50000"
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
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${BTN_BASE} ${ACCENT_GRADIENT} text-slate-950 disabled:opacity-60`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : editVehicle ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyVehicles;