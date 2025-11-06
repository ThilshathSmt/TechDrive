import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, Calendar, Shield, AlertCircle, Loader2, Info, RefreshCw } from "lucide-react";
import { getProfile, ProfileResponse } from "../../api/profile";
import { useAuth } from "../../hooks/useAuth";
import { format } from "date-fns";
import ProfilePicture from "../../components/profile/ProfilePicture";

const EmployeeProfile: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);

  // Fetch profile function
  const fetchProfile = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
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
  }, [auth.role]);

  // Fetch profile on mount
  useEffect(() => {
    if (auth.role) {
      fetchProfile();
    }
  }, [auth.role, fetchProfile]);

  // Auto-refresh when window gains focus (user switches tabs/apps and comes back)
  useEffect(() => {
    const handleFocus = () => {
      if (auth.role && !loading && !refreshing) {
        fetchProfile(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [auth.role, loading, refreshing, fetchProfile]);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchProfile(true);
  };


  // Format date
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <p>{error || "Failed to load profile"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">View your personal information</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh profile data"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Info Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-800 font-medium">Profile Update</p>
          <p className="text-sm text-blue-700 mt-1">
            To update your profile information, please contact your administrator.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        {/* Profile Header - Large Picture at Top */}
        <div className="flex flex-col items-center mb-8 pb-8 border-b">
          <ProfilePicture
            userId={profile.id}
            firstName={profile.firstName}
            lastName={profile.lastName}
            email={profile.email}
            size="2xl"
            editable={true}
          />
          <div className="mt-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {profile.firstName && profile.lastName
                ? `${profile.firstName} ${profile.lastName}`
                : profile.name || profile.email}
            </h2>
            <p className="text-gray-600 flex items-center justify-center gap-2 mt-2">
              <Mail className="w-4 h-4" />
              {profile.email}
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded">
                {profile.role}
              </span>
              {profile.isActive !== false && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded">
                  Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information (Read-only) */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Name
                </label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                  {profile.firstName && profile.lastName
                    ? `${profile.firstName} ${profile.lastName}`
                    : profile.name || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Email
                </label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {profile.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Phone Number
                </label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {profile.phoneNumber || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="text-sm font-medium text-gray-900">{profile.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(profile.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
            <button
              type="button"
              onClick={() => navigate("/change-password")}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              <Lock className="w-4 h-4" />
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
