import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
interface StatCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  trend?: string;
  className?: string;
}
export function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("transition-shadow duration-200 hover:shadow-md", className)}>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
          {trend ? <p className="mt-1 text-xs text-accent">{trend}</p> : null}
        </div>
        {Icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <Icon className="h-6 w-6" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
