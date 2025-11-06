import React from "react";
import { Loader } from "lucide-react";
import { addAdmin } from "../../../api/admin";

type Props = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

const AdminCreateForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const validate = () => {
    if (!email.trim()) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = validate();
    if (msg) return setError(msg);

    setSubmitting(true);
    setError(null);
    try {
      await addAdmin({
        email: email.trim(),
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        // role omitted; server defaults to ADMIN
      });
      onSuccess?.();
    } catch (err: any) {
      setError(err?.response?.data || "Failed to create admin");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="admin@company.com"
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

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md">
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-md disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" /> Creating…
            </span>
          ) : (
            "Create Admin"
          )}
        </button>
      </div>
    </form>
  );
};

export default AdminCreateForm;