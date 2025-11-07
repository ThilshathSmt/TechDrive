import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import CustomerSidebar from "../shared/CustomerSidebar"; // neon/glass version
import Header from "../shared/Header"; // accepts onMenuClick + title
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * CustomerLayout — GearSync dark/neon shell
 * - Desktop: persistent sidebar + header
 * - Mobile: header hamburger opens a slide-in drawer with CustomerSidebar
 * - Matches app backdrop & tokens used elsewhere
 */

const CustomerLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Backdrop */}
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
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Shell */}
      <div className="relative z-10 flex h-screen">
        {/* Sidebar (desktop) */}
        <div className="hidden md:block">
          <CustomerSidebar />
        </div>

        {/* Main column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with mobile hamburger */}
          <Header onMenuClick={() => setMobileOpen(true)} title="Customer" />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="fixed z-50 top-0 left-0 h-full w-[18rem] max-w-[85vw]"
            >
              <div className="absolute top-3 right-3 z-50">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="grid place-items-center w-9 h-9 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <CustomerSidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerLayout;