/**
 * Profile Picture Storage Utility
 * Stores profile pictures in localStorage as base64 strings
 * Key format: profile_picture_{userId}
 */

const STORAGE_PREFIX = "profile_picture_";

/**
 * Save profile picture to localStorage
 */
export const saveProfilePicture = (userId: number, imageData: string): void => {
  try {
    const key = `${STORAGE_PREFIX}${userId}`;
    localStorage.setItem(key, imageData);
  } catch (error) {
    console.error("Failed to save profile picture:", error);
    // localStorage might be full, try to clear old images
    clearOldProfilePictures();
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${userId}`, imageData);
    } catch (retryError) {
      console.error("Failed to save profile picture after cleanup:", retryError);
    }
  }
};

/**
 * Get profile picture from localStorage
 */
export const getProfilePicture = (userId: number): string | null => {
  try {
    const key = `${STORAGE_PREFIX}${userId}`;
    return localStorage.getItem(key);
  } catch (error) {
    console.error("Failed to get profile picture:", error);
    return null;
  }
};

/**
 * Remove profile picture from localStorage
 */
export const removeProfilePicture = (userId: number): void => {
  try {
    const key = `${STORAGE_PREFIX}${userId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to remove profile picture:", error);
  }
};

/**
 * Convert file to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.",
    };
  }

  // Check file size (max 2MB)
  const maxSize = 2 * 1024 * 1024; // 2MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File size too large. Please upload an image smaller than 2MB.",
    };
  }

  return { valid: true };
};

/**
 * Clear old profile pictures (keep only last 10)
 */
const clearOldProfilePictures = (): void => {
  try {
    const keys: { key: string; timestamp: number }[] = [];
    
    // Get all profile picture keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        // Try to get timestamp from the data or use current time
        keys.push({ key, timestamp: Date.now() });
      }
    }

    // If more than 10, remove oldest ones
    if (keys.length > 10) {
      keys.sort((a, b) => a.timestamp - b.timestamp);
      const toRemove = keys.slice(0, keys.length - 10);
      toRemove.forEach(({ key }) => localStorage.removeItem(key));
    }
  } catch (error) {
    console.error("Failed to clear old profile pictures:", error);
  }
};

