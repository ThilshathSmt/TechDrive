import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { changePassword } from "../../api/auth";
import { AuthContext } from "../../context/AuthContext";
import { useAuth } from "../../hooks/useAuth";

const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";

const ChangePassword: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!auth.token) {
      navigate("/login");
    }
  }, [auth.token, navigate]);

  const validate = () => {
    // Old password is always required (backend requirement)
    if (!oldPassword) {
      return auth.isFirstLogin 
        ? "Temporary password is required." 
        : "Current password is required.";
    }
    
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
    
    // Check if new password is different from old password
    if (oldPassword === newPassword) {
      return auth.isFirstLogin
        ? "New password must be different from your temporary password."
        : "New password must be different from current password.";
    }
    
    if (newPassword !== confirmPassword) {
      return "Passwords do not match.";
    }
    return null;
  };

  const goByRole = (role: string) => {
    if (role === "ADMIN") navigate("/admin-dashboard");
    else if (role === "EMPLOYEE") navigate("/employee-dashboard");
    else navigate("/customer-dashboard");
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
      
      // Backend requires oldPassword, so we send it (temporary password for first login)
      const changePasswordPayload = {
        oldPassword,
        newPassword,
        confirmPassword,
      };
      
      const response = await changePassword(changePasswordPayload);
      if (response.success) {
        setSuccess(true);
        // Update isFirstLogin flag if it was first login
        if (auth.isFirstLogin) {
          auth.setIsFirstLogin(false);
        }
        // Navigate to appropriate dashboard after 2 seconds
        setTimeout(() => {
          if (auth.role) {
            goByRole(auth.role);
          } else {
            navigate("/login");
          }
        }, 2000);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to change password. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!auth.token) {
    return null; // Will redirect via useEffect
  }

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
            <div className="mb-6">
              <h1 className="text-xl font-semibold">
                {auth.isFirstLogin ? "Set Your Password" : "Change Password"}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {auth.isFirstLogin
                  ? "This is your first login. Please enter your temporary password and set a new password to continue."
                  : "Enter your current password and choose a new one. It must be at least 8 characters with uppercase, lowercase, number, and special character."}
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
                <span>
                  {auth.isFirstLogin
                    ? "Password set successfully! Redirecting to dashboard..."
                    : "Password changed successfully! Redirecting to dashboard..."}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="text-sm text-slate-300">
                {auth.isFirstLogin ? "Temporary Password" : "Current Password"}
                <div className="mt-1 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showOldPw ? "text" : "password"}
                    autoComplete={auth.isFirstLogin ? "new-password" : "current-password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-10 py-3 pr-12 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                    placeholder={auth.isFirstLogin ? "Enter your temporary password" : "Enter current password"}
                    required
                    disabled={loading || success}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPw((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                    aria-label={showOldPw ? "Hide password" : "Show password"}
                  >
                    {showOldPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {auth.isFirstLogin && (
                  <p className="text-xs text-slate-400 mt-1">
                    Enter the temporary password provided to you
                  </p>
                )}
              </label>

              <label className="text-sm text-slate-300">
                {auth.isFirstLogin ? "New Password" : "New Password"}
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
                disabled={loading || success}
                className={`w-full ${ACCENT_GRADIENT} text-slate-950 font-semibold py-3 rounded-lg shadow-lg shadow-cyan-500/20 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300`}
              >
                {loading
                  ? auth.isFirstLogin
                    ? "Setting Password..."
                    : "Changing Password..."
                  : success
                  ? "Success!"
                  : auth.isFirstLogin
                  ? "Set Password"
                  : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;

