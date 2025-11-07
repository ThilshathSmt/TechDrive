// src/pages/Admin/AdminProfile.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  Shield,
  AlertCircle,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { getProfile, ProfileResponse } from "../../api/profile";
import { getEmployeeDetails, updateEmployee, UpdateEmployeeDTO } from "../../api/admin";
import { useAuth } from "../../hooks/useAuth";
import { format } from "date-fns";
import ProfilePicture from "../../components/profile/ProfilePicture";

/** ---- UI TOKENS (match Home) ---- */
const ACCENT_GRADIENT =
  "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const INPUT =
  "mt-1 w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2.5 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 focus:border-transparent";
const LABEL = "block text-sm font-medium text-slate-200";
const MUTED = "text-slate-300/90";

const AdminProfile: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateEmployeeDTO | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Basic profile
        const basicProfile = await getProfile(auth.role || "ADMIN");
        setProfile(basicProfile);

        // Full details (for edit form) if ID exists
        if (basicProfile.id) {
          try {
            const fullDetails = await getEmployeeDetails(basicProfile.id);
            setFormData({
              firstName: fullDetails.firstName,
              lastName: fullDetails.lastName,
              phoneNumber: fullDetails.phoneNumber,
              isActive: fullDetails.isActive,
            });
          } catch {
            setFormData({
              firstName: basicProfile.firstName,
              lastName: basicProfile.lastName,
              phoneNumber: basicProfile.phoneNumber || "",
              isActive: basicProfile.isActive !== false,
            });
          }
        } else {
          setFormData({
            firstName: basicProfile.firstName,
            lastName: basicProfile.lastName,
            phoneNumber: basicProfile.phoneNumber || "",
            isActive: basicProfile.isActive !== false,
          });
        }
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Failed to load profile";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (auth.role) fetchProfile();
  }, [auth.role]);

  const handleSave = async () => {
    if (!profile?.id || !formData) return;

    // Validate
    if (
      !formData.firstName.trim() ||
      formData.firstName.trim().length < 2 ||
      formData.firstName.trim().length > 50
    ) {
      setError("First name must be between 2-50 characters");
      return;
    }
    if (
      !formData.lastName.trim() ||
      formData.lastName.trim().length < 2 ||
      formData.lastName.trim().length > 50
    ) {
      setError("Last name must be between 2-50 characters");
      return;
    }
    if (!/^0(7[0-9]{8})$/.test(formData.phoneNumber.trim())) {
      setError("Invalid phone number format. Must be: 07XXXXXXXX (10 digits)");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const updated = await updateEmployee(profile.id, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        isActive: formData.isActive,
      });

      setProfile({
        ...profile,
        firstName: updated.firstName,
        lastName: updated.lastName,
        phoneNumber: updated.phoneNumber,
        isActive: updated.isActive,
      });

      setIsEditing(false);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to update profile";
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-[420px] text-white">
        {/* Backdrop */}
        <Backdrop />
        <div className="flex items-center justify-center min-h-[420px]">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-300" />
        </div>
      </div>
    );
  }

  if (!profile || !formData) {
    return (
      <div className="relative text-white">
        <Backdrop />
        <div className="mx-auto max-w-5xl px-6 py-8">
          <PageHeader title="My Profile" subtitle={error || "Failed to load profile"} danger />
        </div>
      </div>
    );
  }

  return (
    <div className="relative text-white">
      {/* Backdrop like Home */}
      <Backdrop />

      {/* Container */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Header */}
        <PageHeader
          title="My Profile"
          subtitle={isEditing ? "Edit your personal information" : "View and manage your profile"}
          rightAction={
            !isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className={`${ACCENT_GRADIENT} text-slate-950 rounded-xl px-4 py-2 ring-1 ring-white/10 hover:brightness-110 inline-flex items-center gap-2 font-semibold`}
              >
                <User className="w-4 h-4" />
                Edit Profile
              </button>
            ) : null
          }
        />

        {/* Error Alert */}
        {error && (
          <div className={`${CARD} p-4 mt-4 text-rose-200 ring-1 ring-rose-400/20 bg-rose-500/10 flex items-center gap-2`}>
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Profile Card */}
        <motion.section
          className={`${CARD} mt-6 p-6 md:p-8`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Header with avatar */}
          <div className="flex flex-col items-center mb-8 pb-8 border-b border-white/10">
            <div className="relative">
              <div
                className="absolute -inset-1 rounded-full blur-2xl opacity-60"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(34,211,238,0.35), transparent 80%)",
                }}
              />
              <ProfilePicture
                userId={profile.id}
                firstName={profile.firstName}
                lastName={profile.lastName}
                email={profile.email}
                size="2xl"
                editable={isEditing}
              />
            </div>

            <div className="mt-6 text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className={`${MUTED} flex items-center justify-center gap-2 mt-2`}>
                <Mail className="w-4 h-4" />
                {profile.email}
              </p>

              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="px-3 py-1 rounded bg-white/10 ring-1 ring-white/10 text-xs">
                  {profile.role}
                </span>
                {formData.isActive ? (
                  <span className="px-3 py-1 rounded bg-emerald-500/15 ring-1 ring-emerald-400/25 text-emerald-200 text-xs">
                    Active
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded bg-white/10 ring-1 ring-white/10 text-xs">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: personal info form */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className={LABEL} htmlFor="firstName">
                    First Name <span className="text-rose-300">*</span>
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        className={INPUT}
                        required
                      />
                    </div>
                  ) : (
                    <div className="mt-1 w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2.5">
                      {profile.firstName || "N/A"}
                    </div>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className={LABEL} htmlFor="lastName">
                    Last Name <span className="text-rose-300">*</span>
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className={INPUT}
                        required
                      />
                    </div>
                  ) : (
                    <div className="mt-1 w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2.5">
                      {profile.lastName || "N/A"}
                    </div>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="mt-4">
                <label className={LABEL}>Email</label>
                <div className="mt-1 w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2.5 text-slate-300/90 flex items-center gap-2 cursor-not-allowed">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {profile.email}
                </div>
                <p className="mt-1 text-xs text-slate-400">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div className="mt-4">
                <label className={LABEL} htmlFor="phone">
                  Phone Number <span className="text-rose-300">*</span>
                </label>
                {isEditing ? (
                  <>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, phoneNumber: e.target.value })
                      }
                      placeholder="07XXXXXXXX"
                      className={INPUT}
                      required
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      Format: 07XXXXXXXX (10 digits)
                    </p>
                  </>
                ) : (
                  <div className="mt-1 w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2.5 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {profile.phoneNumber || "N/A"}
                  </div>
                )}
              </div>
            </div>

            {/* Right: account & security */}
            <div className="space-y-6">
              <div className={`${CARD} p-4`}>
                <h4 className="font-semibold mb-3 text-slate-800">Account</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-slate-800" />
                    <div>
                      <div className="text-slate-800">Role</div>
                      <div className="font-medium text-slate-600">{profile.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-slate-800">Member Since</div>
                      <div className="font-medium text-slate-600">{formatDate(profile.createdAt)}</div>
                    </div>
                  </div>

                  {isEditing && (
                    <label className="mt-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({ ...formData, isActive: e.target.checked })
                        }
                        className="w-4 h-4 text-cyan-300 bg-white/5 border-white/20 rounded focus:ring-cyan-300/60"
                      />
                      <span className="text-sm text-slate-600">Active account</span>
                    </label>
                  )}
                </div>
              </div>

              <div className={`${CARD} p-4`}>
                <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
                <h4 className="font-semibold mb-3 text-gray-900">Security</h4>

                <button
                  type="button"
                  onClick={() => navigate("/change-password")}
                  className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Lock className="w-4 h-4" />
                  Change Password
                </button>
              </div>
              </div>
            </div>
          </div> {/* end grid (left form + right cards) */}

          {/* Actions */}
          {isEditing && (
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setError(null);
                  if (profile) {
                    setFormData({
                      firstName: profile.firstName,
                      lastName: profile.lastName,
                      phoneNumber: profile.phoneNumber || "",
                      isActive: profile.isActive !== false,
                    });
                  }
                }}
                className="px-4 py-2 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 inline-flex items-center gap-2"
                disabled={saving}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={`${ACCENT_GRADIENT} text-slate-950 rounded-xl px-4 py-2 ring-1 ring-white/10 hover:brightness-110 disabled:opacity-60 inline-flex items-center gap-2 font-semibold`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
};

export default AdminProfile;

/** ----- Small composables ----- */

const Backdrop = () => (
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
);

const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  danger?: boolean;
}> = ({ title, subtitle, rightAction, danger }) => (
  <div className="flex items-start justify-between gap-4">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
        <User className="w-5 h-5" />
      </div>
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{title}</h1>
        {subtitle && (
          <p className={`${danger ? "text-rose-200" : MUTED} text-sm`}>{subtitle}</p>
        )}
      </div>
    </div>
    {rightAction}
  </div>
);