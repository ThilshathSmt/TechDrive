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
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Size classes
  const sizeClasses = {
    sm: "w-16 h-16 text-lg",
    md: "w-20 h-20 text-2xl",
    lg: "w-32 h-32 text-4xl",
    xl: "w-40 h-40 text-5xl",
    "2xl": "w-48 h-48 text-6xl",
  };

  // Load profile picture on mount
  useEffect(() => {
    const savedImage = getProfilePicture(userId);
    if (savedImage) {
      setImageSrc(savedImage);
      onPictureChange?.(savedImage);
    }
  }, [userId, onPictureChange]);

  // Generate initials
  const getInitials = () => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || email?.charAt(0).toUpperCase() || "U";
  };

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      setLoading(false);
      return;
    }

    try {
      // Convert to base64
      const base64 = await fileToBase64(file);
      
      // Save to localStorage
      saveProfilePicture(userId, base64);
      
      // Update state
      setImageSrc(base64);
      onPictureChange?.(base64);
      setShowUpload(false);
    } catch (err: any) {
      setError("Failed to process image. Please try again.");
      console.error("Error processing image:", err);
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle remove picture
  const handleRemovePicture = () => {
    removeProfilePicture(userId);
    setImageSrc(null);
    onPictureChange?.(null);
    setShowUpload(false);
  };

  // Handle click to upload
  const handleClick = () => {
    if (editable && !loading) {
      // If no picture exists, directly trigger file input
      // If picture exists, show menu
      if (!imageSrc) {
        fileInputRef.current?.click();
      } else {
        setShowUpload(!showUpload);
      }
    }
  };

  // Close menu when clicking outside
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUpload && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowUpload(false);
      }
    };

    if (showUpload) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUpload]);

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Profile Picture */}
      <div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden ${
          editable ? "cursor-pointer group" : ""
        }`}
        onClick={handleClick}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-400 via-sky-400 to-indigo-400 flex items-center justify-center text-white font-bold">
            {getInitials()}
          </div>
        )}

        {/* Overlay on hover (editable) */}
        {editable && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-6 h-6 text-white mx-auto mb-1" />
              <span className="text-xs text-white font-medium">Change Photo</span>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      )}

      {/* Upload Menu (if editable and clicked) */}
      {editable && showUpload && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 min-w-[200px]">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
                setShowUpload(false);
              }}
              disabled={loading}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
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
                onClick={() => {
                  handleRemovePicture();
                  setShowUpload(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <X className="w-4 h-4" />
                Remove Photo
              </button>
            )}
          </div>
          {error && (
            <div className="mt-2 flex items-start gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Max size: 2MB. Formats: JPG, PNG, GIF, WebP
          </p>
        </div>
      )}

      {/* Edit Icon Badge (editable) - shows when picture exists */}
      {editable && imageSrc && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowUpload(!showUpload);
          }}
          className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 transition-colors z-10"
          title="Change profile picture"
        >
          <Camera className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ProfilePicture;

