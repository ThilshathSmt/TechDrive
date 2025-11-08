import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, User as UserIcon, LifeBuoy, LogOut, Shield, Car, Calendar, CheckCircle, DollarSign } from "lucide-react";
import { getAllDashboardStats, getUpcomingAppointments, DashboardStats } from "../../api/dashboard";
import { MyAppointmentDTO } from "../../api/appointments";

// ---- Theme tokens (mirrors Admin/UserManagement) ----
const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const BTN_BASE =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-0 ring-1 ring-white/10";

const CustomerDashboard: React.FC = () => {
  const { logout, role } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<MyAppointmentDTO[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashboardStats, appointments] = await Promise.all([
          getAllDashboardStats(),
          getUpcomingAppointments(),
        ]);
        setStats(dashboardStats);
        setUpcomingAppointments(appointments);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const statCards = stats
    ? [
        { title: "Total Appointments", value: stats.totalAppointments, tone: "cyan", Icon: Calendar },
        { title: "Active Appointments", value: stats.activeAppointments, tone: "yellow", Icon: ShoppingCart },
        { title: "Completed Services", value: stats.completedServices, tone: "green", Icon: CheckCircle },
        { title: "My Vehicles", value: stats.totalVehicles, tone: "blue", Icon: Car },
        { title: "Total Spent", value: `$${stats.totalSpent.toFixed(2)}`, tone: "purple", Icon: DollarSign },
      ]
    : [];

  const toneToRing = (tone: string) =>
    tone === "cyan"
      ? "ring-cyan-300 text-cyan-300"
      : tone === "yellow"
      ? "ring-yellow-300 text-yellow-300"
      : tone === "green"
      ? "ring-green-300 text-green-300"
      : tone === "blue"
      ? "ring-blue-300 text-blue-300"
      : tone === "purple"
      ? "ring-purple-300 text-purple-300"
      : tone === "rose"
      ? "ring-rose-300 text-rose-300"
      : "ring-white/20 text-slate-200";

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="relative text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative text-white">
      {/* Backdrop like Admin/UserManagement */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/80 to-slate-950/80" />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[50rem] w-[50rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(34,211,238,0.35), transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute top-1/3 right-[-20%] h-[40rem] w-[40rem] rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(99,102,241,0.35), transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Customer Dashboard</h1>
            <p className="text-slate-300/90 text-sm">Welcome, {role}. Manage your activity at a glance.</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className={`${BTN_BASE} bg-white/5 hover:bg-white/10`}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Stats (glassy cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mt-6">
        {statCards.map(({ title, value, Icon, tone }) => (
          <div key={title} className={`${CARD} p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300/90 text-sm">{title}</p>
                <p className="text-3xl font-extrabold tracking-tight text-cyan-300">{value}</p>
              </div>
              <div className={`w-10 h-10 grid place-items-center rounded-xl bg-white/5 ring-1 ${toneToRing(tone)}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments Section */}
      <div className="mt-6">
        <section className={`${CARD} p-5`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
          </div>
          <p className="text-sm text-slate-300/90 mb-4">
            Your scheduled appointments starting from tomorrow.
          </p>

          {upcomingAppointments.length === 0 ? (
            <div className="rounded-xl ring-1 ring-white/10 bg-white/5">
              <div className="p-4 text-sm text-slate-300/90 text-center">
                No upcoming appointments scheduled.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-xl ring-1 ring-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => navigate(`/customer-dashboard/appointments`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-cyan-300" />
                        <span className="font-semibold text-white">
                          {formatDateTime(appointment.scheduledDateTime)}
                        </span>
                      </div>
                      
                      {appointment.services && appointment.services.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-slate-400 mb-1">Services:</p>
                          <div className="flex flex-wrap gap-2">
                            {appointment.services.map((service) => (
                              <span
                                key={service.id}
                                className="inline-flex items-center px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 text-xs ring-1 ring-cyan-300/20"
                              >
                                {service.serviceName}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {appointment.customerNotes && (
                        <p className="text-sm text-slate-300/80 mt-2">
                          <span className="text-slate-400">Notes:</span> {appointment.customerNotes}
                        </p>
                      )}
                    </div>

                    <div className="text-right ml-4">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ring-1 ${
                          appointment.status === "PENDING"
                            ? "bg-yellow-500/10 text-yellow-300 ring-yellow-300/20"
                            : appointment.status === "IN_PROGRESS"
                            ? "bg-blue-500/10 text-blue-300 ring-blue-300/20"
                            : appointment.status === "COMPLETED"
                            ? "bg-green-500/10 text-green-300 ring-green-300/20"
                            : "bg-slate-500/10 text-slate-300 ring-slate-300/20"
                        }`}
                      >
                        {appointment.status.replace("_", " ")}
                      </div>
                      
                      {appointment.finalCost != null ? (
                        <p className="text-lg font-bold text-cyan-300 mt-2">
                          ${appointment.finalCost.toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-400 mt-2">Cost TBD</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CustomerDashboard;