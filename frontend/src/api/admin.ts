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
