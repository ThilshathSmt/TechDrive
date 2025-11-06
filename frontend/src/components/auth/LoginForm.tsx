import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import { login } from "../../api/auth";
import { AuthContext } from "../../context/AuthContext";

// Matches the Home accent sweep
const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";

// Toggle full-page background if you embed this in an existing layout
interface Props {
  fullPage?: boolean;
}

type Role = "ADMIN" | "EMPLOYEE" | "CUSTOMER";

const LoginForm: React.FC<Props> = ({ fullPage = true }) => {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthContext must be used inside AuthProvider");

  const { login: saveAuth } = auth;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const validate = () => {
    if (!email.trim()) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email address.";
    if (password.length < 4) return "Password must be at least 6 characters.";
    return null;
  };

  const goByRole = (role: Role) => {
    if (role === "ADMIN") navigate("/admin-dashboard");
    else if (role === "EMPLOYEE") navigate("/employee-dashboard");
    else navigate("/customer-dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const v = validate();
    if (v) {
      setFormError(v);
      return;
    }

    try {
      setLoading(true);
      const res = await login({ email, password }); // expected: { token, role, isFirstLogin }
      saveAuth(res.token, res.role, res.isFirstLogin);
      
      // If first login, redirect to change password page
      if (res.isFirstLogin) {
        navigate("/change-password");
      } else {
        goByRole(res.role as Role);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Invalid credentials. Please try again.";
      setFormError(msg);
    } finally {
      setLoading(false);
    }
  };

  const Card = (
    <div className="relative">
      {/* soft glow accents */}
      <div className="pointer-events-none absolute -top-14 -left-10 h-32 w-32 rounded-full bg-cyan-400/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -right-8 h-32 w-32 rounded-full bg-indigo-400/20 blur-2xl" />

      <div className="relative mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className={`p-2 rounded-xl ${ACCENT_GRADIENT} shadow-lg shadow-cyan-500/10`}>
            <ShieldCheck className="w-5 h-5 text-slate-950" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">Welcome back</h1>
            <p className="text-sm text-slate-400">Log in to access your dashboard</p>
          </div>
        </div>

        {formError && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
          >
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="text-sm text-slate-300">
            Email
            <div className="mt-1 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-10 py-3 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                placeholder="you@example.com"
                required
              />
            </div>
          </label>

          <label className="text-sm text-slate-300">
            Password
            <div className="mt-1 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-10 py-3 pr-12 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                placeholder="Your password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${ACCENT_GRADIENT} text-slate-950 font-semibold py-3 rounded-lg shadow-lg shadow-cyan-500/20 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300`}
          >
            {loading ? "Signing in..." : "Log In"}
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-2 text-sm text-slate-400">
          <div>
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-300 hover:text-cyan-200 underline-offset-4 hover:underline">
              Register
            </Link>
          </div>
          <div>
            Forgot your password?{' '}
            <Link to="/forgot-password" className="text-cyan-300 hover:text-cyan-200 underline-offset-4 hover:underline">
              Reset Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  if (!fullPage) return Card;

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* Background: dark gradient + radial highlights + subtle grid like Home */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(34,211,238,0.35), transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute top-1/3 right-[-20%] h-[40rem] w-[40rem] rounded-full opacity-15 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(99,102,241,0.35), transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Centered card */}
      <div className="mx-auto max-w-7xl px-6 py-16 grid place-items-center">
        {Card}
      </div>
    </div>
  );
};

export default LoginForm;