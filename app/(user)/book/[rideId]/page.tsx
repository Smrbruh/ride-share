"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { apiFetch, ApiError } from "@/lib/api-client";
import { getVehicleCapacity } from "@/lib/capacity";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/contexts/toast-context";
import type { RideSearchResultDto, BookingDto, PaymentDto } from "@/types/api";
export default function BookRidePage() {
  const params = useParams<{ rideId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const rideId = Number(params.rideId);
  const [ride, setRide] = React.useState<RideSearchResultDto | null>(null);
  const [notFound, setNotFound] = React.useState(false);
  const [seatCount, setSeatCount] = React.useState("1");
  const [promoCode, setPromoCode] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("card");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    const cached = sessionStorage.getItem(`ride-${rideId}`);
    if (cached) setRide(JSON.parse(cached));
    apiFetch<{ rides: RideSearchResultDto[] }>("/api/rides", { auth: false })
      .then((result) => {
        const match = result.rides.find((item) => item.id === rideId);
        if (match) setRide(match);
        else if (!cached) setNotFound(true);
      })
      .catch(() => {
        if (!cached) setNotFound(true);
      });
  }, [rideId]);
  if (notFound) return <EmptyState title="Ride not found" description="This ride may no longer be available" />;
  if (!ride) return <ProfileSkeleton />;
  const capacity = ride.vehicle ? getVehicleCapacity(ride.vehicle.typeName) : 4;
  const perSeatFare = Number(ride.fareAmount) / capacity;
  const estimatedTotal = perSeatFare * Number(seatCount || 1);
  const handleBook = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const result = await apiFetch<{ booking: BookingDto; payment: PaymentDto }>("/api/bookings", {
        method: "POST",
        body: {
          rideId,
          seatCount: Number(seatCount),
          promoCode: promoCode || undefined,
          paymentMethod
        }
      });
      toast({ title: "Booking confirmed", description: `Total charged: ${formatCurrency(result.payment.amount)}`, variant: "success" });
      router.push("/bookings");
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Button variant="ghost" className="w-fit" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /> Back</Button>
      <Card>
        <CardHeader><CardTitle>Confirm your ride</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 text-accent" />
            <div>
              <p className="font-medium">{ride.pickupLocation.address}</p>
              <p className="text-muted-foreground">to {ride.dropoffLocation.address}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-muted-foreground">Driver</p><p className="font-medium">{ride.driver.firstName} {ride.driver.lastName}</p></div>
            <div><p className="text-muted-foreground">Vehicle</p><p className="font-medium">{ride.vehicle?.model} · {ride.vehicle?.color}</p></div>
            <div><p className="text-muted-foreground">Departure</p><p className="font-medium">{formatDate(ride.startTime)}</p></div>
            <div><p className="text-muted-foreground">Distance</p><p className="font-medium">{ride.distanceKm} km</p></div>
          </div>
          {error ? <Alert variant="destructive">{error}</Alert> : null}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="booking-seats">Seats</Label>
              <Input id="booking-seats" type="number" min={1} max={ride.availableSeats} value={seatCount} onChange={(event) => setSeatCount(event.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="booking-payment-method">Payment method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="booking-payment-method"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="booking-promo-code">Promo code (optional)</Label>
            <Input id="booking-promo-code" placeholder="WELCOME10" value={promoCode} onChange={(event) => setPromoCode(event.target.value)} />
            <p className="text-xs text-muted-foreground">Promo codes are validated when you confirm your booking</p>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Estimated total</p>
            <p className="text-2xl font-semibold">{formatCurrency(estimatedTotal)}</p>
          </div>
          <Button size="lg" disabled={submitting || ride.availableSeats <= 0} onClick={handleBook}>
            {submitting ? "Booking..." : "Book seat"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
