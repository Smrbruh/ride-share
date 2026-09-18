"use client";
import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { BookingCard } from "@/components/shared/booking-card";
import { BookingCardSkeleton } from "@/components/skeletons/booking-card-skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useToast } from "@/contexts/toast-context";
import type { BookingDto } from "@/types/api";
export default function BookingsPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = React.useState<BookingDto[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = React.useState<BookingDto | null>(null);
  const [cancelling, setCancelling] = React.useState(false);
  const load = React.useCallback(() => {
    apiFetch<{ bookings: BookingDto[] }>("/api/bookings")
      .then((result) => setBookings(result.bookings))
      .catch((fetchError) => setError(fetchError instanceof ApiError ? fetchError.message : "Failed to load bookings"));
  }, []);
  React.useEffect(() => { load(); }, [load]);
  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await apiFetch(`/api/bookings/${cancelTarget.id}/cancel`, { method: "PATCH" });
      toast({ title: "Booking cancelled", variant: "success" });
      setCancelTarget(null);
      load();
    } catch (cancelError) {
      toast({ title: "Could not cancel booking", description: cancelError instanceof ApiError ? cancelError.message : undefined, variant: "destructive" });
    } finally {
      setCancelling(false);
    }
  };
  if (error) return <EmptyState title="Could not load bookings" description={error} />;
  if (!bookings) return <div className="flex flex-col gap-4">{Array.from({ length: 3 }).map((_, index) => <BookingCardSkeleton key={index} />)}</div>;
  const upcoming = bookings.filter((booking) => ["pending", "confirmed"].includes(booking.status) && booking.ride.status !== "completed" && booking.ride.status !== "cancelled");
  const completed = bookings.filter((booking) => booking.ride.status === "completed" || booking.status === "completed");
  const cancelled = bookings.filter((booking) => booking.status === "cancelled" || booking.ride.status === "cancelled");
  const renderList = (list: BookingDto[], allowCancel: boolean) =>
    list.length === 0 ? (
      <EmptyState title="Nothing here yet" />
    ) : (
      <div className="flex flex-col gap-4">
        {list.map((booking) => (
          <BookingCard key={booking.id} booking={booking} onCancel={allowCancel ? setCancelTarget : undefined} />
        ))}
      </div>
    );
  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">{renderList(upcoming, true)}</TabsContent>
        <TabsContent value="completed">{renderList(completed, false)}</TabsContent>
        <TabsContent value="cancelled">{renderList(cancelled, false)}</TabsContent>
      </Tabs>
      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel this booking?"
        description="This will cancel your seat and refund any paid amount."
        confirmLabel="Cancel booking"
        loading={cancelling}
        onConfirm={handleCancel}
      />
    </div>
  );
}
