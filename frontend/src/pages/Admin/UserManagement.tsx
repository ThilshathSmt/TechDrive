import React, { useMemo, useState } from "react";
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
  Shield,
  UserCircle,
  Filter,
} from "lucide-react";
import {
  addAdmin,
  addEmployee,
  listEmployees,
  getEmployeeDetails,
  updateEmployee,
  UpdateEmployeeDTO,
} from "../../api/admin";
import useApi from "../../hooks/useApi";
import { motion, AnimatePresence } from "framer-motion";

// ------------------------------------------------------------
// Theme tokens (consider extracting to ui/theme.ts)
// ------------------------------------------------------------
const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const BTN_BASE =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-0 ring-1 ring-white/10";
const INPUT =
  "w-full rounded-xl bg-white/5 text-white placeholder:text-slate-400 px-3 py-2.5 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/70";

// Types
type CreateType = "EMPLOYEE" | "ADMIN";

// ------------------------------------------------------------
// CreateUserForm (glassy)
// ------------------------------------------------------------
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
    if (phoneNumber && !/^[+\d][\d\s()-]{6,}$/.test(phoneNumber)) return "Enter a valid phone number.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = validate();
    if (msg) return setLocalError(msg);
    setLocalError(null);
    await onSubmit({
      email: email.trim(),
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-white">
      <p className="text-sm text-slate-300/90">
        Creating a <span className={`font-semibold px-2 py-0.5 rounded ${createType === "ADMIN" ? "bg-rose-500/10 ring-1 ring-rose-500/20" : "bg-violet-500/10 ring-1 ring-violet-500/20"}`}>{createType}</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-200">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={INPUT}
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-200">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={INPUT}
            placeholder="Optional"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200">Email *</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={INPUT}
          required
          placeholder={createType === "ADMIN" ? "admin@company.com" : "employee@company.com"}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200">Phone Number</label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className={INPUT}
          placeholder="Optional"
        />
      </div>

      {(localError || error) && (
        <div className="text-sm text-rose-300 bg-rose-500/10 ring-1 ring-rose-500/20 px-3 py-2 rounded-xl">{localError || error}</div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className={`${BTN_BASE} bg-white/5 hover:bg-white/10`}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`${BTN_BASE} ${ACCENT_GRADIENT} text-slate-950 hover:brightness-110 disabled:opacity-60`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2"><Loader className="w-4 h-4 animate-spin" /> Creating…</span>
          ) : (
            "Create"
          )}
        </button>
      </div>
    </form>
  );
};

