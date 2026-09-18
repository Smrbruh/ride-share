"use client";
import * as React from "react";
type ThemeMode = "light" | "dark" | "system";
interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
}
const THEME_KEY = "ride_app_theme";
const ThemeContext = React.createContext<ThemeContextValue | null>(null);
function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
}
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = React.useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light");
  React.useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY) as ThemeMode | null;
    const initialMode = stored ?? "system";
    setModeState(initialMode);
    const resolved = initialMode === "system" ? getSystemTheme() : initialMode;
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);
  React.useEffect(() => {
    if (mode !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [mode]);
  const setMode = React.useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
    window.localStorage.setItem(THEME_KEY, nextMode);
    const resolved = nextMode === "system" ? getSystemTheme() : nextMode;
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);
  return <ThemeContext.Provider value={{ mode, resolvedTheme, setMode }}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
