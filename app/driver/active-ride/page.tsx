"use client";
import * as React from "react";
import { MapPin, Users, Route, DollarSign } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useToast } from "@/contexts/toast-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { RideDto } from "@/types/api";
export default function ActiveRidePage() {
  const { toast } = useToast();
  const [ride, setRide] = React.useState<RideDto | null | undefined>(undefined);
  const [error, setError] = React.useState<string | null>(null);
  const [acting, setActing] = React.useState(false);
  const load = React.useCallback(async () => {
    try {
      const list = await apiFetch<{ rides: RideDto[] }>("/api/drivers/me/rides");
      const candidate = list.rides.find((item) => item.status === "in_progress") ?? list.rides.find((item) => item.status === "scheduled");
      if (!candidate) {
        setRide(null);
        return;
      }
      const detail = await apiFetch<{ ride: RideDto }>(`/api/rides/${candidate.id}`);
      setRide(detail.ride);
    } catch (fetchError) {
      setError(fetchError instanceof ApiError ? fetchError.message : "Failed to load active ride");
    }
  }, []);
  React.useEffect(() => { load(); }, [load]);
  const handleStart = async () => {
    if (!ride) return;
    setActing(true);
    try {
      await apiFetch(`/api/rides/${ride.id}/start`, { method: "PATCH" });
      toast({ title: "Ride started", variant: "success" });
      load();
    } catch (actionError) {
      toast({ title: "Could not start ride", description: actionError instanceof ApiError ? actionError.message : undefined, variant: "destructive" });
    } finally {
      setActing(false);
    }
  };
  const handleFinish = async () => {
    if (!ride) return;
    setActing(true);
    try {
      await apiFetch(`/api/rides/${ride.id}/finish`, { method: "PATCH" });
      toast({ title: "Ride completed", variant: "success" });
      load();
    } catch (actionError) {
      toast({ title: "Could not finish ride", description: actionError instanceof ApiError ? actionError.message : undefined, variant: "destructive" });
    } finally {
      setActing(false);
    }
  };
  if (error) return <EmptyState title="Could not load ride" description={error} />;
  if (ride === undefined) return <ProfileSkeleton />;
  if (ride === null) return <EmptyState title="No active or upcoming ride" description="Your next assigned ride will appear here" />;
  const passengers = ride.bookings ?? [];
  const passengerCount = passengers.reduce((sum, booking) => sum + booking.seatCount, 0);
  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>{ride.status === "in_progress" ? "Ride in progress" : "Upcoming ride"}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 text-accent" />
          <div>
            <p className="font-medium">{ride.pickupLocation?.address}</p>
            <p className="text-muted-foreground">to {ride.dropoffLocation?.address}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground"><Route className="h-4 w-4" /> {ride.distanceKm} km</div>
          <div className="flex items-center gap-2 text-muted-foreground"><DollarSign className="h-4 w-4" /> {formatCurrency(ride.fareAmount)}</div>
        </div>
        <p className="text-sm text-muted-foreground">Scheduled for {formatDate(ride.startTime)}</p>
        <Badge variant="accent" className="w-fit">{ride.status}</Badge>
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> Passengers ({passengerCount})
          </p>
          {passengers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings yet</p>
          ) : (
            <div className="flex flex-col divide-y divide-border rounded-2xl border border-border">
              {passengers.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between px-4 py-2 text-sm">
                  <span>{booking.user.firstName} {booking.user.lastName}</span>
                  <span className="text-muted-foreground">{booking.seatCount} seat{booking.seatCount > 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-3">
        {ride.status === "scheduled" ? <Button disabled={acting} onClick={handleStart}>Start ride</Button> : null}
        {ride.status === "in_progress" ? <Button disabled={acting} onClick={handleFinish}>Finish ride</Button> : null}
      </CardFooter>
    </Card>
  );
}
