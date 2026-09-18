import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
interface ChartSkeletonProps {
  title?: boolean;
  height?: string;
}
export function ChartSkeleton({ title = true, height = "h-72" }: ChartSkeletonProps) {
  return (
    <Card>
      {title ? (
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
      ) : null}
      <CardContent className={height}>
        <Skeleton className="h-full w-full" />
      </CardContent>
    </Card>
  );
}
