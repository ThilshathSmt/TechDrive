// src/pages/Admin/Reports.tsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, DollarSign, Users } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";

/** ---- UI tokens (match your neon/glass home UI) ---- */
const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const BADGE = "px-2 py-1 rounded-full text-xs ring-1 ring-white/10 bg-white/10 text-slate-200";
const MUTED = "text-slate-300/90";

/** ---- Mock data (replace with API data when ready) ---- */
const revenueSeries = [
  { month: "Jan", revenue: 8200, customers: 42 },
  { month: "Feb", revenue: 10400, customers: 48 },
  { month: "Mar", revenue: 9800, customers: 51 },
  { month: "Apr", revenue: 12050, customers: 55 },
  { month: "May", revenue: 14300, customers: 62 },
  { month: "Jun", revenue: 13950, customers: 59 },
  { month: "Jul", revenue: 15800, customers: 66 },
  { month: "Aug", revenue: 17120, customers: 70 },
  { month: "Sep", revenue: 16330, customers: 68 },
  { month: "Oct", revenue: 18400, customers: 74 },
  { month: "Nov", revenue: 17860, customers: 73 },
  { month: "Dec", revenue: 20110, customers: 79 },
];

const servicesCompleted = [
  { name: "Maintenance", count: 120 },
  { name: "Repair", count: 86 },
  { name: "Inspection", count: 54 },
  { name: "Tire", count: 39 },
  { name: "Electrical", count: 27 },
  { name: "Bodywork", count: 18 },
  { name: "Diagnostic", count: 44 },
];

const Reports: React.FC = () => {
  const totals = useMemo(() => {
    const totalRevenue = revenueSeries.reduce((a, b) => a + b.revenue, 0);
    const monthGrowth =
      revenueSeries.length > 1
        ? Math.round(
            ((revenueSeries.at(-1)!.revenue - revenueSeries.at(-2)!.revenue) /
              Math.max(1, revenueSeries.at(-2)!.revenue)) *
              100
          )
        : 0;
    const totalCustomers = revenueSeries.at(-1)?.customers ?? 0;
    const totalCompleted = servicesCompleted.reduce((a, b) => a + b.count, 0);
    return { totalRevenue, monthGrowth, totalCustomers, totalCompleted };
  }, []);

  return (
    <div className="relative min-h-screen text-white">
      {/* Backdrop */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div
          className="pointer-events-none absolute -top-40 right-1/3 h-[45rem] w-[45rem] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(34,211,238,0.35), transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-[-20%] left-[-10%] h-[40rem] w-[40rem] rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(99,102,241,0.35), transparent 70%)" }}
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

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Reports & Analytics</h1>
          <p className={`${MUTED} mt-1`}>View system reports and analytics</p>
        </div>

        {/* Stat cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className={`${CARD} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${MUTED} text-sm`}>Total Revenue</p>
                <p className="text-3xl font-bold">${totals.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/10 ring-1 ring-white/10">
                <DollarSign className="w-7 h-7" />
              </div>
            </div>
            <div className="mt-3">
              <span className={BADGE}>YTD</span>
            </div>
          </div>

          <div className={`${CARD} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${MUTED} text-sm`}>Monthly Growth</p>
                <p className="text-3xl font-bold">{totals.monthGrowth}%</p>
              </div>
              <div className="p-3 rounded-xl bg-white/10 ring-1 ring-white/10">
                <TrendingUp className="w-7 h-7" />
              </div>
            </div>
            <div className="mt-3">
              <span className={BADGE}>vs last month</span>
            </div>
          </div>

          <div className={`${CARD} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${MUTED} text-sm`}>Total Customers</p>
                <p className="text-3xl font-bold">{totals.totalCustomers}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/10 ring-1 ring-white/10">
                <Users className="w-7 h-7" />
              </div>
            </div>
            <div className="mt-3">
              <span className={BADGE}>Active</span>
            </div>
          </div>

          <div className={`${CARD} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${MUTED} text-sm`}>Services Completed</p>
                <p className="text-3xl font-bold">{totals.totalCompleted}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/10 ring-1 ring-white/10">
                <BarChart3 className="w-7 h-7" />
              </div>
            </div>
            <div className="mt-3">
              <span className={BADGE}>Last 12 mo</span>
            </div>
          </div>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue area chart */}
          <motion.div
            className={`${CARD} p-6`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Revenue</h2>
                <p className={`${MUTED} text-sm`}>Last 12 months</p>
              </div>
              <div className={`px-3 py-1 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10 text-sm`}>
                Live
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="month" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip
                    contentStyle={{ background: "rgba(2,6,23,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                    labelStyle={{ color: "#e2e8f0" }}
                    itemStyle={{ color: "#e2e8f0" }}
                    formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    fill="url(#revFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Services completed bar chart */}
          <motion.div
            className={`${CARD} p-6`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Services Completed</h2>
              <p className={`${MUTED} text-sm`}>By category</p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={servicesCompleted} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="name" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip
                    contentStyle={{ background: "rgba(2,6,23,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                    labelStyle={{ color: "#e2e8f0" }}
                    itemStyle={{ color: "#e2e8f0" }}
                  />
                  <Legend wrapperStyle={{ color: "#e2e8f0" }} />
                  <Bar dataKey="count" name="Completed" radius={[8, 8, 0, 0]} fill="#22d3ee" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Reports;