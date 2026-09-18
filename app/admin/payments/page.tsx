"use client";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { useAdminCrud } from "@/hooks/use-admin-crud";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PaymentDto } from "@/types/api";
interface AdminPaymentDto extends PaymentDto {
  booking: {
    user: { firstName: string; lastName: string };
    ride: { driver: { firstName: string; lastName: string } };
  };
}
const STATUS_VARIANT: Record<string, "default" | "accent" | "success" | "warning" | "destructive"> = {
  pending: "warning",
  paid: "success",
  failed: "destructive",
  refunded: "accent"
};
export default function AdminPaymentsPage() {
  const { items, total, page, setPage, error, pageSize } = useAdminCrud<AdminPaymentDto>("/api/payments");
  if (error) return <EmptyState title="Could not load payments" description={error} />;
  if (!items) return <TableSkeleton />;
  if (items.length === 0) return <EmptyState title="No payments yet" />;
  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>#{payment.bookingId}</TableCell>
              <TableCell>{payment.booking.user.firstName} {payment.booking.user.lastName}</TableCell>
              <TableCell>{payment.booking.ride.driver.firstName} {payment.booking.ride.driver.lastName}</TableCell>
              <TableCell>{formatCurrency(payment.amount)}</TableCell>
              <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
              <TableCell><Badge variant={STATUS_VARIANT[payment.paymentStatus] ?? "default"}>{payment.paymentStatus}</Badge></TableCell>
              <TableCell>{payment.paymentDate ? formatDate(payment.paymentDate) : "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
    </div>
  );
}
