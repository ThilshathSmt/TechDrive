// src/api/employee.ts
import api from "./auth";

/** ---- Shared types (align with your backend enums) ---- */

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "ON_HOLD"
  | "RESCHEDULED";

export type ProjectStatus =
  | "PENDING"
  | "APPROVED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

/** Payload used by employee to update status or leave a note */
export interface EmployeeStatusUpdateDTO {
  status: AppointmentStatus | ProjectStatus;
  notes?: string;
}

/** ---- Appointment DTOs assigned to employee ---- */

export interface AssignedServiceDTO {
  id: number;
  serviceName: string;
  basePrice?: number;
  estimatedDurationMinutes?: number;
  category?: string;
}

export interface AssignedAppointmentDTO {
  id: number;
  scheduledDateTime: string;
  status: AppointmentStatus;
  customerNotes?: string | null;
  employeeNotes?: string | null;
  finalCost?: number | null;
  progressPercentage?: number | null;

  // Customer summary
  customerId?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;

  // Vehicle summary
  vehicleId?: number;
  vehicleRegistrationNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;

  // Services summary
  services?: AssignedServiceDTO[];

  // Timestamps
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** ---- Project DTOs assigned to employee ---- */

export interface AssignedProjectDTO {
  id: number;
  projectName: string;
  description: string;
  status: ProjectStatus;

  estimatedCost?: number | null;
  actualCost?: number | null;
  estimatedDurationHours?: number | null;

  startDate?: string | null;
  completionDate?: string | null;
  expectedCompletionDate?: string | null;

  progressPercentage?: number | null;

  // vehicle summary
  vehicleId?: number;
  vehicleRegistrationNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;

  // customer summary
  customerId?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;

  createdAt?: string;
  updatedAt?: string;
}

/** ---- Time log DTOs ---- */

export interface TimeLogDTO {
  id: number;
  appointmentId?: number | null;
  projectId?: number | null;
  description: string;
  hours: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimeLogRequestDTO {
  appointmentId?: number;
  projectId?: number;
  description: string;
  hours: number;
}

export interface TimeLogUpdateDTO {
  description?: string;
  hours?: number;
}

/** ---- Helpers ---- */

const ensureArray = <T,>(data: unknown): T[] => (Array.isArray(data) ? (data as T[]) : []);

/** =========================
 *  Appointments (Employee)
 *  ========================= */

/** GET: all appointments assigned to the logged-in employee */
export const listAssignedAppointments = async (): Promise<AssignedAppointmentDTO[]> => {
  const res = await api.get<AssignedAppointmentDTO[]>("employee/appointments");
  return ensureArray<AssignedAppointmentDTO>(res.data);
};

/** GET: one assigned appointment by id */
export const getAssignedAppointment = async (id: number): Promise<AssignedAppointmentDTO> => {
  const res = await api.get<AssignedAppointmentDTO>(`employee/appointments/${id}`);
  return res.data;
};

/** PATCH: employee updates appointment status/notes */
export const updateAppointmentStatus = async (
  id: number,
  payload: EmployeeStatusUpdateDTO
): Promise<AssignedAppointmentDTO> => {
  const res = await api.patch<AssignedAppointmentDTO>(`employee/appointments/${id}/status`, payload);
  return res.data;
};

/** =====================
 *  Projects (Employee)
 *  ===================== */

/** GET: projects assigned to employee */
export const listAssignedProjects = async (): Promise<AssignedProjectDTO[]> => {
  const res = await api.get<AssignedProjectDTO[]>("employee/projects");
  return ensureArray<AssignedProjectDTO>(res.data);
};

/** GET: one assigned project */
export const getAssignedProject = async (id: number): Promise<AssignedProjectDTO> => {
  const res = await api.get<AssignedProjectDTO>(`employee/projects/${id}`);
  return res.data;
};

/** PATCH: employee updates project status/notes */
export const updateProjectStatus = async (
  id: number,
  payload: EmployeeStatusUpdateDTO
): Promise<AssignedProjectDTO> => {
  const res = await api.patch<AssignedProjectDTO>(`employee/projects/${id}/status`, payload);
  return res.data;
};

/** ==============
 *  Time Logs
 *  ============== */

/** POST: create a time log (appointment or project) */
export const createTimeLog = async (payload: TimeLogRequestDTO): Promise<TimeLogDTO> => {
  const res = await api.post<TimeLogDTO>("employee/timelogs", payload);
  return res.data;
};

/** GET: my time logs */
export const listMyTimeLogs = async (): Promise<TimeLogDTO[]> => {
  const res = await api.get<TimeLogDTO[]>("employee/timelogs");
  return ensureArray<TimeLogDTO>(res.data);
};

/** PUT: update a time log */
export const updateTimeLog = async (
  id: number,
  payload: TimeLogUpdateDTO
): Promise<TimeLogDTO> => {
  const res = await api.put<TimeLogDTO>(`employee/timelogs/${id}`, payload);
  return res.data;
};

/** DELETE: remove a time log */
export const deleteTimeLog = async (id: number): Promise<void> => {
  await api.delete(`employee/timelogs/${id}`);
};