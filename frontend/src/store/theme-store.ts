import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeMode } from "@/types/enums";

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedMode: () => "light" | "dark";
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "system",
      setMode: (mode) => set({ mode }),
      resolvedMode: () => {
        const mode = get().mode;
        if (mode !== "system") {
          return mode;
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      },
    }),
    {
      name: "leave-theme-mode",
    },
  ),
);
