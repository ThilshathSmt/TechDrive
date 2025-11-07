// src/pages/Customer/ServiceHistory.tsx
import React from "react";
import { Clock, Calendar, Wrench, Car, Receipt } from "lucide-react";

/** ---- Theme tokens (match Admin/UserManagement glass) ---- */
const ACCENT_GRADIENT =
  "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const INPUT =
  "w-full rounded-xl bg-white/5 text-white placeholder:text-slate-400 px-3 py-2.5 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/70";
const MUTED = "text-slate-300/90";

const ServiceHistory: React.FC = () => {
  // If you later fetch history, replace this with real data
  const history: any[] = [];

  return (
    <div className="relative text-white">
      <Backdrop />

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Service History
              </h1>
              <p className={`${MUTED} text-sm`}>
                View your past service records
              </p>
            </div>
          </div>
        </div>

        {/* Filters (optional placeholder) */}
        <section className={`${CARD} p-5`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                className={INPUT}
                placeholder="Search by service, vehicle, notes…"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                ⌘K
              </div>
            </div>
            <select className={`${INPUT} appearance-none`}>
              <option className="bg-slate-900">All Vehicles</option>
              <option className="bg-slate-900">Vehicle A</option>
              <option className="bg-slate-900">Vehicle B</option>
            </select>
            <select className={`${INPUT} appearance-none`}>
              <option className="bg-slate-900">Any Date</option>
              <option className="bg-slate-900">Last 30 days</option>
              <option className="bg-slate-900">This year</option>
              <option className="bg-slate-900">Last year</option>
            </select>
          </div>
        </section>

        {/* List / Empty State */}
        <section className={`${CARD} overflow-hidden`}>
          {history.length === 0 ? (
            <div className="p-14 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl ring-1 ring-white/10 bg-white/5 grid place-items-center mb-4">
                <Clock className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-lg font-semibold">No service history yet</p>
              <p className={`${MUTED} mt-1`}>
                Completed services will show up here. Once you finish a job,
                you’ll see invoice, parts and notes.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr className="text-left">
                    {["Date", "Vehicle", "Services", "Total", "Notes"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-6 py-3 font-semibold text-slate-300/90"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {history.map((row: any) => (
                    <tr key={row.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-white/5 ring-1 ring-white/10 grid place-items-center">
                            <Calendar className="w-4 h-4 text-slate-300" />
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {new Date(row.date).toLocaleDateString()}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {new Date(row.date).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-white/5 ring-1 ring-white/10 grid place-items-center">
                            <Car className="w-4 h-4 text-slate-300" />
                          </div>
                          <div className="text-white">
                            {row.vehicle?.make} {row.vehicle?.model}{" "}
                            {row.vehicle?.year ? `(${row.vehicle.year})` : ""}
                            {row.vehicle?.registrationNumber
                              ? ` • ${row.vehicle.registrationNumber}`
                              : ""}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {row.services?.map((s: any) => (
                            <span
                              key={s.id}
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/5 ring-1 ring-white/10"
                            >
                              <Wrench className="w-3 h-3" />
                              {s.serviceName}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Receipt className="w-4 h-4 text-slate-300" />
                          {typeof row.total === "number"
                            ? row.total.toLocaleString()
                            : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`${MUTED} line-clamp-2`}>
                          {row.notes || "—"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between text-sm">
                <p className={MUTED}>
                  Showing <span className="text-white">{history.length}</span>{" "}
                  records
                </p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10">
                    Previous
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}
                  >
                    1
                  </button>
                  <button className="px-3 py-1.5 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10">
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ServiceHistory;

/** ----- Backdrop (shared with Admin look) ----- */
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