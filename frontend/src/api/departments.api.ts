import { apiClient } from "@/api/axios";
import type { ActionResponse } from "@/types/api";
import type { Department } from "@/types/domain";

export const departmentsApi = {
  list: async () => {
    const { data } = await apiClient.get<Department[]>("/api/admin/departments");
    return data;
  },
  create: async (payload: Record<string, unknown>) => {
    const { data } = await apiClient.post<Department>("/api/admin/departments", payload);
    return data;
  },
  update: async (id: number, payload: Record<string, unknown>) => {
    const { data } = await apiClient.put<Department>(`/api/admin/departments/${id}`, payload);
    return data;
  },
  remove: async (id: number) => {
    const { data } = await apiClient.delete<ActionResponse>(`/api/admin/departments/${id}`);
    return data;
  },
};
