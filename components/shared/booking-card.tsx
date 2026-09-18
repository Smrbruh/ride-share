import * as React from "react";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { BookingDto } from "@/types/api";
const STATUS_VARIANT: Record<string, "default" | "accent" | "success" | "warning" | "destructive"> = {
  pending: "warning",
  confirmed: "accent",
  completed: "success",
  cancelled: "destructive"
};
interface BookingCardProps {
  booking: BookingDto;
  onCancel?: (booking: BookingDto) => void;
}
export const BookingCard = React.memo(function BookingCard({ booking, onCancel }: BookingCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={STATUS_VARIANT[booking.status] ?? "default"}>{booking.status}</Badge>
            <span className="text-xs text-muted-foreground">{formatDate(booking.ride.startTime)}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 text-accent" aria-hidden="true" />
            <div>
              <p className="font-medium">{booking.ride.pickupLocation?.address}</p>
              <p className="text-muted-foreground">to {booking.ride.dropoffLocation?.address}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {booking.ride.driver ? `${booking.ride.driver.firstName} ${booking.ride.driver.lastName} · ` : ""}
            {booking.seatCount} seat{booking.seatCount > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="text-xl font-semibold">{booking.payment ? formatCurrency(booking.payment.amount) : "—"}</p>
          {onCancel ? <Button variant="outline" size="sm" onClick={() => onCancel(booking)}>Cancel</Button> : null}
        </div>
      </CardContent>
    </Card>
  );
});
