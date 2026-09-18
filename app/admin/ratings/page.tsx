"use client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { StarRating } from "@/components/shared/star-rating";
import { useAdminCrud } from "@/hooks/use-admin-crud";
import type { RatingDto } from "@/types/api";
interface AdminRatingDto extends RatingDto {
  booking: {
    rideId: number;
    user: { firstName: string; lastName: string };
    ride: { driver: { firstName: string; lastName: string } };
  };
}
export default function AdminRatingsPage() {
  const { items, total, page, setPage, error, pageSize } = useAdminCrud<AdminRatingDto>("/api/ratings");
  if (error) return <EmptyState title="Could not load ratings" description={error} />;
  if (!items) return <TableSkeleton />;
  if (items.length === 0) return <EmptyState title="No ratings yet" />;
  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Stars</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>Ride</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((rating) => (
            <TableRow key={rating.id}>
              <TableCell>{rating.booking.user.firstName} {rating.booking.user.lastName}</TableCell>
              <TableCell>{rating.booking.ride.driver.firstName} {rating.booking.ride.driver.lastName}</TableCell>
              <TableCell><StarRating value={rating.ratingValue} readOnly /></TableCell>
              <TableCell className="max-w-xs truncate">{rating.comment ?? "—"}</TableCell>
              <TableCell>#{rating.booking.rideId}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
    </div>
  );
}
