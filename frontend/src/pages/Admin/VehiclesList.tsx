// src/pages/Admin/VehiclesList.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Car, Search } from "lucide-react";
import { AdminVehicleDTO, listAllVehiclesAdmin } from "../../api/vehicles";

/** ---- UI TOKENS (match Home) ---- */
const ACCENT_GRADIENT =
  "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const INPUT =
  "mt-1 w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2.5 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 focus:border-transparent";

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
    <div className="relative text-white min-h-screen">
      {/* Backdrop */}
      <Backdrop />

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${ACCENT_GRADIENT} p-2 rounded-xl text-slate-950 ring-1 ring-white/10`}>
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Vehicles</h1>
              <p className="text-slate-300/90 mt-1">
                All customer vehicles (admin view)
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`${CARD} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300/90 text-sm">Total Vehicles</p>
                <p className="text-2xl font-bold">{vehicles.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/10 ring-1 ring-white/10">
                <Car className="w-6 h-6 text-cyan-300" />
              </div>
            </div>
          </div>
        </section>

        {/* Search */}
        <section className={`${CARD} p-6`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by reg no, make, model, owner…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${INPUT} pl-10`}
            />
          </div>
        </section>

        {/* Content */}
        <section className={`${CARD} overflow-hidden`}>
          {loading ? (
            <div className="p-12 text-center text-slate-300">Loading vehicles…</div>
          ) : err ? (
            <div className="p-12 text-center text-rose-300">{err}</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-white/10 grid place-items-center ring-1 ring-white/10">
                <Car className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-300/90">No vehicles found</p>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((v, i) => (
                <article
                  key={v.id ?? `${v.registrationNumber}-${i}`}
                  className="rounded-xl ring-1 ring-white/10 bg-white/5 p-4 hover:bg-white/[0.08] transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">
                      {v.make ?? "Make"} {v.model ?? ""} {v.year ? `(${v.year})` : ""}
                    </p>
                    <span className="px-2 py-1 rounded bg-white/10 ring-1 ring-white/10 text-sm">
                      {v.registrationNumber ?? "—"}
                    </span>
                  </div>

                  <dl className="mt-3 text-sm text-slate-200/90 space-y-1.5">
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-400">Color</dt>
                      <dd>{v.color ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-400">VIN</dt>
                      <dd className="truncate">{v.vinNumber ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-400">Mileage</dt>
                      <dd>
                        {typeof v.mileage === "number" ? `${v.mileage} km` : "—"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-400">Owner</dt>
                      <dd>{v.customerName ?? `#${v.customerId ?? "—"}`}</dd>
                    </div>
                  </dl>

                  {v.createdAt && (
                    <p className="mt-2 text-xs text-slate-400">
                      Added: {new Date(v.createdAt).toLocaleString()}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default VehiclesList;

/** ----- Backdrop (shared with Home look) ----- */
const Backdrop = () => (
  <div className="absolute inset-0 -z-10">
    <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
    <div
      className="pointer-events-none absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
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
      className="absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage:
          "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
  </div>
);