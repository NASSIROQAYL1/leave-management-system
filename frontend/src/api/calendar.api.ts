import { apiClient } from "@/api/axios";
import type { CalendarEvent } from "@/types/domain";

export const calendarApi = {
  team: async (params: { from: string; to: string }) => {
    const { data } = await apiClient.get<CalendarEvent[]>("/api/calendar/team", { params });
    return data;
  },
  my: async (year?: number) => {
    const { data } = await apiClient.get<CalendarEvent[]>("/api/calendar/my", { params: { year } });
    return data;
  },
};
