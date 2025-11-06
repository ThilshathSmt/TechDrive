// api/appointments.ts
import api from "./auth";

export interface AppointmentRequest {
  vehicleId: number;
  serviceIds: number[];           // array
  scheduledDateTime: string;      // "YYYY-MM-DDTHH:mm:ss"
  customerNotes?: string;
}

export interface AppointmentUpdateRequest {
  vehicleId?: number;
  serviceIds?: number[];
  scheduledDateTime?: string;
  customerNotes?: string;
}

export interface ServiceSummaryDTO {
  id: number;
  serviceName: string;
  basePrice?: number;
  estimatedDurationMinutes?: number;
  category?: string;
}

export interface MyAppointmentDTO {
  id: number;
  scheduledDateTime: string;
  status: string;
  customerNotes?: string;
  finalCost?: number | null;
  services?: ServiceSummaryDTO[];
  vehicle?: {
    id: number;
    make: string;
    model: string;
    year: number;
    registrationNumber?: string;
  };
}

/** Mirrors (subset of) your AppointmentResponseDTO */
export interface AdminAppointmentDTO {
  id: number;
  scheduledDateTime: string;
  status: string;
  customerNotes?: string | null;
  employeeNotes?: string | null;
  finalCost?: number | null;
  progressPercentage?: number | null;

  customerId?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;

  vehicleId?: number;
  vehicleRegistrationNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;

  services?: Array<{
    id: number;
    serviceName: string;
    basePrice?: number;
    estimatedDurationMinutes?: number;
    category?: string;
  }>;

  assignedEmployeeId?: number | null;
  assignedEmployeeName?: string | null;
  assignedEmployeeEmail?: string | null;

  actualStartTime?: string | null;
  actualEndTime?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const bookAppointment = async (payload: AppointmentRequest) => {
  const res = await api.post("customer/appointments", payload);
  return res.data;
};

export const listMyAppointments = async (): Promise<MyAppointmentDTO[]> => {
  const res = await api.get<MyAppointmentDTO[]>("customer/appointments");
  return res.data;
};

export const getMyAppointment = async (id: number) => {
  const res = await api.get<MyAppointmentDTO>(`customer/appointments/${id}`);
  return res.data;
};

// use PATCH for partial
export const updateMyAppointment = async (id: number, payload: AppointmentUpdateRequest) => {
  const res = await api.patch(`customer/appointments/${id}`, payload);
  return res.data;
};

export const cancelMyAppointment = async (id: number) => {
  const res = await api.put(`customer/appointments/${id}/cancel`);
  return res.data;
};

export const deleteMyAppointment = async (id: number) => {
  await api.delete(`customer/appointments/${id}`);
};

/** GET all appointments for admin (you need this endpoint in your backend) */
export const listAllAppointments = async (): Promise<AdminAppointmentDTO[]> => {
  const res = await api.get<AdminAppointmentDTO[]>("admin/appointments");
  const data = res.data;
  return Array.isArray(data) ? data : [];
};

export interface AssignAppointmentPayload {
  employeeId: number;
  adminNotes?: string;
  finalCost?: number;
}

export const assignAppointment = async (
  appointmentId: number,
  payload: AssignAppointmentPayload
) => {
  const res = await api.put(`admin/appointments/${appointmentId}/assign`, payload);
  return res.data;
};

export const reassignAppointment = async (
  appointmentId: number,
  payload: AssignAppointmentPayload
) => {
  const res = await api.put(`admin/appointments/${appointmentId}/reassign`, payload);
  return res.data;
};

export const unassignAppointment = async (appointmentId: number) => {
  const res = await api.delete(`admin/appointments/${appointmentId}/unassign`);
  return res.data;
};