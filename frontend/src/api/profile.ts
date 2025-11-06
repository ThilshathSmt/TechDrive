import api from "./auth";
import { UserDto } from "./auth";
import { getEmployeeDetails, EmployeeDetailDTO } from "./admin";

// ==================== Request DTOs ====================

export interface UpdateCustomerProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string; // Must match pattern: ^0(7[0-9]{8})$
}

// ==================== Response Types ====================

export interface ProfileResponse extends UserDto {
  // Extended from UserDto
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

// ==================== API Functions ====================

/**
 * Get user profile
 * For CUSTOMER: Uses /api/customer/profile (detailed)
 * For EMPLOYEE/ADMIN: Uses /api/auth/me (basic), then tries to get full details via admin endpoint
 * Note: Employees can try to access their own details via admin endpoint (may fail if not allowed)
 */
export const getProfile = async (role: string): Promise<ProfileResponse> => {
  if (role === "CUSTOMER") {
    const res = await api.get<ProfileResponse>("/customer/profile");
    return res.data;
  } else {
    // For employees and admins, use /api/auth/me first
    const basicRes = await api.get<ProfileResponse>("/auth/me");
    const basicData = basicRes.data;
    
    // Try to get full employee details via admin endpoint for both employees and admins
    // This ensures we get firstName/lastName which /api/auth/me doesn't provide
    // If the user doesn't have permission, we'll fall back to basic data
    if (basicData.id && (role === "EMPLOYEE" || role === "ADMIN")) {
      try {
        const fullDetails = await getEmployeeDetails(basicData.id);
        // Merge the full details with basic data
        return {
          ...basicData,
          firstName: fullDetails.firstName,
          lastName: fullDetails.lastName,
          phoneNumber: fullDetails.phoneNumber,
          isActive: fullDetails.isActive,
        };
      } catch (err: any) {
        // If we can't get full details (e.g., permission denied for employees), 
        // we need to work with what we have from /api/auth/me
        // The backend /api/auth/me concatenates firstName + lastName without space in the 'name' field
        // Since we can't reliably parse it, we'll use the name field and try to extract what we can
        
        // Try to use name field if firstName/lastName are missing
        if (!basicData.firstName && !basicData.lastName && basicData.name) {
          // The backend sets name as firstName + lastName (no space), so we can't parse it reliably
          // But we can at least show the name field
          basicData.firstName = basicData.name;
          basicData.lastName = "";
        }
        
        console.warn("Could not fetch full employee details, using basic profile data", err?.response?.status);
      }
    }
    
    return basicData;
  }
};

/**
 * Update customer profile
 * Only available for CUSTOMER role
 */
export const updateCustomerProfile = async (
  data: UpdateCustomerProfileRequest
): Promise<ProfileResponse> => {
  const res = await api.put<ProfileResponse>("/customer/profile", data);
  return res.data;
};

/**
 * Get current user profile (universal endpoint)
 * Works for all roles but returns basic info
 */
export const getCurrentUserProfile = async (): Promise<ProfileResponse> => {
  const res = await api.get<ProfileResponse>("/auth/me");
  return res.data;
};

