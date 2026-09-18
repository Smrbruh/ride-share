import { Skeleton } from "@/components/ui/skeleton";
export function DialogSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-full" />
      <div className="flex justify-end gap-3">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}
