import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Car,
  Wrench,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin-dashboard",
    },
    {
      title: "User Management",
      icon: Users,
      path: "/admin-dashboard/users",
    },
    {
      title: "Appointments",
      icon: Calendar,
      path: "/admin-dashboard/appointments",
    },
    {
      title: "Vehicles",
      icon: Car,
      path: "/admin-dashboard/vehicles",
    },
    {
      title: "Services",
      icon: Wrench,
      path: "/admin-dashboard/services",
    },
    {
      title: "Projects",
      icon: Wrench,
      path: "/admin-dashboard/projects",
    },
    {
      title: "Customers",
      icon: Users,
      path: "/admin-dashboard/customers",
    },
    {
      title: "Reports",
      icon: BarChart3,
      path: "/admin-dashboard/reports",
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/admin-dashboard/settings",
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 flex flex-col`}
    >
      {/* Logo Section */}
      <div className="p-6 flex items-center justify-between border-b border-blue-700">
        {!collapsed && (
          <div>
            <h1 className="text-2xl font-bold">GearSync</h1>
            <p className="text-xs text-blue-300">Admin Panel</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-blue-700 text-white shadow-lg"
                  : "hover:bg-blue-800 text-blue-100"
              }`}
              title={collapsed ? item.title : ""}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium">{item.title}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-blue-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-red-600 transition-all text-blue-100 hover:text-white"
          title={collapsed ? "Logout" : ""}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
