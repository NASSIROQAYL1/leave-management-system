import { useCallback } from "react";
import { toast } from "sonner";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/store/auth-store";
import type { LoginRequest } from "@/types/auth";

export function useAuth() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const initialized = useAuthStore((state) => state.initialized);
  const setStatus = useAuthStore((state) => state.setStatus);
  const setTokens = useAuthStore((state) => state.setTokens);
  const setSession = useAuthStore((state) => state.setSession);
  const updateAccessToken = useAuthStore((state) => state.updateAccessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);
  const markInitialized = useAuthStore((state) => state.markInitialized);

  const bootstrap = useCallback(async () => {
    if (initialized) {
      return;
    }

    if (!refreshToken && !accessToken) {
      clearSession();
      return;
    }

    setStatus("loading");
    try {
      if (!accessToken && refreshToken) {
        const refreshed = await authApi.refresh(refreshToken);
        updateAccessToken(refreshed.accessToken);
      }
      const profile = await authApi.me();
      setUser(profile);
      setStatus("authenticated");
      markInitialized();
    } catch {
      clearSession();
    }
  }, [
    accessToken,
    clearSession,
    initialized,
    markInitialized,
    refreshToken,
    setStatus,
    setUser,
    updateAccessToken,
  ]);

  const login = useCallback(
    async (payload: LoginRequest) => {
      setStatus("loading");
      try {
        const response = await authApi.login(payload);
        setTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
        const profile = await authApi.me();
        setUser(profile);
        toast.success(`Welcome back, ${profile.fullName}`);
        return profile;
      } catch (error) {
        clearSession();
        throw error;
      }
    },
    [clearSession, setStatus, setTokens, setUser],
  );

  const logout = useCallback(async () => {
    try {
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    } finally {
      clearSession();
      toast.success("You have been signed out.");
    }
  }, [clearSession, refreshToken]);

  return {
    accessToken,
    refreshToken,
    user,
    status,
    initialized,
    bootstrap,
    login,
    logout,
  };
}
