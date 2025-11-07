import React from "react";
import { Loader, Mail, User as UserIcon, Phone, BadgeCheck, X, Info } from "lucide-react";
import { motion } from "framer-motion";
import { addEmployee } from "../../../api/admin";

/**
 * EmployeeCreateForm — Home UI polished (dark / glass / neon)
 * - Consistent with site tokens (glassy card, cyan/indigo gradient)
 * - Field-level validation + banner error
 * - Accessible labels, hints, and focus states
 */

type Props = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

// Theme tokens (consider extracting to ui/theme.ts)
const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const INPUT =
  "mt-1 w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2.5 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 focus:border-transparent";
const LABEL = "block text-sm font-medium text-slate-200";
const HELP = "mt-1 text-xs text-slate-400";

const EmployeeCreateForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);

  const validate = () => {
    const fe: Record<string, string> = {};
    if (!email.trim()) fe.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) fe.email = "Enter a valid email (e.g. name@domain.com).";
    if (phoneNumber && !/^[+\d][\d\s()-]{6,}$/.test(phoneNumber)) fe.phone = "Enter a valid phone number.";
    setFieldErrors(fe);
    return Object.keys(fe).length ? "Please fix the highlighted fields." : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = validate();
    if (msg) return setError(msg);

    setSubmitting(true);
    setError(null);
    try {
      await addEmployee({
        email: email.trim(),
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
      });
      onSuccess?.();
    } catch (err: any) {
      setError(err?.response?.data || "Failed to create employee");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* subtle Home-like backlight */}
      <div
        className="pointer-events-none absolute -z-10 -top-24 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(34,211,238,0.35), transparent 70%)" }}
      />

      <motion.form
        onSubmit={handleSubmit}
        className={`${CARD} p-6 md:p-8 text-white`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        aria-describedby={error ? "form-error" : undefined}
        noValidate
      >
        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
            <BadgeCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Create Employee</h2>
            <p className="text-sm text-slate-300/90">Invite a new team member to the workspace.</p>
          </div>
        </div>

        {/* Banner error */}
        {error && (
          <div id="form-error" className="mb-4 inline-flex items-center gap-2 text-sm text-rose-300 bg-rose-500/10 ring-1 ring-rose-500/20 px-3 py-2 rounded-xl">
            <X className="w-4 h-4" /> {error}
          </div>
        )}

        {/* Name row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL} htmlFor="firstName">First Name</label>
            <div className="relative">
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`${INPUT} ${fieldErrors.firstName ? "ring-rose-400/40" : ""}`}
                placeholder="Optional"
                autoComplete="given-name"
              />
              <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div>
            <label className={LABEL} htmlFor="lastName">Last Name</label>
            <div className="relative">
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`${INPUT} ${fieldErrors.lastName ? "ring-rose-400/40" : ""}`}
                placeholder="Optional"
                autoComplete="family-name"
              />
              <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="mt-4">
          <label className={LABEL} htmlFor="email">Email <span className="text-rose-300">*</span></label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${INPUT} ${fieldErrors.email ? "ring-rose-400/40" : ""}`}
              required
              placeholder="employee@company.com"
              autoComplete="email"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
            />
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          <p className={HELP}>We’ll send an invite link to this address.</p>
          {fieldErrors.email && (
            <p id="email-error" className="mt-1 text-xs text-rose-300">{fieldErrors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div className="mt-4">
          <label className={LABEL} htmlFor="phone">Phone Number</label>
          <div className="relative">
            <input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={`${INPUT} ${fieldErrors.phone ? "ring-rose-400/40" : ""}`}
              placeholder="Optional"
              autoComplete="tel"
              aria-invalid={!!fieldErrors.phone}
              aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
            />
            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          {fieldErrors.phone && (
            <p id="phone-error" className="mt-1 text-xs text-rose-300">{fieldErrors.phone}</p>
          )}
        </div>

        {/* Tips */}
        <div className="mt-4 flex items-start gap-2 text-slate-300/80 text-xs">
          <Info className="w-4 h-4 mt-0.5" />
          <p>Employees can view assignments, log time, and update project status. They’ll receive a verification email to activate access.</p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className={`px-4 py-2 rounded-xl font-semibold ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 disabled:opacity-60`}
            disabled={submitting}
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2"><Loader className="w-4 h-4 animate-spin" /> Creating…</span>
            ) : (
              "Create Employee"
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default EmployeeCreateForm;