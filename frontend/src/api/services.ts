import api from "./auth";

export interface ServiceItem {
  id?: number;
  serviceName: string;
  category?: string;
  description?: string;
  basePrice?: number;
  estimatedDurationMinutes?: number;
  isActive?: boolean;
}

export interface AdminServiceDTO {
  serviceName: string;
  description?: string;
  basePrice: number;
  estimatedDurationMinutes: number;
  category: string; // must match backend ServiceCategory values
}

// Public/admin view list of services
export const listAllServices = async (): Promise<ServiceItem[]> => {
  const res = await api.get<ServiceItem[]>("/service/view/all");
  return res.data;
};

export const addService = async (payload: AdminServiceDTO): Promise<string> => {
  const res = await api.post<string>("admin/services", payload);
  return res.data;
};

// Admin update a service
export const updateService = async (id: number, payload: AdminServiceDTO): Promise<string> => {
  const res = await api.put<string>(`admin/services/${id}`, payload);
  return res.data;
};

// Admin delete a service
export const deleteService = async (id: number): Promise<string> => {
  const res = await api.delete<string>(`/admin/service/${id}/delete`);
  return res.data;
};

export interface ServiceItem {
  id?: number;
  serviceName: string;
  category?: string;                  // must match your ServiceCategory enum
  description?: string;
  basePrice?: number;
  estimatedDurationMinutes?: number;
  isActive?: boolean;
}

/** Matches your ServiceDTO for admin create */
export interface AdminServiceDTO {
  serviceName: string;
  description?: string;
  basePrice: number;
  estimatedDurationMinutes: number;
  category: string;                   // e.g., MAINTENANCE, REPAIR...
}

/** Create a service (admin) */
export const createService = async (payload: AdminServiceDTO): Promise<string> => {
  const res = await api.post<string>("/admin/services", payload);
  return res.data;
};