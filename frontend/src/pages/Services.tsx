// src/pages/Services.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Wrench, Search } from "lucide-react";
import { listAllServices, ServiceItem } from "../api/services";

const Services: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await listAllServices();
        setServices(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setErr(e?.response?.data || "Failed to load services");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return services;
    return services.filter((s) =>
      [s.serviceName, s.category, s.description]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(query))
    );
  }, [services, q]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600 mt-1">
            Browse all available service types and pricing
          </p>
        </div>
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
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Content */}
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
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s, i) => (
              <div
                key={s.id ?? `${s.serviceName}-${i}`}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 grid place-items-center rounded-lg bg-blue-50 text-blue-600">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{s.serviceName}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                        {s.category || "Uncategorized"}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">
                        {s.estimatedDurationMinutes ?? "-"} min
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mt-3 line-clamp-3">
                  {s.description || "No description"}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-blue-700 font-semibold">
                    {typeof s.basePrice === "number" ? `$${s.basePrice.toFixed(2)}` : "-"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;