// src/components/profile/ProfilePicture.tsx
import React, { useState, useRef, useEffect } from "react";
import { Camera, X, Loader2, AlertCircle } from "lucide-react";
import {
  getProfilePicture,
  saveProfilePicture,
  removeProfilePicture,
  fileToBase64,
  validateImageFile,
} from "../../utils/profilePicture";

interface ProfilePictureProps {
  userId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  editable?: boolean;
  onPictureChange?: (imageData: string | null) => void;
}

/** Aesthetic tokens to match the neon/glass UI */
const ACCENT_GRADIENT = "bg-gradient-to-br from-cyan-400 via-sky-400 to-indigo-400";
const RING = "ring-1 ring-white/15";
const MENU_CARD =
  "rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";

const sizeClasses: Record<NonNullable<ProfilePictureProps["size"]>, string> = {
  sm: "w-16 h-16 text-lg",
  md: "w-20 h-20 text-2xl",
  lg: "w-32 h-32 text-4xl",
  xl: "w-40 h-40 text-5xl",
  "2xl": "w-48 h-48 text-6xl",
};

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  userId,
  firstName,
  lastName,
  email,
  size = "md",
  editable = false,
  onPictureChange,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load saved picture on mount
  useEffect(() => {
    const saved = getProfilePicture(userId);
    if (saved) {
      setImageSrc(saved);
      onPictureChange?.(saved);
    }
  }, [userId, onPictureChange]);

  // Close menu on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!openMenu) return;
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [openMenu]);

  const initials = () => {
    const f = firstName?.trim()?.charAt(0) || "";
    const l = lastName?.trim()?.charAt(0) || "";
    const base = (f + l) || email?.charAt(0) || "U";
    return base.toUpperCase();
  };

  const handleClick = () => {
    if (!editable || loading) return;
    // If no image yet, go straight to picker
    if (!imageSrc) fileInputRef.current?.click();
    else setOpenMenu((s) => !s);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file.");
      setLoading(false);
      // reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      saveProfilePicture(userId, base64);
      setImageSrc(base64);
      onPictureChange?.(base64);
      setOpenMenu(false);
    } catch (err) {
      console.error(err);
      setError("Failed to process image. Please try again.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    removeProfilePicture(userId);
    setImageSrc(null);
    onPictureChange?.(null);
    setOpenMenu(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Avatar */}
      <button
        type="button"
        onClick={handleClick}
        aria-label={editable ? "Change profile photo" : "Profile photo"}
        className={[
          "relative rounded-full overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70",
          sizeClasses[size],
          editable ? "cursor-pointer" : "cursor-default",
          RING,
        ].join(" ")}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Profile"
            className="w-full h-full object-cover transition-transform duration-300 group-active:scale-[0.98]"
          />
        ) : (
          <div
            className={[
              "w-full h-full text-white font-bold grid place-items-center select-none",
              ACCENT_GRADIENT,
            ].join(" ")}
          >
            {initials()}
          </div>
        )}

        {/* Hover overlay (editable) */}
        {editable && !loading && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
            <div className="text-center text-white">
              <Camera className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs font-medium">Change Photo</span>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/60 grid place-items-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </button>

      {/* File input (hidden) */}
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      )}

      {/* Mini action button (only when image exists & editable) */}
      {editable && imageSrc && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenu((s) => !s);
          }}
          title="Change profile picture"
          className={[
            "absolute -bottom-1 -right-1 w-8 h-8 rounded-full grid place-items-center",
            "bg-white/10 text-white hover:bg-white/20 transition-colors",
            RING,
          ].join(" ")}
        >
          <Camera className="w-4 h-4" />
        </button>
      )}

      {/* Action menu */}
      {editable && openMenu && (
        <div
          className={[
            "absolute top-full left-0 mt-2 z-50 min-w-[220px] p-3 text-slate-200",
            MENU_CARD,
          ].join(" ")}
          role="menu"
        >
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
                setOpenMenu(false);
              }}
              disabled={loading}
              className={[
                "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl",
                "hover:bg-white/5 transition-colors disabled:opacity-60",
              ].join(" ")}
              role="menuitem"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  Upload New Photo
                </>
              )}
            </button>

            {imageSrc && (
              <button
                type="button"
                onClick={handleRemove}
                className={[
                  "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl",
                  "text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 transition-colors",
                ].join(" ")}
                role="menuitem"
              >
                <X className="w-4 h-4" />
                Remove Photo
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 flex items-start gap-2 text-xs text-rose-300 bg-rose-500/10 rounded-xl px-3 py-2">
              <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="mt-2 text-[11px] text-slate-400">
            Max size: 2MB. Formats: JPG, PNG, GIF, WebP.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfilePicture;