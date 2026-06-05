import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/domain";

type AuthStatus = "idle" | "loading" | "authenticated" | "anonymous";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  status: AuthStatus;
  initialized: boolean;
  setStatus: (status: AuthStatus) => void;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  setSession: (session: { accessToken: string; refreshToken: string; user: User }) => void;
  updateAccessToken: (accessToken: string) => void;
  setUser: (user: User | null) => void;
  clearSession: () => void;
  markInitialized: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      status: "idle",
      initialized: false,
      setStatus: (status) => set({ status }),
      setTokens: ({ accessToken, refreshToken }) =>
        set({
          accessToken,
          refreshToken,
          status: "authenticated",
          initialized: true,
        }),
      setSession: ({ accessToken, refreshToken, user }) =>
        set({
          accessToken,
          refreshToken,
          user,
          status: "authenticated",
          initialized: true,
        }),
      updateAccessToken: (accessToken) => set({ accessToken }),
      setUser: (user) => set({ user }),
      clearSession: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          status: "anonymous",
          initialized: true,
        }),
      markInitialized: () => set({ initialized: true }),
    }),
    {
      name: "leave-auth-session",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
);
