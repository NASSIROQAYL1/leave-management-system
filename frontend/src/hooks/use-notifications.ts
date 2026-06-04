import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useNotificationStore } from "@/store/notification-store";

export function useNotifications() {
  const authenticated = useAuthStore((state) => state.status === "authenticated");
  const fetchLatest = useNotificationStore((state) => state.fetchLatest);
  const reset = useNotificationStore((state) => state.reset);

  useEffect(() => {
    if (!authenticated) {
      reset();
      return;
    }

    void fetchLatest();
    const interval = window.setInterval(() => {
      void fetchLatest();
    }, 30_000);

    return () => window.clearInterval(interval);
  }, [authenticated, fetchLatest, reset]);
}
