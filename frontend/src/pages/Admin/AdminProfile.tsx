import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, Calendar, Shield, AlertCircle, Loader2, Save, X } from "lucide-react";
import { getProfile, ProfileResponse } from "../../api/profile";
import { getEmployeeDetails, updateEmployee, UpdateEmployeeDTO } from "../../api/admin";
import { useAuth } from "../../hooks/useAuth";
import { format } from "date-fns";
import ProfilePicture from "../../components/profile/ProfilePicture";

const AdminProfile: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateEmployeeDTO | null>(null);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        // Get basic profile
        const basicProfile = await getProfile(auth.role || "ADMIN");
        setProfile(basicProfile);
        
        // If we have an ID, get full employee details for editing
        if (basicProfile.id) {
          try {
            const fullDetails = await getEmployeeDetails(basicProfile.id);
            setFormData({
              firstName: fullDetails.firstName,
              lastName: fullDetails.lastName,
              phoneNumber: fullDetails.phoneNumber,
              isActive: fullDetails.isActive,
            });
          } catch (err) {
            // If we can't get full details, use basic profile data
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

    if (auth.role) {
      fetchProfile();
    }
  }, [auth.role]);

  // Handle save
  const handleSave = async () => {
    if (!profile?.id || !formData) return;

    // Validate
    if (!formData.firstName.trim() || formData.firstName.trim().length < 2 || formData.firstName.trim().length > 50) {
      setError("First name must be between 2-50 characters");
      return;
    }
    if (!formData.lastName.trim() || formData.lastName.trim().length < 2 || formData.lastName.trim().length > 50) {
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
      
      // Update profile state
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile || !formData) {
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
          <p className="text-gray-600 mt-1">
            {isEditing ? "Edit your personal information" : "View and manage your profile"}
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <User className="w-4 h-4" />
            Edit Profile
          </button>
        )}
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
            editable={isEditing}
          />
          <div className="mt-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-gray-600 flex items-center justify-center gap-2 mt-2">
              <Mail className="w-4 h-4" />
              {profile.email}
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded">
                {profile.role}
              </span>
              {formData.isActive && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded">
                  Active
                </span>
              )}
              {!formData.isActive && (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-semibold rounded">
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  ) : (
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                      {profile.firstName || "N/A"}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  ) : (
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                      {profile.lastName || "N/A"}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 flex items-center gap-2 cursor-not-allowed">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {profile.email}
                </div>
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, phoneNumber: e.target.value })
                      }
                      placeholder="07XXXXXXXX"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Format: 07XXXXXXXX (10 digits)</p>
                  </>
                ) : (
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {profile.phoneNumber || "N/A"}
                  </div>
                )}
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
            {isEditing && (
              <div className="mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active Account</span>
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Inactive accounts cannot log in to the system
                </p>
              </div>
            )}
          </div>

          {/* Security Section */}
          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
            <button
              type="button"
              onClick={() => navigate("/change-password")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Lock className="w-4 h-4" />
              Change Password
            </button>
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="pt-6 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setError(null);
                  // Reset form data
                  if (profile) {
                    setFormData({
                      firstName: profile.firstName,
                      lastName: profile.lastName,
                      phoneNumber: profile.phoneNumber || "",
                      isActive: profile.isActive !== false,
                    });
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                disabled={saving}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;

