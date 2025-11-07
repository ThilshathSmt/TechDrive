import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  Lock,
  Calendar,
  Shield,
  AlertCircle,
  Loader2,
  Info,
  RefreshCw,
  User as UserIcon,
} from "lucide-react";
import { getProfile, ProfileResponse } from "../../api/profile";
import { useAuth } from "../../hooks/useAuth";
import { format } from "date-fns";
import ProfilePicture from "../../components/profile/ProfilePicture";

/**
 * EmployeeProfile — GearSync (dark / glass / neon)
 * - Pure UI refactor; original data flow and behavior preserved
 */

const ACCENT_GRADIENT =
  "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const BTN =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2 ring-1 ring-white/10 bg-white/5 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70";

const EmployeeProfile: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);

  // Fetch profile function
  const fetchProfile = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) setRefreshing(true);
        else setLoading(true);
        setError(null);
        const data = await getProfile(auth.role || "EMPLOYEE");
        setProfile(data);
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Failed to load profile";
        setError(errorMsg);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [auth.role]
  );

  // Fetch profile on mount
  useEffect(() => {
    if (auth.role) fetchProfile();
  }, [auth.role, fetchProfile]);

  // Auto-refresh on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (auth.role && !loading && !refreshing) fetchProfile(true);
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [auth.role, loading, refreshing, fetchProfile]);

  const handleRefresh = () => fetchProfile(true);

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  // Loading screen (neon)
  if (loading) {
    return (
      <div className="relative min-h-[400px] grid place-items-center text-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
          <div
            className="pointer-events-none absolute -top-40 left-1/2 h-[50rem] w-[50rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
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
        </div>

        <div className={`${CARD} px-6 py-5 flex items-center gap-3`}>
          <Loader2 className="w-5 h-5 animate-spin text-cyan-300" />
          <span className="text-slate-200">Loading profile…</span>
        </div>
      </div>
    );
  }

  // Error / empty state
  if (!profile) {
    return (
      <div className="relative text-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
          <div
            className="pointer-events-none absolute -top-40 left-1/2 h-[50rem] w-[50rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, rgba(34,211,238,0.35), transparent 70%)",
            }}
          />
        </div>

        <main className="mx-auto max-w-5xl px-6 py-10 space-y-6">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}
            >
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">My Profile</h1>
              <p className="text-slate-300/90 mt-1">View your personal information</p>
            </div>
          </div>

          <div className={`${CARD} p-5`}>
            <div className="flex items-center gap-2 text-rose-300">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">
                {error || "Failed to load profile. Please try again."}
              </p>
            </div>
            <div className="mt-4">
              <button onClick={handleRefresh} className={BTN}>
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Normal view
  return (
    <div className="relative text-white">
      {/* Backdrop */}
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
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}
            >
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">My Profile</h1>
              <p className="text-slate-300/90 mt-1">
                View your personal information
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className={`${BTN} ${refreshing ? "opacity-70" : ""}`}
            title="Refresh profile data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {/* Info Notice */}
        <div className={`${CARD} p-5`}>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/20">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Profile Update</p>
              <p className="text-sm text-slate-300/90 mt-1">
                To update your profile information, please contact your administrator.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message (if any) */}
        {error && (
          <div className={`${CARD} p-5 ring-1 ring-rose-500/20`}>
            <div className="flex items-center gap-2 text-rose-300">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className={`${CARD} p-6`}>
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-8 pb-8 border-b border-white/10">
            <ProfilePicture
              userId={profile.id}
              firstName={profile.firstName}
              lastName={profile.lastName}
              email={profile.email}
              size="2xl"
              editable={true}
            />
            <div className="mt-6 text-center">
              <h2 className="text-3xl font-bold">
                {profile.firstName && profile.lastName
                  ? `${profile.firstName} ${profile.lastName}`
                  : profile.name || profile.email}
              </h2>
              <p className="text-slate-300/90 flex items-center justify-center gap-2 mt-2">
                <Mail className="w-4 h-4" />
                {profile.email}
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="px-3 py-1 bg-violet-500/10 text-violet-300 text-sm font-semibold rounded ring-1 ring-violet-500/20">
                  {profile.role}
                </span>
                {profile.isActive !== false && (
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-300 text-sm font-semibold rounded ring-1 ring-blue-500/20">
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information (read-only) */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300/90 mb-1">Name</label>
                  <div className="w-full px-3 py-2 rounded-xl bg-white/5 text-white ring-1 ring-white/10">
                    {profile.firstName && profile.lastName
                      ? `${profile.firstName} ${profile.lastName}`
                      : profile.name || "N/A"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300/90 mb-1">Email</label>
                  <div className="w-full px-3 py-2 rounded-xl bg-white/5 text-white ring-1 ring-white/10 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {profile.email}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300/90 mb-1">
                    Phone Number
                  </label>
                  <div className="w-full px-3 py-2 rounded-xl bg-white/5 text-white ring-1 ring-white/10 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {profile.phoneNumber || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/5 ring-1 ring-white/10">
                    <Shield className="w-5 h-5 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Role</p>
                    <p className="text-sm font-medium text-white">{profile.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/5 ring-1 ring-white/10">
                    <Calendar className="w-5 h-5 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Member Since</p>
                    <p className="text-sm font-medium text-white">
                      {formatDate(profile.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold mb-4">Security</h3>
              <button
                type="button"
                onClick={() => navigate("/change-password")}
                className={`${BTN}`}
              >
                <Lock className="w-4 h-4" />
                Change Password
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeProfile;