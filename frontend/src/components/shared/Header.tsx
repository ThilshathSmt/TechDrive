import React from "react";
import { Bell, Search, User, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";

/**
 * Header — GearSync (dark / glass / neon)
 * - Matches the upgraded aesthetic used across the app
 * - Accessible search, focus rings, and notification badge
 * - Optional mobile menu button (prop) to toggle sidebars
 */

const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";

type HeaderProps = {
  onMenuClick?: () => void; // optional: hook up to sidebar toggler on mobile
  title?: string; // optional: page title shown on small screens
};

const Header: React.FC<HeaderProps> = ({ onMenuClick, title }) => {
  const { token } = useAuth();

  return (
    <header
      className="sticky top-0 z-30 h-16 backdrop-blur-xl border-b border-white/10 bg-gradient-to-b from-slate-950/70 via-slate-900/60 to-slate-950/70 text-white"
      role="banner"
    >
      <div className="mx-auto max-w-7xl h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile menu + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Toggle menu"
            className="md:hidden grid place-items-center w-10 h-10 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className={`md:hidden truncate text-sm font-medium text-slate-300 ${title ? "block" : "hidden"}`}>
            {title}
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <label htmlFor="global-search" className="sr-only">Search</label>
            <input
              id="global-search"
              type="text"
              placeholder="Search…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            className="relative grid place-items-center w-10 h-10 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span
              aria-hidden
              className="absolute top-1.5 right-1.5 inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-rose-400"
            />
          </motion.button>

          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${ACCENT_GRADIENT} text-slate-950 grid place-items-center ring-1 ring-white/10`}>
              <User className="w-5 h-5" />
            </div>
            <div className="hidden md:block leading-tight">
              <p className="text-sm font-semibold text-white truncate">User</p>
              <p className="text-[11px] text-slate-300/90">{token ? "Logged In" : "Guest"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Small-screen search row */}
      <div className="md:hidden border-t border-white/10 px-4 pb-3">
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <label htmlFor="global-search-sm" className="sr-only">Search</label>
          <input
            id="global-search-sm"
            type="text"
            placeholder="Search…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 focus:border-transparent"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;