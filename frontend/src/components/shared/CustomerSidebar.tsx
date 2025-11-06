import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Car,
  FolderKanban,
  MessageSquare,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const CustomerSidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/customer-dashboard",
    },
    {
      title: "My Appointments",
      icon: Calendar,
      path: "/customer-dashboard/appointments",
    },
    {
      title: "My Vehicles",
      icon: Car,
      path: "/customer-dashboard/vehicles",
    },
    {
      title: "My Projects",
      icon: FolderKanban,
      path: "/customer-dashboard/projects",
    },
    {
      title: "Service History",
      icon: Clock,
      path: "/customer-dashboard/history",
    },
    {
      title: "Chat Support",
      icon: MessageSquare,
      path: "/customer-dashboard/chat",
    },
    {
      title: "Profile",
      icon: User,
      path: "/customer-dashboard/profile",
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-gradient-to-b from-green-900 to-green-800 text-white transition-all duration-300 flex flex-col`}
    >
      {/* Logo Section */}
      <div className="p-6 flex items-center justify-between border-b border-green-700">
        {!collapsed && (
          <div>
            <h1 className="text-2xl font-bold">GearSync</h1>
            <p className="text-xs text-green-300">Customer Portal</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-green-700 rounded-lg transition-colors"
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
          const isActive = location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-green-700 text-white shadow-lg"
                  : "hover:bg-green-800 text-green-100"
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
      <div className="p-3 border-t border-green-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-red-600 transition-all text-green-100 hover:text-white"
          title={collapsed ? "Logout" : ""}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default CustomerSidebar;
