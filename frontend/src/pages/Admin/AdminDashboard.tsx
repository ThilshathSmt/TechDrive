import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  Car,
  CheckCircle,
  DollarSign,
  BarChart2,
  Shield,
  Loader2,
} from "lucide-react";
import {
  getDashboardUserCount,
  getDashboardAppointmentCount,
  getDashboardVehicleCount,
  getDashboardTotalEarnings,
  getDashboardActiveServiceCount,
  getDashboardConfirmedAppointments,
  getDashboardTodayAppointments,
} from "../../api/admin";
import { motion } from "framer-motion";

// ---- Theme tokens (align with Home) ----
const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const BTN =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2 ring-1 ring-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const name = user?.firstName || user?.email || "Admin";

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    userCount: 0,
    appointmentCount: 0,
    vehicleCount: 0,
    totalEarnings: 0,
    activeServiceCount: 0,
    confirmedAppointmentsCount: 0,
    todayAppointmentsCount: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [
          userCount,
          appointmentCount,
          vehicleCount,
          totalEarnings,
          activeServiceCount,
          confirmedAppointments,
          todayAppointments,
        ] = await Promise.all([
          getDashboardUserCount().catch(err => {
            console.error("Error fetching user count:", err);
            return 0;
          }),
          getDashboardAppointmentCount().catch(err => {
            console.error("Error fetching appointment count:", err);
            return 0;
          }),
          getDashboardVehicleCount().catch(err => {
            console.error("Error fetching vehicle count:", err);
            return 0;
          }),
          getDashboardTotalEarnings().catch(err => {
            console.error("Error fetching total earnings:", err);
            return 0;
          }),
          getDashboardActiveServiceCount().catch(err => {
            console.error("Error fetching active service count:", err);
            return 0;
          }),
          getDashboardConfirmedAppointments().catch(err => {
            console.error("Error fetching confirmed appointments:", err);
            return [];
          }),
          getDashboardTodayAppointments().catch(err => {
            console.error("Error fetching today appointments:", err);
            return [];
          }),
        ]);
        
        console.log("Dashboard data received:", {
          userCount,
          appointmentCount,
          vehicleCount,
          totalEarnings,
          activeServiceCount,
          confirmedAppointments,
          todayAppointments,
        });
        
        setStats({
          userCount: Number(userCount) || 0,
          appointmentCount: Number(appointmentCount) || 0,
          vehicleCount: Number(vehicleCount) || 0,
          totalEarnings: Number(totalEarnings) || 0,
          activeServiceCount: Number(activeServiceCount) || 0,
          confirmedAppointmentsCount: (confirmedAppointments as any[])?.length || 0,
          todayAppointmentsCount: (todayAppointments as any[])?.length || 0,
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  const nf = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);
  const cf = useMemo(() => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }), []);

  const cards = [
    { label: "Total Users", value: nf.format(stats.userCount), icon: Users },
    { label: "Total Appointments", value: nf.format(stats.appointmentCount), icon: Calendar },
    { label: "Total Vehicles", value: nf.format(stats.vehicleCount), icon: Car },
    { label: "Active Services", value: nf.format(stats.activeServiceCount), icon: BarChart2 },
    { label: "Confirmed Today", value: nf.format(stats.confirmedAppointmentsCount), icon: CheckCircle },
    { label: "Total Earnings", value: cf.format(stats.totalEarnings), icon: DollarSign },
  ];

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Backdrop like Home: gradient, radial glows, subtle grid */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(34,211,238,0.35), transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute top-1/3 right-[-20%] h-[40rem] w-[40rem] rounded-full opacity-15 blur-3xl"
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

      {/* Page container */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome, {name}</h1>
              <p className="text-slate-300/90 text-sm">Manage users, appointments, vehicles, and revenue at a glance.</p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center h-72">
            <Loader2 className="w-10 h-10 animate-spin text-cyan-300" />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cards.map(({ label, value, icon: Icon }, i) => (
                <motion.div
                  key={label}
                  className={`${CARD} p-6`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  whileHover={{ y: -3 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-extrabold tracking-tight text-cyan-300">{value}</div>
                      <div className="mt-1 text-slate-300/90 text-sm">{label}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 ring-1 ring-white/10">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </section>

            {/* Secondary Panels */}
            <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`${CARD} p-6`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-semibold">Today's Appointments</h2>
                </div>
                <p className="text-slate-300/90 text-sm">
                  {stats.todayAppointmentsCount} appointment{stats.todayAppointmentsCount !== 1 ? "s" : ""} scheduled for today.
                </p>
                <div className="mt-4 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-300 to-indigo-300"
                    style={{ width: `${Math.min(100, stats.todayAppointmentsCount * 10)}%` }}
                  />
                </div>
              </div>

              <div className={`${CARD} p-6`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-semibold">Quick Stats</h2>
                </div>
                <p className="text-slate-300/90 text-sm">
                  {stats.confirmedAppointmentsCount} confirmed appointment{stats.confirmedAppointmentsCount !== 1 ? "s" : ""} pending completion.
                </p>
                <ul className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <li className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
                    <div className="text-slate-400">Active services</div>
                    <div className="text-white font-semibold">{nf.format(stats.activeServiceCount)}</div>
                  </li>
                  <li className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
                    <div className="text-slate-400">Vehicles</div>
                    <div className="text-white font-semibold">{nf.format(stats.vehicleCount)}</div>
                  </li>
                  <li className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
                    <div className="text-slate-400">Users</div>
                    <div className="text-white font-semibold">{nf.format(stats.userCount)}</div>
                  </li>
                  <li className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
                    <div className="text-slate-400">Revenue</div>
                    <div className="text-white font-semibold">{cf.format(stats.totalEarnings)}</div>
                  </li>
                </ul>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;