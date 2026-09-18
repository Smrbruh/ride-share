import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
}
export function EmptyState({ icon: Icon, title, description, className, action }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border py-16 text-center", className)}>
      {Icon ? <Icon className="h-8 w-8 text-muted-foreground" /> : null}
      <p className="text-sm font-medium">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}
