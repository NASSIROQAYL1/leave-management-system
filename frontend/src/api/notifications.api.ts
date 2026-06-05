import { apiClient } from "@/api/axios";
import type { PageResponse } from "@/types/api";
import type { Notification, NotificationCount } from "@/types/domain";

export const notificationsApi = {
  list: async (params?: { unread?: boolean; page?: number; size?: number }) => {
    const { data } = await apiClient.get<PageResponse<Notification>>("/api/notifications", { params });
    return data;
  },
  markRead: async (id: number) => {
    const { data } = await apiClient.put<Notification>(`/api/notifications/${id}/read`);
    return data;
  },
  markAllRead: async () => {
    const { data } = await apiClient.put("/api/notifications/read-all");
    return data;
  },
  countUnread: async () => {
    const { data } = await apiClient.get<NotificationCount>("/api/notifications/count-unread");
    return data;
  },
};
