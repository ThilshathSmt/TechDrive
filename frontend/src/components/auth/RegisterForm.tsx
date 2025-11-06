import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, RegisterRequest } from "../../api/auth";
import { AlertCircle, CheckCircle2 } from "lucide-react";

// Home accent sweep
const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validate = () => {
    if (!firstName.trim()) return "First name is required.";
    if (!lastName.trim()) return "Last name is required.";
    if (!email.trim()) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email address.";
    if (!phoneNumber.trim()) return "Phone number is required.";
    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number.";
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return "Password must contain at least one special character (@$!%*?&).";
    }
    return null;
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
      const payload: RegisterRequest = {
        firstName,
        lastName,
        phoneNumber,
        email,
        password,
        role: "CUSTOMER",
      };
      const res = await register(payload);
      setSuccess(true);
      // Navigate to login after 2 seconds
      setTimeout(() => {
        navigate("/login", { state: { message: "Registration successful! Please login." } });
      }, 2000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Error registering. Please try again.";
      
      // Check if it's an email already registered error
      if (
        error.response?.status === 400 &&
        (errorMessage.includes("Email already registered") ||
         errorMessage.includes("already exists") ||
         errorMessage.includes("already registered"))
      ) {
        setError("This email is already registered. Please use a different email or try logging in.");
        setEmailError("This email is already registered");
        // Clear email field to encourage user to enter a different one
        setEmail("");
      } else {
        setError(errorMessage);
        setEmailError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* Background: dark gradient + radial highlights + subtle grid (matches Home) */}
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
              <h1 className="text-xl font-semibold">Create your account</h1>
              <p className="text-sm text-slate-400">
                Sign up to get started. (Default role is Customer)
              </p>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span>{error}</span>
                  {error.includes("already registered") && (
                    <div className="mt-2">
                      <Link
                        to="/login"
                        className="text-red-200 hover:text-red-100 underline underline-offset-2"
                      >
                        Click here to login instead
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {success && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-4 flex items-start gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-300"
              >
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Registration successful! Redirecting to login...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                required
              />
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                required
              />

              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(null); // Clear email error when user types
                    setError(null); // Clear general error when user types
                  }}
                  placeholder="Email"
                  className={`w-full rounded-lg border ${
                    emailError
                      ? "border-red-500/50 bg-red-500/5"
                      : "border-white/10 bg-white/5"
                  } px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    emailError ? "focus:ring-red-300" : "focus:ring-cyan-300"
                  }`}
                  required
                  autoComplete="email"
                />
                {emailError && (
                  <p className="mt-1 text-xs text-red-400">{emailError}</p>
                )}
              </div>
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone Number"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                required
              />
              <button
                type="submit"
                disabled={loading || success}
                className={`w-full ${ACCENT_GRADIENT} text-slate-950 font-semibold py-3 rounded-lg shadow-lg shadow-cyan-500/20 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300`}
              >
                {loading ? "Registering..." : success ? "Registered!" : "Register"}
              </button>
            </form>

            <div className="mt-4 text-sm text-slate-400 text-center">
              Already have an account?{' '}
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

export default RegisterForm;