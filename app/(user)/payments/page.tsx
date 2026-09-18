"use client";
import * as React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { apiFetch, ApiError } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { BookingDto } from "@/types/api";
const STATUS_VARIANT: Record<string, "default" | "accent" | "success" | "warning" | "destructive"> = {
  pending: "warning",
  paid: "success",
  failed: "destructive",
  refunded: "accent"
};
export default function PaymentsPage() {
  const [bookings, setBookings] = React.useState<BookingDto[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    apiFetch<{ bookings: BookingDto[] }>("/api/bookings")
      .then((result) => setBookings(result.bookings))
      .catch((fetchError) => setError(fetchError instanceof ApiError ? fetchError.message : "Failed to load payments"));
  }, []);
  if (error) return <EmptyState title="Could not load payments" description={error} />;
  if (!bookings) return <TableSkeleton />;
  const payments = bookings.filter((booking) => booking.payment);
  if (payments.length === 0) return <EmptyState title="No payments yet" description="Your payment history will appear here after your first booking" />;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Route</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell>{booking.ride.pickupLocation?.address} → {booking.ride.dropoffLocation?.address}</TableCell>
            <TableCell className="capitalize">{booking.payment?.paymentMethod}</TableCell>
            <TableCell>{formatCurrency(booking.payment?.amount ?? 0)}</TableCell>
            <TableCell><Badge variant={STATUS_VARIANT[booking.payment?.paymentStatus ?? ""] ?? "default"}>{booking.payment?.paymentStatus}</Badge></TableCell>
            <TableCell>{booking.payment?.paymentDate ? formatDate(booking.payment.paymentDate) : "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
