import { create } from "zustand";
import { notificationsApi } from "@/api/notifications.api";
import type { Notification } from "@/types/domain";

interface NotificationState {
  items: Notification[];
  unreadCount: number;
  loading: boolean;
  lastFetchedAt?: number;
  fetchLatest: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  unreadCount: 0,
  loading: false,
  fetchLatest: async () => {
    set({ loading: true });
    try {
      const [page, count] = await Promise.all([
        notificationsApi.list({ page: 0, size: 8 }),
        notificationsApi.countUnread(),
      ]);
      set({
        items: page.content,
        unreadCount: count.count,
        lastFetchedAt: Date.now(),
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },
  markRead: async (id) => {
    await notificationsApi.markRead(id);
    set({
      items: get().items.map((item) => (item.id === id ? { ...item, read: true } : item)),
      unreadCount: Math.max(0, get().unreadCount - 1),
    });
  },
  markAllRead: async () => {
    await notificationsApi.markAllRead();
    set({
      items: get().items.map((item) => ({ ...item, read: true })),
      unreadCount: 0,
    });
  },
  reset: () => set({ items: [], unreadCount: 0, loading: false, lastFetchedAt: undefined }),
}));
