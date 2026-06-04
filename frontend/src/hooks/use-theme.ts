import { useEffect } from "react";
import { useThemeStore } from "@/store/theme-store";

export function useTheme() {
  const { mode, resolvedMode, setMode } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedMode());
  }, [mode, resolvedMode]);

  return {
    mode,
    setMode,
    resolvedMode: resolvedMode(),
  };
}
