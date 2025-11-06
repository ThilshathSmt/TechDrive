import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { verifyOtp } from "../../api/auth";

const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";

const VerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      const lastInput = document.getElementById(`otp-5`);
      lastInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyOtp({ email, otp: otpString });
      if (response.resetToken) {
        setSuccess(true);
        // Store resetToken in localStorage as backup
        localStorage.setItem("resetToken", response.resetToken);
        localStorage.setItem("resetEmail", email);
        
        // Navigate to reset password page with reset token
        setTimeout(() => {
          navigate("/reset-password", { state: { resetToken: response.resetToken, email } });
        }, 1500);
      }
    } catch (err: any) {
      console.error("Verify OTP error:", err);
      
      // Handle 403 Forbidden errors specifically
      if (err?.response?.status === 403) {
        // Clear any invalid token that might be causing the issue
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setError("Access denied. Please try again. If the problem persists, please request a new OTP.");
      } else {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Invalid OTP. Please try again.";
        setError(msg);
      }
      
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
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
              onClick={() => navigate("/forgot-password")}
              className="mb-4 flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className={`p-2 rounded-xl ${ACCENT_GRADIENT} shadow-lg shadow-cyan-500/10`}>
                <ShieldCheck className="w-5 h-5 text-slate-950" />
              </span>
              <div>
                <h1 className="text-xl font-semibold">Verify OTP</h1>
                <p className="text-sm text-slate-400">
                  Enter the 6-digit code sent to {email}
                </p>
              </div>
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
                <span>OTP verified successfully! Redirecting to reset password...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-xl font-semibold rounded-lg border border-white/10 bg-white/5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                    disabled={loading || success}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || success || otp.join("").length !== 6}
                className={`w-full ${ACCENT_GRADIENT} text-slate-950 font-semibold py-3 rounded-lg shadow-lg shadow-cyan-500/20 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300`}
              >
                {loading ? "Verifying..." : success ? "Verified!" : "Verify OTP"}
              </button>
            </form>

            <div className="mt-4 text-sm text-slate-400 text-center">
              Didn't receive the code?{' '}
              <Link
                to="/forgot-password"
                className="text-cyan-300 hover:text-cyan-200 underline-offset-4 hover:underline"
              >
                Resend OTP
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;

