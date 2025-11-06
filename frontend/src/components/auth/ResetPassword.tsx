import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { resetPassword } from "../../api/auth";

const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get resetToken from location state or localStorage (fallback)
  const [resetToken, setResetToken] = useState<string>(
    location.state?.resetToken || localStorage.getItem("resetToken") || ""
  );
  const [email, setEmail] = useState<string>(
    location.state?.email || localStorage.getItem("resetEmail") || ""
  );

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Store resetToken in localStorage when received from location state
  useEffect(() => {
    if (location.state?.resetToken) {
      setResetToken(location.state.resetToken);
      localStorage.setItem("resetToken", location.state.resetToken);
    }
    if (location.state?.email) {
      setEmail(location.state.email);
      localStorage.setItem("resetEmail", location.state.email);
    }
  }, [location.state]);

  // Redirect if no reset token (with a small delay to allow state to set)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!resetToken) {
        console.warn("No reset token found, redirecting to forgot password");
        navigate("/forgot-password");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [resetToken, navigate]);

  const validate = () => {
    if (!newPassword) return "New password is required.";
    if (newPassword.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (!/(?=.*[a-z])/.test(newPassword)) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!/(?=.*[A-Z])/.test(newPassword)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!/(?=.*\d)/.test(newPassword)) {
      return "Password must contain at least one number.";
    }
    if (!/(?=.*[@$!%*?&])/.test(newPassword)) {
      return "Password must contain at least one special character (@$!%*?&).";
    }
    if (newPassword !== confirmPassword) {
      return "Passwords do not match.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Check if resetToken exists
    if (!resetToken) {
      setError("Reset token is missing. Please start the password reset process again.");
      setTimeout(() => {
        navigate("/forgot-password");
      }, 2000);
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      console.log("Submitting reset password request with token:", resetToken.substring(0, 10) + "...");
      
      const response = await resetPassword({
        resetToken,
        newPassword,
        confirmPassword,
      });
      
      console.log("Reset password response:", response);
      
      if (response.success) {
        setSuccess(true);
        // Clear stored reset token
        localStorage.removeItem("resetToken");
        localStorage.removeItem("resetEmail");
        
        // Navigate to login after 2 seconds
        setTimeout(() => {
          navigate("/login", { state: { message: "Password reset successfully! Please login with your new password." } });
        }, 2000);
      } else {
        setError(response.message || "Failed to reset password. Please try again.");
      }
    } catch (err: any) {
      console.error("Reset password error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to reset password. Please try again.";
      setError(msg);
      
      // If token is invalid/expired, clear it and redirect
      if (msg.includes("expired") || msg.includes("Invalid")) {
        localStorage.removeItem("resetToken");
        localStorage.removeItem("resetEmail");
        setTimeout(() => {
          navigate("/forgot-password");
        }, 3000);
      }
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
              onClick={() => navigate("/verify-otp", { state: { email } })}
              className="mb-4 flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="mb-6">
              <h1 className="text-xl font-semibold">Reset Password</h1>
              <p className="text-sm text-slate-400 mt-1">
                Enter your new password. It must be at least 8 characters with uppercase, lowercase, number, and special character.
              </p>
              {!resetToken && (
                <p className="text-sm text-yellow-400 mt-2">
                  ⚠️ Reset token not found. Please start the password reset process again.
                </p>
              )}
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
                <span>Password reset successfully! Redirecting to login...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="text-sm text-slate-300">
                New Password
                <div className="mt-1 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showNewPw ? "text" : "password"}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-10 py-3 pr-12 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                    placeholder="Enter new password"
                    required
                    disabled={loading || success}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                    aria-label={showNewPw ? "Hide password" : "Show password"}
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </label>

              <label className="text-sm text-slate-300">
                Confirm Password
                <div className="mt-1 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-10 py-3 pr-12 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                    placeholder="Confirm new password"
                    required
                    disabled={loading || success}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                    aria-label={showConfirmPw ? "Hide password" : "Show password"}
                  >
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={loading || success || !resetToken}
                className={`w-full ${ACCENT_GRADIENT} text-slate-950 font-semibold py-3 rounded-lg shadow-lg shadow-cyan-500/20 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300`}
              >
                {loading ? "Resetting Password..." : success ? "Password Reset!" : !resetToken ? "Missing Reset Token" : "Reset Password"}
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

export default ResetPassword;

