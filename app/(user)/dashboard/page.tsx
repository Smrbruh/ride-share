"use client";
import * as React from "react";
import Link from "next/link";
import { Ticket, CheckCircle2, Wallet, Sparkles } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { BookingDto } from "@/types/api";
export default function UserDashboardPage() {
  const [bookings, setBookings] = React.useState<BookingDto[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    apiFetch<{ bookings: BookingDto[] }>("/api/bookings")
      .then((result) => setBookings(result.bookings))
      .catch((fetchError) => setError(fetchError instanceof ApiError ? fetchError.message : "Failed to load dashboard"));
  }, []);
  if (error) return <EmptyState title="Could not load dashboard" description={error} />;
  if (!bookings) return <DashboardSkeleton />;
  const activeBooking = bookings.find((booking) => ["pending", "confirmed"].includes(booking.status) && ["scheduled", "in_progress"].includes(booking.ride.status));
  const completedCount = bookings.filter((booking) => booking.ride.status === "completed").length;
  const totalSpent = bookings.reduce((sum, booking) => sum + (booking.payment?.paymentStatus === "paid" ? Number(booking.payment.amount) : 0), 0);
  const recent = [...bookings].sort((a, b) => new Date(b.bookingTime).getTime() - new Date(a.bookingTime).getTime()).slice(0, 5);
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Active booking" value={activeBooking ? "1 in progress" : "None"} icon={Ticket} />
        <StatCard label="Completed rides" value={String(completedCount)} icon={CheckCircle2} />
        <StatCard label="Total spent" value={formatCurrency(totalSpent)} icon={Wallet} />
        <StatCard label="Saved with promo" value="Not tracked" icon={Sparkles} />
      </div>
      {activeBooking ? (
        <Card>
          <CardHeader><CardTitle>Active booking</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p className="font-medium">{activeBooking.ride.pickupLocation?.address} → {activeBooking.ride.dropoffLocation?.address}</p>
            <p className="text-muted-foreground">{formatDate(activeBooking.ride.startTime)} · {activeBooking.seatCount} seat(s)</p>
            <Badge variant="accent" className="w-fit">{activeBooking.status}</Badge>
          </CardContent>
        </Card>
      ) : null}
      <Card>
        <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <EmptyState title="No bookings yet" description="Search for a ride to get started" action={<Link href="/search"><Button>Search rides</Button></Link>} />
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {recent.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{booking.ride.pickupLocation?.address} → {booking.ride.dropoffLocation?.address}</p>
                    <p className="text-muted-foreground">{formatDate(booking.bookingTime)}</p>
                  </div>
                  <Badge>{booking.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
