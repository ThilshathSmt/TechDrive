import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, User as UserIcon, LifeBuoy, LogOut, Shield } from "lucide-react";

// ---- Theme tokens (mirrors Admin/UserManagement) ----
const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const BTN_BASE =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-0 ring-1 ring-white/10";

const CustomerDashboard: React.FC = () => {
  const { logout, role } = useContext(AuthContext)!;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const stats = [
    { title: "Total Orders", value: 25, tone: "cyan", Icon: ShoppingCart },
    { title: "Pending Orders", value: 3, tone: "yellow", Icon: ShoppingCart },
    { title: "Support Tickets", value: 1, tone: "rose", Icon: LifeBuoy },
  ];

  const toneToRing = (tone: string) =>
    tone === "cyan"
      ? "ring-cyan-300 text-cyan-300"
      : tone === "yellow"
      ? "ring-yellow-300 text-yellow-300"
      : tone === "rose"
      ? "ring-rose-300 text-rose-300"
      : "ring-white/20 text-slate-200";

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        {stats.map(({ title, value, Icon, tone }) => (
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

      {/* Sections (Recent Orders / Support Tickets) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        {/* Recent Orders */}
        <section className={`${CARD} p-5`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
              <ShoppingCart className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-semibold">Recent Orders</h2>
          </div>
          <p className="text-sm text-slate-300/90">
            Track your latest orders and their current status.
          </p>

          {/* Placeholder list area (mirrors admin tables/cards style) */}
          <div className="mt-4 rounded-xl ring-1 ring-white/10 bg-white/5">
            <div className="p-4 text-sm text-slate-300/90">
              No recent orders to display.
            </div>
          </div>
        </section>

        {/* Support Tickets */}
        <section className={`${CARD} p-5`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
              <LifeBuoy className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-semibold">Support Tickets</h2>
          </div>
          <p className="text-sm text-slate-300/90">
            Check your support tickets and contact assistance if needed.
          </p>

          {/* Placeholder list area */}
          <div className="mt-4 rounded-xl ring-1 ring-white/10 bg-white/5">
            <div className="p-4 text-sm text-slate-300/90">
              No open tickets right now.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomerDashboard;