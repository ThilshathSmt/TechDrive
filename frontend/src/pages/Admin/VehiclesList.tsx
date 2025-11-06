// src/pages/Admin/VehiclesList.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Car, Search } from "lucide-react";
import { AdminVehicleDTO, listAllVehiclesAdmin } from "../../api/vehicles";

const VehiclesList: React.FC = () => {
  const [vehicles, setVehicles] = useState<AdminVehicleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listAllVehiclesAdmin();
        setVehicles(Array.isArray(data) ? data : []);
        setErr(null);
      } catch (e: any) {
        setErr(e?.response?.data || "Failed to load vehicles");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter((v) => {
      const hay = [
        v.registrationNumber,
        v.make,
        v.model,
        String(v.year ?? ""),
        v.color,
        v.vinNumber,
        v.customerName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [vehicles, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-gray-600 mt-1">All customer vehicles (admin view)</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
            </div>
            <Car className="w-10 h-10 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by reg no, make, model, owner…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">Loading vehicles…</div>
        ) : err ? (
          <div className="p-12 text-center text-red-600">{err}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No vehicles found</p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((v, i) => (
              <div
                key={v.id ?? `${v.registrationNumber}-${i}`}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">
                    {v.make ?? "Make"} {v.model ?? ""} {v.year ? `(${v.year})` : ""}
                  </p>
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-600">
                    {v.registrationNumber ?? "—"}
                  </span>
                </div>

                <div className="mt-2 text-sm text-gray-700 space-y-1">
                  <p><span className="text-gray-500">Color:</span> {v.color ?? "—"}</p>
                  <p><span className="text-gray-500">VIN:</span> {v.vinNumber ?? "—"}</p>
                  <p><span className="text-gray-500">Mileage:</span> {typeof v.mileage === "number" ? `${v.mileage} km` : "—"}</p>
                </div>

                <div className="mt-3 text-sm text-gray-700">
                  <span className="text-gray-500">Owner:</span>{" "}
                  {v.customerName ?? `#${v.customerId ?? "—"}`}
                </div>

                {v.createdAt && (
                  <div className="mt-2 text-xs text-gray-500">
                    Added: {new Date(v.createdAt).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehiclesList;