import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  FolderKanban,
  Clock,
  CheckSquare,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wrench,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const EmployeeSidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/employee-dashboard",
    },
    {
      title: "My Assignments",
      icon: Calendar,
      path: "/employee-dashboard/assignments",
    },
    {
      title: "Active Projects",
      icon: FolderKanban,
      path: "/employee-dashboard/projects",
    },
    {
      title: "Time Logs",
      icon: Clock,
      path: "/employee-dashboard/timelogs",
    },
    // {
    //   title: "Tasks",
    //   icon: CheckSquare,
    //   path: "/employee-dashboard/tasks",
    // },
    // {
    //   title: "Services",
    //   icon: Wrench,
    //   path: "/employee-dashboard/services",
    // },
    {
      title: "Profile",
      icon: User,
      path: "/employee-dashboard/profile",
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-gradient-to-b from-purple-900 to-purple-800 text-white transition-all duration-300 flex flex-col`}
    >
      {/* Logo Section */}
      <div className="p-6 flex items-center justify-between border-b border-purple-700">
        {!collapsed && (
          <div>
            <h1 className="text-2xl font-bold">GearSync</h1>
            <p className="text-xs text-purple-300">Employee Portal</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-purple-700 rounded-lg transition-colors"
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
                  ? "bg-purple-700 text-white shadow-lg"
                  : "hover:bg-purple-800 text-purple-100"
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
      <div className="p-3 border-t border-purple-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-red-600 transition-all text-purple-100 hover:text-white"
          title={collapsed ? "Logout" : ""}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default EmployeeSidebar;
