// src/api/admin.ts
import api from "./auth";

export interface EmployeeRegisterPayload {
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  // role is optional; server defaults to EMPLOYEE
  role?: "EMPLOYEE";
}

export interface AdminRegisterPayload {
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  // role is optional; server defaults to ADMIN
  role?: "ADMIN";
}

// Create Employee
export const addEmployee = async (payload: EmployeeRegisterPayload) => {
  const res = await api.post("admin/employees", payload);
  return res.data;
};

// Create Admin
export const addAdmin = async (payload: AdminRegisterPayload) => {
  const res = await api.post("admin/admins", payload);
  return res.data;
};

// List employees (AdminController returns simplified DTO with name/email/role)
export const listEmployees = async () => {
  const res = await api.get("admin/employees");
  return Array.isArray(res.data) ? res.data : [];
};


export interface EmployeeLite {
  id: number;         // NEEDS to be present from backend
  name: string;       // "First Last"
  email: string;
  role: "EMPLOYEE" | "ADMIN" | "CUSTOMER";
  phoneNumber?: string;
}

// Employee Detail DTO
export interface EmployeeDetailDTO {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  isPasswordChanged?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  assignedAppointmentsCount?: number;
  assignedProjectsCount?: number;
  completedAppointmentsCount?: number;
  completedProjectsCount?: number;
}

// Update Employee DTO
export interface UpdateEmployeeDTO {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isActive: boolean;
}

// Dashboard Stats Interfaces
export interface DashboardStats {
  userCount: number;
  appointmentCount: number;
  vehicleCount: number;
  totalEarnings: number;
  activeServiceCount: number;
  confirmedAppointments: any[];
  todayAppointments: any[];
}
// A vehicle summary for admin context
export interface AdminCustomerVehicleDTO {
  id?: number;
  registrationNumber?: string;
  make?: string;
  model?: string;
  year?: number | string;
  color?: string;
  vinNumber?: string;
  mileage?: number;
  createdAt?: string;
  updatedAt?: string;
}
// Mirrors (loosely) CustomerWithVehiclesDTO from backend
export interface AdminCustomerWithVehiclesDTO {
  id?: number;
  firstName?: string;
  lastName?: string;
  name?: string; // if backend already concatenates
  email?: string;
  phoneNumber?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  vehicles?: AdminCustomerVehicleDTO[];
}

// Dashboard API Calls
export const getDashboardUserCount = async (): Promise<number> => {
  const res = await api.get("admin/dashboard/user/count");
  return res.data;
};

export const getDashboardAppointmentCount = async (): Promise<number> => {
  const res = await api.get("admin/dashboard/appointment/count");
  return res.data;
};

export const getDashboardVehicleCount = async (): Promise<number> => {
  const res = await api.get("admin/dashboard/vehicle/count");
  return res.data;
};

export const getDashboardTotalEarnings = async (): Promise<number> => {
  const res = await api.get("admin/dashboard/earnings/total");
  return res.data;
};

export const getDashboardActiveServiceCount = async (): Promise<number> => {
  const res = await api.get("admin/dashboard/services/active/count");
  return res.data;
};

export const getDashboardConfirmedAppointments = async (): Promise<any[]> => {
  const res = await api.get("admin/dashboard/appointments/confirmed");
  return Array.isArray(res.data) ? res.data : [];
};

export const getDashboardTodayAppointments = async (): Promise<any[]> => {
  const res = await api.get("admin/dashboard/appointments/today");
  return Array.isArray(res.data) ? res.data : [];
};

// Customer Management Functions
export const listCustomersWithVehicles = async (): Promise<AdminCustomerWithVehiclesDTO[]> => {
  const res = await api.get<AdminCustomerWithVehiclesDTO[]>("admin/customers");
  return Array.isArray(res.data) ? res.data : [];
};

// GET: one customer (by id) with their vehicles
export const getCustomerWithVehicles = async (
  customerId: number
): Promise<AdminCustomerWithVehiclesDTO> => {
  const res = await api.get<AdminCustomerWithVehiclesDTO>(`admin/customers/${customerId}`);
  return res.data;
};

// Get Employee/Admin Details
export const getEmployeeDetails = async (employeeId: number): Promise<EmployeeDetailDTO> => {
  const res = await api.get<EmployeeDetailDTO>(`admin/employees/${employeeId}`);
  return res.data;
};

// Update Employee/Admin Profile
export const updateEmployee = async (
  employeeId: number,
  data: UpdateEmployeeDTO
): Promise<EmployeeDetailDTO> => {
  const res = await api.put<EmployeeDetailDTO>(`admin/employees/${employeeId}`, data);
  return res.data;
};
