import { apiClient } from "@/api/axios";
import type { ActionResponse } from "@/types/api";
import type { PublicHoliday } from "@/types/domain";

export const publicHolidaysApi = {
  list: async (year?: number) => {
    const { data } = await apiClient.get<PublicHoliday[]>("/api/public-holidays", { params: { year } });
    return data;
  },
  create: async (payload: Record<string, unknown>) => {
    const { data } = await apiClient.post<PublicHoliday>("/api/public-holidays", payload);
    return data;
  },
  remove: async (id: number) => {
    const { data } = await apiClient.delete<ActionResponse>(`/api/public-holidays/${id}`);
    return data;
  },
};
