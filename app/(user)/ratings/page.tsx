"use client";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BookingCardSkeleton } from "@/components/skeletons/booking-card-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { StarRating } from "@/components/shared/star-rating";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useToast } from "@/contexts/toast-context";
import { formatDate } from "@/lib/utils";
import type { BookingDto, RatingDto } from "@/types/api";
function RatingForm({ booking, onSubmitted }: { booking: BookingDto; onSubmitted: () => void }) {
  const { toast } = useToast();
  const [stars, setStars] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const submit = async () => {
    if (stars === 0) {
      toast({ title: "Select a star rating first", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch<{ rating: RatingDto }>("/api/ratings", { method: "POST", body: { bookingId: booking.id, ratingValue: stars, comment: comment || undefined } });
      toast({ title: "Thanks for your feedback", variant: "success" });
      onSubmitted();
    } catch (submitError) {
      toast({ title: "Could not submit rating", description: submitError instanceof ApiError ? submitError.message : undefined, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Card>
      <CardHeader><CardTitle>{booking.ride.pickupLocation?.address} → {booking.ride.dropoffLocation?.address}</CardTitle></CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-xs text-muted-foreground">{formatDate(booking.ride.startTime)}</p>
        <StarRating value={stars} onChange={setStars} />
        <Textarea placeholder="How was your ride?" value={comment} onChange={(event) => setComment(event.target.value)} />
        <Button className="w-fit" onClick={submit} disabled={submitting}>{submitting ? "Submitting..." : "Submit rating"}</Button>
      </CardContent>
    </Card>
  );
}
export default function RatingsPage() {
  const [bookings, setBookings] = React.useState<BookingDto[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const load = React.useCallback(() => {
    apiFetch<{ bookings: BookingDto[] }>("/api/bookings")
      .then((result) => setBookings(result.bookings))
      .catch((fetchError) => setError(fetchError instanceof ApiError ? fetchError.message : "Failed to load ratings"));
  }, []);
  React.useEffect(() => { load(); }, [load]);
  if (error) return <EmptyState title="Could not load ratings" description={error} />;
  if (!bookings) return <BookingCardSkeleton />;
  const completed = bookings.filter((booking) => booking.ride.status === "completed");
  const pendingRating = completed.filter((booking) => !booking.rating);
  const rated = completed.filter((booking) => booking.rating);
  if (completed.length === 0) return <EmptyState title="No completed rides yet" description="You can rate a ride once it's completed" />;
  return (
    <div className="flex flex-col gap-6">
      {pendingRating.length > 0 ? (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Awaiting your rating</h2>
          {pendingRating.map((booking) => <RatingForm key={booking.id} booking={booking} onSubmitted={load} />)}
        </div>
      ) : null}
      {rated.length > 0 ? (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Your ratings</h2>
          {rated.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="flex flex-col gap-2 p-6">
                <p className="font-medium">{booking.ride.pickupLocation?.address} → {booking.ride.dropoffLocation?.address}</p>
                <StarRating value={booking.rating?.ratingValue ?? 0} readOnly />
                {booking.rating?.comment ? <p className="text-sm text-muted-foreground">{booking.rating.comment}</p> : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