// ------------------------------------------------------------
// Main: UserManagement
// ------------------------------------------------------------
const UserManagement: React.FC = () => {
  const { data: usersRaw, loading, error, refetch } = useApi<any[]>(() => listEmployees(), []);
  const users = usersRaw ?? [];

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [createType, setCreateType] = useState<CreateType>("EMPLOYEE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateEmployeeDTO | null>(null);
  const [loadingEmployee, setLoadingEmployee] = useState(false);
  const [savingEmployee, setSavingEmployee] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "ALL" || (user.role || "").toUpperCase() === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleAddUser = async (payload: {
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (createType === "ADMIN") await addAdmin(payload);
      else await addEmployee(payload);
      await refetch();
      setShowAddModal(false);
    } catch (err: any) {
      setFormError(err?.response?.data || "Failed to add user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (user: any) => {
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
      const details = await getEmployeeDetails(user.id);
      setEditingUser(user);
      setEditFormData({
        firstName: details.firstName,
        lastName: details.lastName,
        phoneNumber: details.phoneNumber,
        isActive: details.isActive,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || "Failed to load employee details";
      alert(msg);
    } finally {
      setLoadingEmployee(false);
    }
  };

  const handleSaveEmployee = async () => {
    if (!editingUser?.id || !editFormData) return;
    if (!editFormData.firstName?.trim() || editFormData.firstName.trim().length < 2 || editFormData.firstName.trim().length > 50) {
      return setEditError("First name must be between 2-50 characters");
    }
    if (!editFormData.lastName?.trim() || editFormData.lastName.trim().length < 2 || editFormData.lastName.trim().length > 50) {
      return setEditError("Last name must be between 2-50 characters");
    }
    if (!/^0(7[0-9]{8})$/.test(editFormData.phoneNumber?.trim() || "")) {
      return setEditError("Invalid phone number format. Must be: 07XXXXXXXX (10 digits)");
    }
    try {
      setSavingEmployee(true);
      setEditError(null);
      await updateEmployee(editingUser.id, {
        firstName: editFormData.firstName.trim(),
        lastName: editFormData.lastName.trim(),
        phoneNumber: editFormData.phoneNumber.trim(),
        isActive: !!editFormData.isActive,
      });
      await refetch();
      setEditingUser(null);
      setEditFormData(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || "Failed to update employee";
      setEditError(msg);
    } finally {
      setSavingEmployee(false);
    }
  };

  const deleteUser = () => {
    alert("Delete user is not supported by the backend API.");
  };

  const roleBadge = (role?: string) => {
    const r = (role || "").toUpperCase();
    const tone = r === "ADMIN" ? "rose" : r === "EMPLOYEE" ? "violet" : r === "CUSTOMER" ? "emerald" : "slate";
    return `px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${tone}-500/10 text-${tone}-300 ring-1 ring-${tone}-500/20`;
  };

  const totals = useMemo(() => {
    const total = users.length;
    const customers = users.filter((u: any) => (u.role || "").toUpperCase() === "CUSTOMER").length;
    const employees = users.filter((u: any) => (u.role || "").toUpperCase() === "EMPLOYEE").length;
    const admins = users.filter((u: any) => (u.role || "").toUpperCase() === "ADMIN").length;
    return { total, customers, employees, admins };
  }, [users]);

  return (
    <div className="relative text-white">
      {/* Backdrop like Home */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/80 to-slate-950/80" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[50rem] w-[50rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(34,211,238,0.35), transparent 70%)" }} />
        <div className="pointer-events-none absolute top-1/3 right-[-20%] h-[40rem] w-[40rem] rounded-full opacity-15 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(99,102,241,0.35), transparent 70%)" }} />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-slate-300/90 text-sm">Manage all users in the system</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className={`${BTN_BASE} ${ACCENT_GRADIENT} text-slate-950 hover:brightness-110`}
        >
          <Plus className="w-5 h-5" /> Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-6">
        {[
          { label: "Total Users", value: totals.total, tone: "cyan" },
          { label: "Customers", value: totals.customers, tone: "emerald" },
          { label: "Employees", value: totals.employees, tone: "violet" },
          { label: "Admins", value: totals.admins, tone: "rose" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className={`${CARD} p-5`}
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300/90 text-sm">{s.label}</p>
                <p className="text-3xl font-extrabold tracking-tight text-cyan-300">{s.value}</p>
              </div>
              <div className={`w-10 h-10 grid place-items-center rounded-xl ring-1 ring-white/10 bg-white/5`}>
                <Users className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className={`${CARD} p-5 mt-6`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${INPUT} pl-10`}
              />
            </div>
          </div>
          <div className="md:w-56">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={`${INPUT} appearance-none pl-10 pr-8`}
              >
                <option className="bg-slate-900" value="ALL">All Roles</option>
                <option className="bg-slate-900" value="CUSTOMER">Customer</option>
                <option className="bg-slate-900" value="EMPLOYEE">Employee</option>
                <option className="bg-slate-900" value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table / Cards */}
      <div className={`${CARD} mt-6 overflow-hidden`}>
        {error ? (
          <div className="p-12 text-center text-rose-300">Error loading users: {error.message}</div>
        ) : loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-cyan-300 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-300/90">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <UserCircle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-300/90">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr className="text-left">
                  {['User','Contact','Role','Actions'].map((h) => (
                    <th key={h} className="px-6 py-3 font-semibold text-slate-300/90">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map((user: any) => {
                  const initials = (user.name || "")
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((s: string) => s.charAt(0))
                    .join("")
                    .toUpperCase();

                  return (
                    <tr key={user.id || user.email} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 ${ACCENT_GRADIENT} rounded-xl grid place-items-center text-slate-950 font-bold ring-1 ring-white/10`}>
                            {initials || "U"}
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-white">{user.name || "—"}</div>
                            <div className="text-slate-300/90 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-white flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {user.phoneNumber || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={roleBadge(user.role)}>{user.role || "—"}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className={`${BTN_BASE} bg-white/5 hover:bg-white/10`}
                            title="Edit"
                            disabled={user.role === "CUSTOMER"}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={deleteUser}
                            className={`${BTN_BASE} bg-white/5 hover:bg-white/10`}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Footer / Pagination (static demo) */}
      <div className={`${CARD} px-6 py-4 mt-4`}>
        <div className="flex items-center justify-between text-slate-300/90 text-sm">
          <p>
            Showing <span className="font-semibold">{filteredUsers.length}</span> of {" "}
            <span className="font-semibold">{users.length}</span> users
          </p>
          <div className="flex gap-2">
            <button className={`${BTN_BASE} bg-white/5 hover:bg-white/10`}>Previous</button>
            <button className={`${BTN_BASE} ${ACCENT_GRADIENT} text-slate-950`}>1</button>
            <button className={`${BTN_BASE} bg-white/5 hover:bg-white/10`}>2</button>
            <button className={`${BTN_BASE} bg-white/5 hover:bg-white/10`}>Next</button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowAddModal(false)} />
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className={`${CARD} relative w-full max-w-2xl mx-4`}
            >
              <div className="flex justify-between items-center p-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-semibold">Add New User</h2>
                </div>
                <button onClick={() => setShowAddModal(false)} className={`${BTN_BASE} bg-white/5 hover:bg-white/10`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5">
                <div className="mb-4 flex gap-2">
                  <button
                    type="button"
                    className={`${BTN_BASE} ${createType === "EMPLOYEE" ? `${ACCENT_GRADIENT} text-slate-950` : "bg-white/5 hover:bg-white/10"}`}
                    onClick={() => setCreateType("EMPLOYEE")}
                  >
                    Employee
                  </button>
                  <button
                    type="button"
                    className={`${BTN_BASE} ${createType === "ADMIN" ? `${ACCENT_GRADIENT} text-slate-950` : "bg-white/5 hover:bg-white/10"}`}
                    onClick={() => setCreateType("ADMIN")}
                  >
                    Admin
                  </button>
                </div>

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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingUser && editFormData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => { setEditingUser(null); setEditFormData(null); setEditError(null); }} />
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className={`${CARD} relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex justify-between items-center p-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
                    <Edit className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-semibold">Edit {editingUser.role === "ADMIN" ? "Admin" : "Employee"} Profile</h2>
                </div>
                <button onClick={() => { setEditingUser(null); setEditFormData(null); setEditError(null); }} className={`${BTN_BASE} bg-white/5 hover:bg-white/10`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5">
                {loadingEmployee ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="w-8 h-8 animate-spin text-cyan-300" />
                  </div>
                ) : (
                  <div className="space-y-4 text-white">
                    {editError && (
                      <div className="bg-rose-500/10 ring-1 ring-rose-500/20 rounded-xl p-3 text-rose-300 text-sm">{editError}</div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1">Email</label>
                      <input
                        type="email"
                        value={editingUser.email}
                        disabled
                        className={`${INPUT} bg-white/10 text-slate-300 cursor-not-allowed`}
                      />
                      <p className="mt-1 text-xs text-slate-400">Email cannot be changed</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-200 mb-1">First Name <span className="text-rose-300">*</span></label>
                        <input
                          type="text"
                          value={editFormData.firstName}
                          onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                          className={INPUT}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-200 mb-1">Last Name <span className="text-rose-300">*</span></label>
                        <input
                          type="text"
                          value={editFormData.lastName}
                          onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                          className={INPUT}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1">Phone Number <span className="text-rose-300">*</span></label>
                      <input
                        type="tel"
                        value={editFormData.phoneNumber}
                        onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                        placeholder="07XXXXXXXX"
                        className={INPUT}
                        required
                      />
                      <p className="mt-1 text-xs text-slate-400">Format: 07XXXXXXXX (10 digits)</p>
                    </div>

                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!editFormData.isActive}
                          onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                          className="w-4 h-4 text-cyan-300 bg-white/5 border-white/20 rounded focus:ring-cyan-300/70"
                        />
                        <span className="text-sm font-medium text-slate-200">Active Account</span>
                      </label>
                      <p className="mt-1 text-xs text-slate-400">Inactive accounts cannot log in to the system</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => { setEditingUser(null); setEditFormData(null); setEditError(null); }}
                        className={`${BTN_BASE} bg-white/5 hover:bg-white/10`}
                        disabled={savingEmployee}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEmployee}
                        disabled={savingEmployee}
                        className={`${BTN_BASE} ${ACCENT_GRADIENT} text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {savingEmployee ? (
                          <span className="inline-flex items-center gap-2"><Loader className="w-4 h-4 animate-spin" /> Saving…</span>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;