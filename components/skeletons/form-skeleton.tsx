import { Skeleton } from "@/components/ui/skeleton";
interface FormSkeletonProps {
  fields?: number;
}
export function FormSkeleton({ fields = 4 }: FormSkeletonProps) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-full" />
        </div>
      ))}
      <Skeleton className="mt-2 h-11 w-32" />
    </div>
  );
}
