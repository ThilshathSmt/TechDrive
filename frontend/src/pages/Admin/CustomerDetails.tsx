import React, { useEffect, useMemo, useState } from "react";
import { Search, Users, Car, Mail, Phone, ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  listCustomersWithVehicles,
  AdminCustomerWithVehiclesDTO,
} from "../../api/admin";

const AdminCustomers: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<AdminCustomerWithVehiclesDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Record<number, boolean>>({}); // expand map by id

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await listCustomersWithVehicles();
        setRows(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setErr(e?.response?.data || "Failed to load customers");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rows;
    return rows.filter((c) => {
      const fullName = (c.name || `${c.firstName || ""} ${c.lastName || ""}`).toLowerCase();
      return (
        fullName.includes(qq) ||
        (c.email || "").toLowerCase().includes(qq) ||
        (c.phoneNumber || "").toLowerCase().includes(qq)
      );
    });
  }, [rows, q]);

  const totalVehicles = useMemo(
    () => rows.reduce((acc, r) => acc + (r.vehicles?.length || 0), 0),
    [rows]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">View customers and their vehicles</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{rows.length}</p>
            </div>
            <Users className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{totalVehicles}</p>
            </div>
            <Car className="w-10 h-10 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">With Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">
                {rows.filter((r) => (r.vehicles?.length || 0) > 0).length}
              </p>
            </div>
            <Car className="w-10 h-10 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, or phone…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">Loading customers…</div>
        ) : err ? (
          <div className="p-12 text-center text-red-600">{err}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-600">No customers found</div>
        ) : (
          <ul className="divide-y">
            {filtered.map((c, idx) => {
              const id = c.id ?? -idx;
              const name = c.name || `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Unnamed";
              const vehicleCount = c.vehicles?.length || 0;
              const isOpen = open[id] || false;

              return (
                <li key={id}>
                  <div className="p-4 flex flex-col gap-3">
                    {/* Row head */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setOpen((m) => ({ ...m, [id]: !isOpen }))}
                            className="p-1 rounded hover:bg-gray-100"
                            aria-label={isOpen ? "Collapse" : "Expand"}
                          >
                            {isOpen ? (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-500" />
                            )}
                          </button>
                          <p className="font-semibold truncate">{name}</p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {c.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-700">
                          {c.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {c.email}
                            </span>
                          )}
                          {c.phoneNumber && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {c.phoneNumber}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <Car className="w-4 h-4" />
                            {vehicleCount} vehicle{vehicleCount === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <button
                          onClick={() => navigate(`/admin-dashboard/customers/${id}`)}
                          className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
                        >
                          View details
                        </button>
                      </div>
                    </div>

                    {/* Expand vehicles */}
                    {isOpen && (
                      <div className="rounded-lg border bg-gray-50 overflow-hidden">
                        {vehicleCount === 0 ? (
                          <div className="p-4 text-sm text-gray-600">No vehicles</div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                              <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                  <th className="px-4 py-2 text-left">Registration</th>
                                  <th className="px-4 py-2 text-left">Make / Model</th>
                                  <th className="px-4 py-2 text-left">Year</th>
                                  <th className="px-4 py-2 text-left">Color</th>
                                  <th className="px-4 py-2 text-left">VIN</th>
                                  <th className="px-4 py-2 text-left">Mileage</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {c.vehicles?.map((v, i) => (
                                  <tr key={v.id ?? `${id}-v-${i}`} className="bg-white">
                                    <td className="px-4 py-2">{v.registrationNumber || "-"}</td>
                                    <td className="px-4 py-2">
                                      {(v.make || "-") + " " + (v.model || "")}
                                    </td>
                                    <td className="px-4 py-2">{v.year ?? "-"}</td>
                                    <td className="px-4 py-2">{v.color || "-"}</td>
                                    <td className="px-4 py-2">{v.vinNumber || "-"}</td>
                                    <td className="px-4 py-2">{typeof v.mileage === "number" ? v.mileage : "-"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;