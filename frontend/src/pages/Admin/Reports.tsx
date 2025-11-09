// src/pages/Admin/Reports.tsx
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, DollarSign, Users, Loader2 } from "lucide-react";
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
import { getAllDashboardStats, DashboardStats } from "../../api/admin";
import { listAllAppointments, AdminAppointmentDTO } from "../../api/appointments";

/** ---- UI tokens (match your neon/glass home UI) ---- */
const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const BADGE = "px-2 py-1 rounded-full text-xs ring-1 ring-white/10 bg-white/10 text-slate-200";
const MUTED = "text-slate-300/90";

interface RevenueDataPoint {
  month: string;
  revenue: number;
  appointmentCount: number;
}

interface ServiceCategoryData {
  name: string;
  count: number;
}

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [appointments, setAppointments] = useState<AdminAppointmentDTO[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [stats, allAppointments] = await Promise.all([
          getAllDashboardStats(),
          listAllAppointments()
        ]);
        setDashboardStats(stats);
        setAppointments(allAppointments);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching reports data:", err);
        setError(err?.message || "Failed to load reports data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process revenue data by month from appointments
  const revenueSeries = useMemo((): RevenueDataPoint[] => {
    const monthlyData: Record<string, { revenue: number; count: number }> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Get last 12 months
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = { revenue: 0, count: 0 };
    }

    // Aggregate completed appointments by month
    let completedWithCost = 0;
    let completedTotal = 0;
    appointments.forEach((apt, index) => {
      if (apt.status === "COMPLETED") {
        completedTotal++;
        // Debug first completed appointment
        if (completedTotal === 1) {
          console.log("First completed appointment:", {
            id: apt.id,
            status: apt.status,
            finalCost: apt.finalCost,
            finalCostType: typeof apt.finalCost,
            scheduledDateTime: apt.scheduledDateTime,
            scheduledDateTimeType: typeof apt.scheduledDateTime
          });
        }
        
        if (apt.finalCost && apt.scheduledDateTime) {
          const cost = Number(apt.finalCost);
          if (!isNaN(cost) && cost > 0) {
            completedWithCost++;
            const date = new Date(apt.scheduledDateTime);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyData[key]) {
              monthlyData[key].revenue += cost;
              monthlyData[key].count += 1;
            }
          }
        }
      }
    });

    console.log("Total appointments:", appointments.length);
    console.log("Total completed appointments:", completedTotal);
    console.log("Completed appointments with valid cost:", completedWithCost);
    console.log("Monthly revenue data:", monthlyData);

    return Object.keys(monthlyData)
      .sort()
      .map((key) => {
        const [year, month] = key.split('-');
        const monthIndex = parseInt(month) - 1;
        return {
          month: monthNames[monthIndex],
          revenue: Math.round(monthlyData[key].revenue),
          appointmentCount: monthlyData[key].count
        };
      });
  }, [appointments]);

  // Process services completed by category
  const servicesCompleted = useMemo((): ServiceCategoryData[] => {
    if (!appointments.length) return [];

    const categoryCount: Record<string, number> = {};
    let completedCount = 0;

    appointments.forEach((apt) => {
      if (apt.status === "COMPLETED") {
        completedCount++;
        if (apt.services && apt.services.length > 0) {
          apt.services.forEach((service) => {
            // Use category if available, otherwise use serviceName, fallback to "Other"
            const categoryName = service.category && service.category.trim() !== "" 
              ? service.category 
              : service.serviceName && service.serviceName.trim() !== ""
              ? service.serviceName
              : "Other";
            
            categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
          });
        }
      }
    });

    console.log("Completed appointments:", completedCount);
    console.log("Service categories found:", categoryCount);

    const result = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 categories

    // If no services found but we have completed appointments, show a placeholder
    if (result.length === 0 && completedCount > 0) {
      return [{ name: "Services", count: completedCount }];
    }

    return result;
  }, [appointments]);

  const totals = useMemo(() => {
    const totalRevenue = dashboardStats?.totalEarnings || 0;
    const totalCustomers = dashboardStats?.userCount || 0;
    const totalCompleted = appointments.filter(a => a.status === "COMPLETED").length;
    
    // Calculate month-over-month growth
    const lastMonthRevenue = revenueSeries.length > 0 ? revenueSeries[revenueSeries.length - 1]?.revenue || 0 : 0;
    const prevMonthRevenue = revenueSeries.length > 1 ? revenueSeries[revenueSeries.length - 2]?.revenue || 1 : 1;
    const monthGrowth = prevMonthRevenue > 0 
      ? Math.round(((lastMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
      : 0;

    return { totalRevenue, monthGrowth, totalCustomers, totalCompleted };
  }, [dashboardStats, appointments, revenueSeries]);

  if (loading) {
    return (
      <div className="relative min-h-screen text-white flex items-center justify-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        </div>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
          <p className={MUTED}>Loading reports data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen text-white flex items-center justify-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        </div>
        <div className={`${CARD} p-8 max-w-md`}>
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Reports</h2>
          <p className={MUTED}>{error}</p>
        </div>
      </div>
    );
  }

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
                    formatter={(v: number, name: string) => {
                      if (name === "revenue") return [`$${v.toLocaleString()}`, "Revenue"];
                      if (name === "appointmentCount") return [v, "Appointments"];
                      return [v, name];
                    }}
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
            {servicesCompleted.length > 0 ? (
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
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <p className={`${MUTED} text-sm`}>No completed services data available</p>
                  <p className={`${MUTED} text-xs mt-2`}>Complete some appointments to see service statistics</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Reports;