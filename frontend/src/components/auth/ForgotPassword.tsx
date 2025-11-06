import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { forgotPassword } from "../../api/auth";

const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    if (!email.trim()) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email address.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const response = await forgotPassword({ email });
      if (response.success) {
        setSuccess(true);
        // Navigate to verify OTP page after 2 seconds
        setTimeout(() => {
          navigate("/verify-otp", { state: { email } });
        }, 2000);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to send OTP. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* Background: dark gradient + radial highlights + subtle grid */}
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
        <div className="relative w-full max-w-md">
          {/* subtle glow accents */}
          <div className="pointer-events-none absolute -top-14 -left-10 h-32 w-32 rounded-full bg-cyan-400/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -right-8 h-32 w-32 rounded-full bg-indigo-400/20 blur-2xl" />

          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] p-6">
            <button
              onClick={() => navigate("/login")}
              className="mb-4 flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>

            <div className="mb-6">
              <h1 className="text-xl font-semibold">Forgot Password</h1>
              <p className="text-sm text-slate-400 mt-1">
                Enter your email address and we'll send you an OTP to reset your password.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-4 flex items-start gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-300"
              >
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>OTP has been sent to your email. Valid for 10 minutes. Redirecting...</span>
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
                    disabled={loading || success}
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading || success}
                className={`w-full ${ACCENT_GRADIENT} text-slate-950 font-semibold py-3 rounded-lg shadow-lg shadow-cyan-500/20 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300`}
              >
                {loading ? "Sending OTP..." : success ? "OTP Sent!" : "Send OTP"}
              </button>
            </form>

            <div className="mt-4 text-sm text-slate-400 text-center">
              Remember your password?{' '}
              <Link to="/login" className="text-cyan-300 hover:text-cyan-200 underline-offset-4 hover:underline">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

