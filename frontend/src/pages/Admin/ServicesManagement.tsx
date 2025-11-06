import React, { useEffect, useMemo, useState } from "react";
import { Wrench, Plus, Search, X } from "lucide-react";
import { createService, listAllServices, ServiceItem, AdminServiceDTO } from "../../api/services";

type FormData = AdminServiceDTO;

const ServicesManagement: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormData>({
    serviceName: "",
    description: "",
    basePrice: 0,
    estimatedDurationMinutes: 30,
    category: "OTHER",
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      setErr(null);
      const data = await listAllServices();
      setServices(data);
    } catch (e: any) {
      setErr(e?.response?.data || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return services.filter((s) =>
      (s.serviceName || "").toLowerCase().includes(q) ||
      (s.category || "").toLowerCase().includes(q) ||
      (s.description || "").toLowerCase().includes(q)
    );
  }, [services, search]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await createService(form);
      setOpen(false);
      setForm({
        serviceName: "",
        description: "",
        basePrice: 0,
        estimatedDurationMinutes: 30,
        category: "OTHER",
      });
      await fetchAll();
      alert("Service created!");
    } catch (e: any) {
      alert(e?.response?.data || "Failed to create service (check you’re logged in as ADMIN).");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600 mt-1">View & create services</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" /> New Service
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{services.length}</p>
            </div>
            <Wrench className="w-10 h-10 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search services…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">Loading services…</div>
        ) : err ? (
          <div className="p-12 text-center text-red-600">{err}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No services found</p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((s, i) => (
              <div
                key={s.id ?? `${s.serviceName}-${i}`} // unique key even if id missing
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <p className="font-semibold">{s.serviceName}</p>
                <p className="text-sm text-gray-600">{s.description || "No description"}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-600">
                    {s.category || "Uncategorized"}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {typeof s.basePrice === "number" ? `$${s.basePrice.toFixed(2)}` : "-"}
                  </span>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-sm">
                    {s.estimatedDurationMinutes ?? "-"} min
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 grid place-items-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create Service</h2>
              <button onClick={() => setOpen(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Service Name*</label>
                <input
                  required
                  value={form.serviceName}
                  onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category*</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="REPAIR">Repair</option>
                  <option value="INSPECTION">Inspection</option>
                  <option value="TIRE_SERVICE">Tire Service</option>
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="BODYWORK">Bodywork</option>
                  <option value="DIAGNOSTIC">Diagnostic</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.basePrice}
                    onChange={(e) =>
                      setForm({ ...form, basePrice: e.target.value ? parseFloat(e.target.value) : 0 })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (min)</label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={form.estimatedDurationMinutes}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        estimatedDurationMinutes: e.target.value ? parseInt(e.target.value) : 0,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Create"}
                </button>
              </div>
            </form>

            <p className="text-xs text-gray-500 mt-3">
              Note: Creating requires an admin token (Bearer) in the request.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManagement;