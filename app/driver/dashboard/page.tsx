"use client";
import * as React from "react";
import { CalendarDays, Navigation, Wallet, Star, CheckCircle2 } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { apiFetch, ApiError } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { RideDto, DriverEarningsDto } from "@/types/api";
function isToday(date: string) {
  const target = new Date(date);
  const now = new Date();
  return target.toDateString() === now.toDateString();
}
export default function DriverDashboardPage() {
  const [rides, setRides] = React.useState<RideDto[] | null>(null);
  const [earnings, setEarnings] = React.useState<DriverEarningsDto | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    Promise.all([
      apiFetch<{ rides: RideDto[] }>("/api/drivers/me/rides"),
      apiFetch<{ earnings: DriverEarningsDto }>("/api/drivers/me/earnings")
    ])
      .then(([rideResult, earningsResult]) => {
        setRides(rideResult.rides);
        setEarnings(earningsResult.earnings);
      })
      .catch((fetchError) => setError(fetchError instanceof ApiError ? fetchError.message : "Failed to load dashboard"));
  }, []);
  if (error) return <EmptyState title="Could not load dashboard" description={error} />;
  if (!rides || !earnings) {
    return <DashboardSkeleton />;
  }
  const todaysRides = rides.filter((ride) => isToday(ride.startTime));
  const activeRide = rides.find((ride) => ride.status === "in_progress") ?? rides.find((ride) => ride.status === "scheduled" && isToday(ride.startTime));
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard label="Today's rides" value={String(todaysRides.length)} icon={CalendarDays} />
        <StatCard label="Active ride" value={activeRide ? "In progress" : "None"} icon={Navigation} />
        <StatCard label="Completed rides" value={String(earnings.completedRidesCount)} icon={CheckCircle2} />
        <StatCard label="Monthly earnings" value={formatCurrency(earnings.monthlyEarnings)} icon={Wallet} />
        <StatCard label="Average rating" value={earnings.averageRating ? earnings.averageRating.toFixed(1) : "—"} icon={Star} />
      </div>
      <Card>
        <CardHeader><CardTitle>Today&apos;s schedule</CardTitle></CardHeader>
        <CardContent>
          {todaysRides.length === 0 ? (
            <EmptyState title="No rides scheduled for today" />
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {todaysRides.map((ride) => (
                <div key={ride.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{ride.pickupLocation?.address} → {ride.dropoffLocation?.address}</p>
                    <p className="text-muted-foreground">{formatDate(ride.startTime)}</p>
                  </div>
                  <Badge>{ride.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
