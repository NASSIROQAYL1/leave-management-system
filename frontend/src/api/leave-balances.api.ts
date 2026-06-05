import { apiClient } from "@/api/axios";
import type { LeaveBalance } from "@/types/domain";
import type { LeaveBalanceInitializationResponse } from "@/types/domain";

export const leaveBalancesApi = {
  list: async (params?: { year?: number }) => {
    const { data } = await apiClient.get<LeaveBalance[]>("/api/admin/balances", { params });
    return data;
  },
  initializeYear: async (payload: { year: number }) => {
    const { data } = await apiClient.post<LeaveBalanceInitializationResponse>("/api/admin/balances/initialize-year", payload);
    return data;
  },
  adjust: async (id: number, payload: Record<string, unknown>) => {
    const { data } = await apiClient.put<LeaveBalance>(`/api/admin/balances/${id}`, payload);
    return data;
  },
  my: async (year?: number) => {
    const { data } = await apiClient.get<LeaveBalance[]>("/api/admin/balances/my", { params: { year } });
    return data;
  },
};
