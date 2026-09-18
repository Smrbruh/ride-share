"use client";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-context";
const ORDER: Array<"light" | "dark" | "system"> = ["light", "dark", "system"];
const ICONS = { light: Sun, dark: Moon, system: Monitor };
const LABELS = { light: "Light theme", dark: "Dark theme", system: "System theme" };
export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const Icon = ICONS[mode];
  const handleClick = () => {
    const currentIndex = ORDER.indexOf(mode);
    setMode(ORDER[(currentIndex + 1) % ORDER.length]);
  };
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label={`Theme: ${LABELS[mode]}. Click to change`}
      title={LABELS[mode]}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
