import { apiClient } from "@/api/axios";
import type { DashboardStats } from "@/types/domain";

export const dashboardApi = {
  admin: async () => {
    const { data } = await apiClient.get<DashboardStats>("/api/admin/dashboard/stats");
    return data;
  },
  manager: async () => {
    const { data } = await apiClient.get<DashboardStats>("/api/manager/dashboard/stats");
    return data;
  },
  employee: async () => {
    const { data } = await apiClient.get<DashboardStats>("/api/employee/dashboard/stats");
    return data;
  },
};
