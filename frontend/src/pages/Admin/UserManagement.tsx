import React, { useState } from "react";
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  X,
  Loader,
} from "lucide-react";
import { addAdmin, addEmployee, listEmployees, getEmployeeDetails, updateEmployee, EmployeeDetailDTO, UpdateEmployeeDTO } from "../../api/admin";
import useApi from "../../hooks/useApi";

type CreateType = "EMPLOYEE" | "ADMIN";

// The backend GET /api/admin/employees returns UserDto with id
type UserRow = {
  id?: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
  phoneNumber?: string;
  isActive?: boolean;
};

const CreateUserForm: React.FC<{
  createType: CreateType;
  onSubmit: (data: {
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  error: string | null;
}> = ({ createType, onSubmit, onCancel, isSubmitting, error }) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const validate = () => {
    if (!email.trim()) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = validate();
    if (msg) {
      setLocalError(msg);
      return;
    }
    setLocalError(null);
    await onSubmit({
      email: email.trim(),
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">
        Creating a <span className="font-medium">{createType}</span>
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Optional"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email *</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
          placeholder={createType === "ADMIN" ? "admin@company.com" : "employee@company.com"}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="Optional"
        />
      </div>

      {(localError || error) && (
        <div className="text-red-600 text-sm">{localError || error}</div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" /> Creating…
            </span>
          ) : (
            "Create"
          )}
        </button>
      </div>
    </form>
  );
};

const UserManagement: React.FC = () => {
  const { data: usersRaw, loading, error, refetch } = useApi<UserRow[]>(
    () => listEmployees(),
    []
  );
  const users = usersRaw ?? [];

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [createType, setCreateType] = useState<CreateType>("EMPLOYEE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // filter users by search & role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === "ALL" || (user.role || "").toUpperCase() === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Create user (Employee/Admin)
  const handleAddUser = async (payload: {
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (createType === "ADMIN") {
        await addAdmin(payload);
      } else {
        await addEmployee(payload);
      }
      await refetch();
      setShowAddModal(false);
    } catch (err: any) {
      setFormError(err?.response?.data || "Failed to add user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateEmployeeDTO | null>(null);
  const [loadingEmployee, setLoadingEmployee] = useState(false);
  const [savingEmployee, setSavingEmployee] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Handle edit - only for employees and admins
  const handleEdit = async (user: UserRow) => {
    // Only allow editing employees and admins
    if (user.role !== "EMPLOYEE" && user.role !== "ADMIN") {
      alert("Only employees and admins can be edited here. Customers manage their own profiles.");
      return;
    }

    if (!user.id) {
      alert("User ID not available. Please refresh the page.");
      return;
    }

    try {
      setLoadingEmployee(true);
      setEditError(null);
      const employeeDetails = await getEmployeeDetails(user.id);
      setEditingUser(user);
      setEditFormData({
        firstName: employeeDetails.firstName,
        lastName: employeeDetails.lastName,
        phoneNumber: employeeDetails.phoneNumber,
        isActive: employeeDetails.isActive,
      });
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to load employee details";
      alert(errorMsg);
    } finally {
      setLoadingEmployee(false);
    }
  };

  // Handle save employee update
  const handleSaveEmployee = async () => {
    if (!editingUser?.id || !editFormData) return;

    // Validate
    if (!editFormData.firstName.trim() || editFormData.firstName.trim().length < 2 || editFormData.firstName.trim().length > 50) {
      setEditError("First name must be between 2-50 characters");
      return;
    }
    if (!editFormData.lastName.trim() || editFormData.lastName.trim().length < 2 || editFormData.lastName.trim().length > 50) {
      setEditError("Last name must be between 2-50 characters");
      return;
    }
    if (!/^0(7[0-9]{8})$/.test(editFormData.phoneNumber.trim())) {
      setEditError("Invalid phone number format. Must be: 07XXXXXXXX (10 digits)");
      return;
    }

    try {
      setSavingEmployee(true);
      setEditError(null);
      await updateEmployee(editingUser.id, {
        firstName: editFormData.firstName.trim(),
        lastName: editFormData.lastName.trim(),
        phoneNumber: editFormData.phoneNumber.trim(),
        isActive: editFormData.isActive,
      });
      await refetch();
      setEditingUser(null);
      setEditFormData(null);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to update employee";
      setEditError(errorMsg);
    } finally {
      setSavingEmployee(false);
    }
  };

  const deleteUser = () => {
    alert("Delete user is not supported by the backend API.");
  };

  const getRoleBadgeColor = (role?: string) => {
    switch ((role || "").toUpperCase()) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "EMPLOYEE":
        return "bg-purple-100 text-purple-800";
      case "CUSTOMER":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const total = users.length;
  const customers = users.filter((u) => (u.role || "").toUpperCase() === "CUSTOMER").length;
  const employees = users.filter((u) => (u.role || "").toUpperCase() === "EMPLOYEE").length;
  const admins = users.filter((u) => (u.role || "").toUpperCase() === "ADMIN").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all users in the system</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
            <Users className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customers}</p>
            </div>
            <Users className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Employees</p>
              <p className="text-2xl font-bold text-gray-900">{employees}</p>
            </div>
            <Users className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Admins</p>
              <p className="text-2xl font-bold text-gray-900">{admins}</p>
            </div>
            <Users className="w-10 h-10 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="md:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {error ? (
          <div className="p-12 text-center text-red-600">
            Error loading users: {error.message}
          </div>
        ) : loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const initials = (user.name || "")
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((s) => s.charAt(0))
                    .join("")
                    .toUpperCase();

                  return (
                    <tr key={user.id || user.email} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {initials || "U"}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || "—"}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {user.phoneNumber || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {user.role || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                            disabled={user.role === "CUSTOMER"}
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={deleteUser}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination (static demo) */}
      <div className="bg-white rounded-lg shadow px-6 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredUsers.length}</span>{" "}
            of <span className="font-medium">{users.length}</span> users
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              2
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Add New User</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-6 pt-4">
              <div className="mb-4 flex gap-2">
                <button
                  type="button"
                  className={`px-3 py-1 rounded ${
                    createType === "EMPLOYEE"
                      ? "bg-blue-600 text-white"
                      : "border"
                  }`}
                  onClick={() => setCreateType("EMPLOYEE")}
                >
                  Employee
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded ${
                    createType === "ADMIN"
                      ? "bg-purple-600 text-white"
                      : "border"
                  }`}
                  onClick={() => setCreateType("ADMIN")}
                >
                  Admin
                </button>
              </div>
            </div>

            <div className="p-6">
              <CreateUserForm
                createType={createType}
                onSubmit={async (payload) => {
                  await handleAddUser(payload);
                }}
                onCancel={() => setShowAddModal(false)}
                isSubmitting={isSubmitting}
                error={formError}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee/Admin Modal */}
      {editingUser && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                Edit {editingUser.role === "ADMIN" ? "Admin" : "Employee"} Profile
              </h2>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setEditFormData(null);
                  setEditError(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {loadingEmployee ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-4">
                  {editError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
                      {editError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editingUser.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.firstName}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, firstName: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.lastName}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, lastName: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={editFormData.phoneNumber}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, phoneNumber: e.target.value })
                      }
                      placeholder="07XXXXXXXX"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Format: 07XXXXXXXX (10 digits)</p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editFormData.isActive}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, isActive: e.target.checked })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Active Account</span>
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      Inactive accounts cannot log in to the system
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingUser(null);
                        setEditFormData(null);
                        setEditError(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={savingEmployee}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEmployee}
                      disabled={savingEmployee}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {savingEmployee ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;