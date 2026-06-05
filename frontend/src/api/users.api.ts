import { apiClient } from "@/api/axios";
import type { ActionResponse, PageResponse } from "@/types/api";
import type { LeaveRequest, User } from "@/types/domain";
import type { Role } from "@/types/enums";

export interface UserListParams {
  page?: number;
  size?: number;
  search?: string;
  dept?: number;
  role?: Role;
}

export const usersApi = {
  list: async (params: UserListParams) => {
    const { data } = await apiClient.get<PageResponse<User>>("/api/admin/users", { params });
    return data;
  },
  getById: async (id: number) => {
    const { data } = await apiClient.get<User>(`/api/admin/users/${id}`);
    return data;
  },
  create: async (payload: Record<string, unknown>) => {
    const { data } = await apiClient.post<User>("/api/admin/users", payload);
    return data;
  },
  update: async (id: number, payload: Record<string, unknown>) => {
    const { data } = await apiClient.put<User>(`/api/admin/users/${id}`, payload);
    return data;
  },
  remove: async (id: number) => {
    const { data } = await apiClient.delete<ActionResponse>(`/api/admin/users/${id}`);
    return data;
  },
  changeRole: async (id: number, role: Role) => {
    const { data } = await apiClient.put<User>(`/api/admin/users/${id}/role`, { role });
    return data;
  },
  resetPassword: async (id: number, newPassword: string) => {
    const { data } = await apiClient.put<ActionResponse>(`/api/admin/users/${id}/reset-password`, { newPassword });
    return data;
  },
  leaveHistory: async (id: number) => {
    const { data } = await apiClient.get<LeaveRequest[]>(`/api/admin/users/${id}/leave-history`);
    return data;
  },
};
