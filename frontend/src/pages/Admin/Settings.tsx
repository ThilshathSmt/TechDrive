// src/pages/Admin/Settings.tsx
import React, { useState } from "react";
import { Save, Bell, Globe, Settings as SettingsIcon } from "lucide-react";

const ACCENT_GRADIENT =
  "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const INPUT =
  "mt-1 w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2.5 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 focus:border-transparent";

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: "GearSync",
    email: "admin@gearsync.com",
    notifications: true,
    emailNotifications: true,
  });

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div className="relative text-white min-h-screen">
      {/* Backdrop */}
      <Backdrop />

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${ACCENT_GRADIENT} p-2 rounded-xl text-slate-950 ring-1 ring-white/10`}>
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
              <p className="text-slate-300/90 mt-1">
                Manage system preferences and notifications
              </p>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <section className={`${CARD} p-6 md:p-8`}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-300" />
            General Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) =>
                  setSettings({ ...settings, siteName: e.target.value })
                }
                placeholder="GearSync"
                className={INPUT}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) =>
                  setSettings({ ...settings, email: e.target.value })
                }
                placeholder="admin@gearsync.com"
                className={INPUT}
              />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className={`${CARD} p-6 md:p-8`}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-300" />
            Notifications
          </h2>
          <div className="space-y-6">
            {/* Push */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-100">Push Notifications</p>
                <p className="text-sm text-slate-400">
                  Receive push notifications in the system
                </p>
              </div>
              <ToggleSwitch
                checked={settings.notifications}
                onChange={(checked) =>
                  setSettings({ ...settings, notifications: checked })
                }
              />
            </div>

            {/* Email */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-100">Email Notifications</p>
                <p className="text-sm text-slate-400">
                  Get updates through your registered email
                </p>
              </div>
              <ToggleSwitch
                checked={settings.emailNotifications}
                onChange={(checked) =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className={`${ACCENT_GRADIENT} text-slate-950 rounded-xl px-6 py-3 ring-1 ring-white/10 hover:brightness-110 inline-flex items-center gap-2 font-semibold`}
          >
            <Save className="w-5 h-5" />
            Save Settings
          </button>
        </div>
      </main>
    </div>
  );
};

export default Settings;

/* ----- Reusable Components ----- */
const ToggleSwitch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      className="sr-only peer"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <div className="w-11 h-6 bg-white/10 rounded-full peer-focus:ring-2 peer-focus:ring-cyan-300/70 peer-checked:bg-cyan-500/70 transition-colors">
      <div
        className={`absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white shadow-md transform transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </div>
  </label>
);

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
  </div>
);