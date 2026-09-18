import { Skeleton } from "@/components/ui/skeleton";
interface DashboardSkeletonProps {
  cards?: number;
}
export function DashboardSkeleton({ cards = 4 }: DashboardSkeletonProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: cards }).map((_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}
