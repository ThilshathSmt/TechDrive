// api/dashboard.ts
import api from "./auth";
import { MyAppointmentDTO } from "./appointments";

export interface DashboardStats {
  totalAppointments: number;
  activeAppointments: number;
  completedServices: number;
  totalVehicles: number;
  totalSpent: number;
}

export const getMyAppointmentCount = async (): Promise<number> => {
  const res = await api.get<number>("customer/dashboard/appointment/count");
  return res.data;
};

export const getActiveAppointmentCount = async (): Promise<number> => {
  const res = await api.get<number>("customer/dashboard/appointments/active/count");
  return res.data;
};

export const getCompletedServicesCount = async (): Promise<number> => {
  const res = await api.get<number>("customer/dashboard/services/completed/count");
  return res.data;
};

export const getMyVehicleCount = async (): Promise<number> => {
  const res = await api.get<number>("customer/dashboard/vehicles/count");
  return res.data;
};

export const getTotalSpent = async (): Promise<number> => {
  const res = await api.get<number>("customer/dashboard/spent/total");
  return res.data;
};

export const getUpcomingAppointments = async (): Promise<MyAppointmentDTO[]> => {
  const res = await api.get<MyAppointmentDTO[]>("customer/dashboard/appointments/upcoming");
  return res.data;
};

export const getAllDashboardStats = async (): Promise<DashboardStats> => {
  const [totalAppointments, activeAppointments, completedServices, totalVehicles, totalSpent] =
    await Promise.all([
      getMyAppointmentCount(),
      getActiveAppointmentCount(),
      getCompletedServicesCount(),
      getMyVehicleCount(),
      getTotalSpent(),
    ]);

  return {
    totalAppointments,
    activeAppointments,
    completedServices,
    totalVehicles,
    totalSpent,
  };
};
