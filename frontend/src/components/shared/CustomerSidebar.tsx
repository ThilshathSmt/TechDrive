import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";

/**
 * CustomerSidebar — GearSync (dark / glass / neon)
 * - Dashboard is active ONLY on exact "/customer-dashboard"
 * - Other routes use prefix matching as before
 */

const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const iconWrap =
  "grid place-items-center w-8 h-8 rounded-xl bg-white/5 ring-1 ring-white/10 text-cyan-300 shrink-0";
const rowBase =
  "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70";

const CustomerSidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/customer-dashboard" },
    { title: "My Appointments", icon: Calendar, path: "/customer-dashboard/appointments" },
    { title: "My Vehicles", icon: Car, path: "/customer-dashboard/vehicles" },
    { title: "My Projects", icon: FolderKanban, path: "/customer-dashboard/projects" },
    { title: "Service History", icon: Clock, path: "/customer-dashboard/history" },
    { title: "Chat Support", icon: MessageSquare, path: "/customer-dashboard/chat" },
    { title: "Profile", icon: User, path: "/customer-dashboard/profile" },
  ];

  // Auto-collapse on mobile
  useEffect(() => {
    const sync = () => {
      if (window.innerWidth < 768) setCollapsed(true);
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 84 : 272 }}
      className="relative z-20 h-screen text-white overflow-hidden border-r border-white/10 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950/90 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]"
      aria-label="Customer sidebar"
    >
      {/* Top: Brand + Collapse */}
      <div className="sticky top-0 bg-transparent">
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                key="brand"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="min-w-0"
              >
                <div className="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 ring-1 ring-white/10">
                  <div className={`w-2 h-2 rounded-full ${ACCENT_GRADIENT}`} />
                  <span className="text-sm text-slate-300">GearSync</span>
                </div>
                <h1 className="mt-1 text-xl font-extrabold tracking-tight">Customer Portal</h1>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="grid place-items-center w-9 h-9 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu */}
      <nav className="px-3 py-4 overflow-y-auto h-[calc(100vh-9.5rem)]">
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isDashboard = item.path === "/customer-dashboard";
            return (
              <li key={item.path}>
                <NavLink to={item.path} end={isDashboard}>
                  {({ isActive: navActive }) => (
                    <div
                      className={`${rowBase} ${
                        navActive ? "bg-white/10 ring-1 ring-white/10" : "hover:bg-white/5"
                      }`}
                      title={collapsed ? item.title : ""}
                    >
                      <div className={`${iconWrap} ${navActive ? "text-white" : ""}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <AnimatePresence initial={false}>
                        {!collapsed && (
                          <motion.span
                            key="label"
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            className="truncate"
                          >
                            {item.title}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {navActive && (
                        <span
                          className={`ml-auto hidden md:inline-flex h-6 items-center justify-center rounded-lg px-2 text-[11px] font-semibold text-slate-900 ${ACCENT_GRADIENT}`}
                        >
                          Active
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom: Logout */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-3">
        <button
          onClick={logout}
          className={`${rowBase} w-full bg-white/5 hover:bg-white/10`}
          title={collapsed ? "Logout" : ""}
        >
          <div className={`${iconWrap} text-rose-300`}>
            <LogOut className="w-5 h-5" />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key="logout"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="truncate"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};

export default CustomerSidebar;