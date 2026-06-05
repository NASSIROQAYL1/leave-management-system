import { apiClient } from "@/api/axios";
import type { ActionResponse } from "@/types/api";
import type { LeaveType } from "@/types/domain";

export const leaveTypesApi = {
  list: async () => {
    const { data } = await apiClient.get<LeaveType[]>("/api/leave-types");
    return data;
  },
  create: async (payload: Record<string, unknown>) => {
    const { data } = await apiClient.post<LeaveType>("/api/admin/leave-types", payload);
    return data;
  },
  update: async (id: number, payload: Record<string, unknown>) => {
    const { data } = await apiClient.put<LeaveType>(`/api/admin/leave-types/${id}`, payload);
    return data;
  },
  remove: async (id: number) => {
    const { data } = await apiClient.delete<ActionResponse>(`/api/admin/leave-types/${id}`);
    return data;
  },
};
