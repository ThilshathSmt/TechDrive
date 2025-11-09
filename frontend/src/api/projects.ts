// src/api/projects.ts
import api from "./auth";

/** Matches backend ProjectRequestDTO */
export interface ProjectRequest {
  vehicleId: number;
  projectName: string;
  description?: string;
  additionalNotes?: string;
}

/** Matches backend ProjectUpdateRequestDTO */
export interface ProjectUpdateRequest {
  projectName?: string;
  description?: string;
  additionalNotes?: string;
}

/** Matches backend ProjectResponseDTO (subset + useful fields) */
export interface ProjectDTO {
  id: number;
  projectName: string;
  description: string;
  status: string;

  estimatedCost?: number | null;
  actualCost?: number | null;
  estimatedDurationHours?: number | null;

  startDate?: string | null;
  completionDate?: string | null;
  expectedCompletionDate?: string | null;

  progressPercentage?: number | null;

  // vehicle summary (from ProjectResponseDTO)
  vehicleId?: number;
  vehicleRegistrationNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;

  createdAt?: string;
  updatedAt?: string;
}

export const createProject = async (payload: ProjectRequest): Promise<ProjectDTO> => {
  const res = await api.post<ProjectDTO>("customer/projects", payload);
  return res.data;
};

export const listMyProjects = async (): Promise<ProjectDTO[]> => {
  const res = await api.get<ProjectDTO[]>("customer/projects");
  const data = res.data;
  return Array.isArray(data) ? data : [];
};

export const listMyActiveProjects = async (): Promise<ProjectDTO[]> => {
  const res = await api.get<ProjectDTO[]>("customer/projects/active");
  const data = res.data;
  return Array.isArray(data) ? data : [];
};

export const getMyProject = async (id: number): Promise<ProjectDTO> => {
  const res = await api.get<ProjectDTO>(`customer/projects/${id}`);
  return res.data;
};

export const updateMyProject = async (
  id: number,
  payload: ProjectUpdateRequest
): Promise<ProjectDTO> => {
  // PATCH for partial updates
  const res = await api.patch<ProjectDTO>(`customer/projects/${id}`, payload);
  return res.data;
};

export const deleteMyProject = async (id: number): Promise<void> => {
  await api.delete(`customer/projects/${id}`);
};


export type ProjectStatus =
  | "PENDING"
  | "APPROVED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

/** Mirrors fields from AdminServices.convertProjectToResponseDTO */
export interface AdminProjectDTO {
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

  // customer summary
  customerId?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;

  // vehicle summary
  vehicleId?: number;
  vehicleRegistrationNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;

  // assignment
  assignedEmployeeId?: number | null;
  assignedEmployeeName?: string | null;
  assignedEmployeeEmail?: string | null;

  createdAt?: string;
  updatedAt?: string;

  // Time logs information
  timeLogsCount?: number;
  totalTimeLoggedHours?: number;
}

/** Approve + Assign payload (see AdminServices.approveAndAssignProject usage) */
export interface ApproveProjectPayload {
  employeeId: number;
  estimatedCost: number;
  estimatedDurationHours: number;
  expectedCompletionDate?: string; // ISO
  approvalNotes?: string;
}

/** Assign/Reassign payload (AdminServices.assignEmployeeToProject) */
export interface AssignProjectPayload {
  employeeId: number;
  estimatedCost: number;
  estimatedDurationHours: number;
  adminNotes?: string;
}

/** Reject payload (AdminServices.rejectProject) */
export interface RejectProjectPayload {
  rejectionReason: string;
}

/** ---- API calls ---- */

export const listAllProjects = async (): Promise<AdminProjectDTO[]> => {
  const res = await api.get<AdminProjectDTO[]>("admin/projects");
  return Array.isArray(res.data) ? res.data : [];
};

export const listProjectsByStatus = async (
  status: ProjectStatus
): Promise<AdminProjectDTO[]> => {
  const res = await api.get<AdminProjectDTO[]>("admin/projects/filter", {
    params: { status },
  });
  return Array.isArray(res.data) ? res.data : [];
};

export const listPendingProjects = async (): Promise<AdminProjectDTO[]> => {
  const res = await api.get<AdminProjectDTO[]>("admin/projects/pending");
  return Array.isArray(res.data) ? res.data : [];
};

export const approveAndAssignProject = async (
  projectId: number,
  payload: ApproveProjectPayload
): Promise<AdminProjectDTO> => {
  const res = await api.put<AdminProjectDTO>(`admin/projects/${projectId}/approve`, payload);
  return res.data;
};

export const assignProject = async (
  projectId: number,
  payload: AssignProjectPayload
): Promise<AdminProjectDTO> => {
  const res = await api.put<AdminProjectDTO>(`admin/projects/${projectId}/assign`, payload);
  return res.data;
};

export const unassignProject = async (
  projectId: number
): Promise<AdminProjectDTO> => {
  const res = await api.delete<AdminProjectDTO>(`admin/projects/${projectId}/unassign`);
  return res.data;
};

export const rejectProject = async (
  projectId: number,
  payload: RejectProjectPayload
): Promise<AdminProjectDTO> => {
  const res = await api.put<AdminProjectDTO>(`admin/projects/${projectId}/reject`, payload);
  return res.data;
};