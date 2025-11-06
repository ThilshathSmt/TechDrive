import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Users, FileText, Settings, LogOut, BarChart2, Calendar, CheckCircle, Car, DollarSign, Loader2 } from "lucide-react";
import { 
  getDashboardUserCount, 
  getDashboardAppointmentCount, 
  getDashboardVehicleCount,
  getDashboardTotalEarnings,
  getDashboardActiveServiceCount,
  getDashboardConfirmedAppointments,
  getDashboardTodayAppointments
} from "../../api/admin";

const AdminDashboard: React.FC = () => {
  const { logout, role } = useContext(AuthContext)!;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    userCount: 0,
    appointmentCount: 0,
    vehicleCount: 0,
    totalEarnings: 0,
    activeServiceCount: 0,
    confirmedAppointmentsCount: 0,
    todayAppointmentsCount: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [
          userCount,
          appointmentCount,
          vehicleCount,
          totalEarnings,
          activeServiceCount,
          confirmedAppointments,
          todayAppointments
        ] = await Promise.all([
          getDashboardUserCount(),
          getDashboardAppointmentCount(),
          getDashboardVehicleCount(),
          getDashboardTotalEarnings(),
          getDashboardActiveServiceCount(),
          getDashboardConfirmedAppointments(),
          getDashboardTodayAppointments()
        ]);

        setStats({
          userCount: Number(userCount) || 0,
          appointmentCount: Number(appointmentCount) || 0,
          vehicleCount: Number(vehicleCount) || 0,
          totalEarnings: Number(totalEarnings) || 0,
          activeServiceCount: Number(activeServiceCount) || 0,
          confirmedAppointmentsCount: confirmedAppointments.length || 0,
          todayAppointmentsCount: todayAppointments.length || 0
        });
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

  const dashboardStats = [
    { title: "Total Users", value: stats.userCount, color: "from-blue-500 to-indigo-500", icon: <Users className="w-6 h-6" /> },
    { title: "Total Appointments", value: stats.appointmentCount, color: "from-purple-500 to-pink-500", icon: <Calendar className="w-6 h-6" /> },
    { title: "Total Vehicles", value: stats.vehicleCount, color: "from-cyan-500 to-blue-500", icon: <Car className="w-6 h-6" /> },
    { title: "Active Services", value: stats.activeServiceCount, color: "from-green-500 to-teal-500", icon: <BarChart2 className="w-6 h-6" /> },
    { title: "Confirmed Today", value: stats.confirmedAppointmentsCount, color: "from-yellow-400 to-orange-500", icon: <CheckCircle className="w-6 h-6" /> },
    { title: "Total Earnings", value: `$${stats.totalEarnings.toFixed(2)}`, color: "from-emerald-500 to-green-500", icon: <DollarSign className="w-6 h-6" /> },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full opacity-15 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-purple-500 rounded-full opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>


      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto relative z-10">
        <h1 className="text-4xl font-extrabold text-white mb-2">Welcome, {role}</h1>
        <p className="text-gray-300 mb-6">Manage users, view reports, and configure settings with style.</p>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardStats.map((stat, idx) => (
                <div
                  key={idx}
                  className={`relative overflow-hidden rounded-3xl p-6 shadow-2xl border border-white/10 bg-gradient-to-r ${stat.color} text-white hover:scale-[1.03] transform transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-bold">{stat.value}</span>
                    <div className="bg-white/20 p-3 rounded-full">
                      {stat.icon}
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{stat.title}</p>
                  <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                </div>
              ))}
            </div>

            {/* Dashboard Sections */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl text-white hover:shadow-white/20 transition-all duration-300">
                <h2 className="font-bold text-xl mb-2">Today's Appointments</h2>
                <p className="text-gray-300 text-sm">
                  {stats.todayAppointmentsCount} appointment{stats.todayAppointmentsCount !== 1 ? 's' : ''} scheduled for today
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl text-white hover:shadow-white/20 transition-all duration-300">
                <h2 className="font-bold text-xl mb-2">Quick Stats</h2>
                <p className="text-gray-300 text-sm">
                  {stats.confirmedAppointmentsCount} confirmed appointment{stats.confirmedAppointmentsCount !== 1 ? 's' : ''} pending completion
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
