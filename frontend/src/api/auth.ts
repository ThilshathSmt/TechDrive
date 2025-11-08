declare global {
  interface ImportMeta {
    env: {
      REACT_APP_BACKEND_URL?: string;
      REACT_APP_CHATBOT_URL?: string;
    };
  }
}
import axios from "axios";

// Vite-compatible access to env
const API_URL =
  import.meta.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

console.log("Frontend connected to API base:", API_URL);

const api = axios.create({
  baseURL: `${API_URL}/api`,
});


// Attach token automatically for authenticated requests
// Exclude public auth endpoints that don't need authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const url = config.url || "";
  
  // List of public endpoints that should NOT have Authorization header
  const publicEndpoints = [
    "/auth/register",
    "/auth/login",
    "/auth/forgot-password",
    "/auth/verify-otp",
    "/auth/reset-password",
    "/auth/test",
  ];
  
  // Only add Authorization header if:
  // 1. Token exists
  // 2. The endpoint is NOT a public endpoint
  if (token && !publicEndpoints.some(endpoint => url.includes(endpoint))) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Response interceptor to handle token refresh on 401 and 403 for public endpoints
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url = error.config?.url || "";
    const status = error.response?.status;
    
    if (status === 401) {
      // Token expired or invalid - clear auth and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("isFirstLogin");
      // Only redirect if not already on login/register pages
      if (!window.location.pathname.includes("/login") && 
          !window.location.pathname.includes("/register")) {
        window.location.href = "/login";
      }
    } else if (status === 403) {
      // For public auth endpoints, clear any invalid token
      const publicEndpoints = [
        "/auth/register",
        "/auth/login",
        "/auth/forgot-password",
        "/auth/verify-otp",
        "/auth/reset-password",
      ];
      
      if (publicEndpoints.some(endpoint => url.includes(endpoint))) {
        // Clear invalid token that might be causing 403 on public endpoints
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("isFirstLogin");
        console.warn("403 error on public endpoint - cleared invalid token");
      }
    }
    
    return Promise.reject(error);
  }
);

// ==================== Request DTOs ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  role?: "CUSTOMER" | "EMPLOYEE" | "ADMIN";
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string; // 6 digits
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

// ==================== Response DTOs ====================

export interface LoginResponse {
  token: string;
  role: "CUSTOMER" | "EMPLOYEE" | "ADMIN";
  isFirstLogin: boolean;
}

export interface UserDto {
  id: number;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumber: string;
  role: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface RefreshTokenResponse {
  token: string;
}

export interface LogoutResponse {
  message: string;
}

export interface VerifyOtpResponse {
  resetToken: string;
  message: string;
  expiresInMinutes: number;
}

export interface ApiResponse {
  message: string;
  success: boolean;
  email?: string;
}

// ==================== API Functions ====================

/**
 * Test endpoint to verify AuthController is working
 */
export const testAuth = async (): Promise<string> => {
  const res = await api.get<string>("/auth/test");
  return res.data;
};

/**
 * Register a new user
 */
export const register = async (data: RegisterRequest) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

/**
 * Login with email and password
 * Returns token, role, and isFirstLogin flag
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>("/auth/login", data);
  return res.data;
};

/**
 * Get current authenticated user information
 * Requires authentication
 */
export const getCurrentUser = async (): Promise<UserDto> => {
  const res = await api.get<UserDto>("/auth/me");
  return res.data;
};

/**
 * Refresh JWT token
 * Requires authentication
 */
export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  const res = await api.post<RefreshTokenResponse>("/auth/refresh", {});
  return res.data;
};

/**
 * Logout (clears session on server if needed)
 */
export const logout = async (): Promise<LogoutResponse> => {
  const res = await api.post<LogoutResponse>("/auth/logout", {});
  return res.data;
};

/**
 * Change password for authenticated user
 * Requires authentication
 */
export const changePassword = async (
  data: ChangePasswordRequest
): Promise<ApiResponse> => {
  const res = await api.post<ApiResponse>("/auth/change-password", data);
  return res.data;
};

/**
 * Initiate forgot password flow - sends OTP to email
 */
export const forgotPassword = async (
  data: ForgotPasswordRequest
): Promise<ApiResponse> => {
  const res = await api.post<ApiResponse>("/auth/forgot-password", data);
  return res.data;
};

/**
 * Verify OTP sent to email
 * Returns reset token for password reset
 */
export const verifyOtp = async (
  data: VerifyOtpRequest
): Promise<VerifyOtpResponse> => {
  const res = await api.post<VerifyOtpResponse>("/auth/verify-otp", data);
  return res.data;
};

/**
 * Reset password using reset token from OTP verification
 */
export const resetPassword = async (
  data: ResetPasswordRequest
): Promise<ApiResponse> => {
  const res = await api.post<ApiResponse>("/auth/reset-password", data);
  return res.data;
};

export default api;