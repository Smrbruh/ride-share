"use client";
import { X, CheckCircle2, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { useToast } from "@/contexts/toast-context";
import { cn } from "@/lib/utils";
const ICONS = {
  success: CheckCircle2,
  destructive: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  default: Info
};
export function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div aria-live="polite" aria-atomic="true" className="fixed bottom-6 right-6 z-[100] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((item) => {
        const Icon = ICONS[item.variant ?? "default"];
        return (
          <div
            key={item.id}
            role={item.variant === "destructive" ? "alert" : "status"}
            className={cn(
              "flex items-start gap-3 rounded-2xl border p-4 shadow-lg animate-slide-up",
              item.variant === "destructive" && "border-destructive/30 bg-destructive text-destructive-foreground",
              item.variant === "success" && "border-success/30 bg-success text-success-foreground",
              item.variant === "warning" && "border-warning/30 bg-warning text-warning-foreground",
              item.variant === "info" && "border-border bg-background text-foreground",
              (!item.variant || item.variant === "default") && "border-border bg-background text-foreground"
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{item.title}</p>
              {item.description ? <p className="mt-1 text-xs opacity-90">{item.description}</p> : null}
            </div>
            <button aria-label="Dismiss notification" onClick={() => dismiss(item.id)} className="opacity-70 transition-opacity hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
