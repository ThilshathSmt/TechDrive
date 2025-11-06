import React, { useState } from "react";
import { Car, Menu, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Navbar color palettes themed to match/compliment the Home page
// Swap using <Navbar theme="cyanIndigo" /> etc.

type ThemeKey =
  | "cyanIndigo" // matches Home accent (cyan→sky→indigo)
  | "emeraldTeal"
  | "amberViolet"
  | "rosePink"
  | "blueCyan"
  | "violetIndigo"
  | "monoCyan"; // neutral slate nav with cyan accent

const THEMES: Record<
  ThemeKey,
  {
    navBg: string; // navbar background + blur + border
    brandBadge: string; // gradient behind logo
    cta: string; // button base classes
    ring: string; // focus ring color
    link: string; // link color classes
  }
> = {
  cyanIndigo: {
    navBg:
      "bg-slate-900/50 backdrop-blur border-b border-white/10 text-white",
    brandBadge:
      "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400",
    cta: "bg-white text-slate-900 hover:bg-gray-100",
    ring: "focus-visible:ring-cyan-300",
    link: "text-white/80 hover:text-white",
  },
  emeraldTeal: {
    navBg:
      "bg-slate-900/50 backdrop-blur border-b border-white/10 text-white",
    brandBadge:
      "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400",
    cta: "bg-white text-slate-900 hover:bg-gray-100",
    ring: "focus-visible:ring-emerald-300",
    link: "text-white/80 hover:text-white",
  },
  amberViolet: {
    navBg:
      "bg-slate-900/50 backdrop-blur border-b border-white/10 text-white",
    brandBadge:
      "bg-gradient-to-r from-amber-400 via-orange-400 to-violet-400",
    cta: "bg-white text-slate-900 hover:bg-gray-100",
    ring: "focus-visible:ring-amber-300",
    link: "text-white/80 hover:text-white",
  },
  rosePink: {
    navBg:
      "bg-slate-900/50 backdrop-blur border-b border-white/10 text-white",
    brandBadge:
      "bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400",
    cta: "bg-white text-slate-900 hover:bg-gray-100",
    ring: "focus-visible:ring-rose-300",
    link: "text-white/80 hover:text-white",
  },
  blueCyan: {
    navBg:
      "bg-slate-900/50 backdrop-blur border-b border-white/10 text-white",
    brandBadge:
      "bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400",
    cta: "bg-white text-slate-900 hover:bg-gray-100",
    ring: "focus-visible:ring-sky-300",
    link: "text-white/80 hover:text-white",
  },
  violetIndigo: {
    navBg:
      "bg-slate-900/50 backdrop-blur border-b border-white/10 text-white",
    brandBadge:
      "bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400",
    cta: "bg-white text-slate-900 hover:bg-gray-100",
    ring: "focus-visible:ring-violet-300",
    link: "text-white/80 hover:text-white",
  },
  monoCyan: {
    navBg:
      "bg-slate-950/80 backdrop-blur border-b border-white/10 text-white",
    brandBadge: "bg-cyan-400",
    cta: "bg-cyan-500 text-slate-950 hover:bg-cyan-400",
    ring: "focus-visible:ring-cyan-300",
    link: "text-white/80 hover:text-white",
  },
};

interface NavbarProps {
  /** Choose a palette. Defaults to "cyanIndigo" to match Home */
  theme?: ThemeKey;
}

const Navbar: React.FC<NavbarProps> = ({ theme = "cyanIndigo" }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const t = THEMES[theme];
  const isActive = (to: string) =>
    pathname.startsWith(to) ? "text-white" : t.link;

  return (
    <nav className={`sticky top-0 z-50 ${t.navBg}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3" aria-label="Go home">
            <span className={`${t.brandBadge} p-2 rounded-xl shadow-lg shadow-black/10`}>
              <Car className="w-7 h-7 text-slate-950" />
            </span>
            <span className="text-xl sm:text-2xl font-bold tracking-wide">
              AutoService <span className="opacity-90">Pro</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link to="/service" className={isActive("/service")}>
              Services
            </Link>
            <Link to="/about" className={isActive("/about")}>
              About
            </Link>
            <Link to="/contact" className={isActive("/contact")}>
              Contact
            </Link>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className={`ml-2 inline-flex items-center rounded-lg px-4 py-2 font-semibold shadow focus-visible:outline-none ${t.cta} ${t.ring}`}
            >
              Log In
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className={`md:hidden inline-flex items-center justify-center rounded-lg p-2 text-white/90 hover:bg-white/10 focus-visible:outline-none ${t.ring}`}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur border-top border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 space-y-1">
            <Link to="/services" className={isActive("/services")}>Services</Link>
            <Link
              to="/about"
              className="block rounded-lg px-3 py-2 hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block rounded-lg px-3 py-2 hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              Contact
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate("/login");
              }}
              className={`mt-2 w-full rounded-lg px-4 py-2 font-semibold shadow ${t.cta}`}
            >
              Log In
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;