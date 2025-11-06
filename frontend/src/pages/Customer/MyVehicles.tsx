import React from "react";
import { Car, Plus } from "lucide-react";
import {
  listMyVehicles,
  addMyVehicle,
  updateMyVehicle,
  deleteMyVehicle,
  Vehicle,
  VehicleRequest
} from "../../api/vehicles";
import useApi from "../../hooks/useApi";

const MyVehicles: React.FC = () => {
  const { data: vehicles, loading, error, refetch } = useApi<Vehicle[]>(() => listMyVehicles(), []);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Vehicles</h1>
          <p className="text-gray-600 mt-1">Manage your vehicles</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          <Plus className="w-5 h-5" />
          Add Vehicle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{vehicles?.length || 0}</p>
            </div>
            <Car className="w-10 h-10 text-green-500" />
          </div>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading vehicles...</p>
          </div>
        ) : !vehicles || vehicles.length === 0 ? (
          <div className="p-12 text-center">
            <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No vehicles yet</p>
            <button onClick={openAdd} className="mt-4 text-green-600 hover:text-green-700 font-medium">
              Add your first vehicle
            </button>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles?.map((vehicle) => {
              return (
                <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <Car className="w-8 h-8 text-green-600" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-900">{vehicle.make} {vehicle.model}</p>
                          <p className="text-sm text-gray-600">Year: {vehicle.year}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-700">{vehicle.registrationNumber}</p>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Color: {vehicle.color}</p>
                        <p>Mileage: {vehicle.mileage.toLocaleString()} km</p>
                        <p className="truncate">VIN: {vehicle.vinNumber}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end gap-2">
                    <button onClick={() => openEdit(vehicle)} className="text-blue-600 hover:underline text-sm">Edit</button>
                    <button onClick={() => handleDelete(vehicle.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Vehicle */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editVehicle ? "Edit Vehicle" : "Add Vehicle"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                <input type="text" value={form.registrationNumber || ""} onChange={e => setForm(f => ({...f, registrationNumber: e.target.value}))} required className="mt-1 block w-full border rounded-md px-2 py-1" placeholder="e.g. 123ABCS" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Make</label>
                <input type="text" value={form.make || ""} onChange={e => setForm(f => ({...f, make: e.target.value}))} required className="mt-1 block w-full border rounded-md px-2 py-1" placeholder="e.g. BMW" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Model</label>
                <input type="text" value={form.model || ""} onChange={e => setForm(f => ({...f, model: e.target.value}))} required className="mt-1 block w-full border rounded-md px-2 py-1" placeholder="e.g. X5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Year</label>
                <input type="number" value={form.year || ""} onChange={e => setForm(f => ({...f, year: Number(e.target.value)}))} required className="mt-1 block w-full border rounded-md px-2 py-1" min="1900" max="2025" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Color</label>
                <input type="text" value={form.color || ""} onChange={e => setForm(f => ({...f, color: e.target.value}))} required className="mt-1 block w-full border rounded-md px-2 py-1" placeholder="e.g. Blue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">VIN Number</label>
                <input type="text" value={form.vinNumber || ""} onChange={e => setForm(f => ({...f, vinNumber: e.target.value}))} required className="mt-1 block w-full border rounded-md px-2 py-1" placeholder="e.g. 1HGCM82633A123886" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mileage</label>
                <input type="number" value={form.mileage || ""} onChange={e => setForm(f => ({...f, mileage: Number(e.target.value)}))} required className="mt-1 block w-full border rounded-md px-2 py-1" min="0" placeholder="e.g. 50000" />
              </div>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md" disabled={isSubmitting}>{isSubmitting ? "Saving..." : (editVehicle ? "Update" : "Add")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyVehicles;
