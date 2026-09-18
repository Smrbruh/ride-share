import * as React from "react";
import { MapPin, Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { RideSearchResultDto } from "@/types/api";
interface RideCardProps {
  ride: RideSearchResultDto;
  onBook: (ride: RideSearchResultDto) => void;
}
export const RideCard = React.memo(function RideCard({ ride, onBook }: RideCardProps) {
  return (
    <Card className="transition-shadow duration-200 hover:shadow-md">
      <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">{ride.vehicle?.typeName ?? "Standard"}</Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> {formatDate(ride.startTime)}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> {ride.availableSeats} seats left
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 text-accent" />
            <div>
              <p className="font-medium">{ride.pickupLocation.address}</p>
              <p className="text-muted-foreground">to {ride.dropoffLocation.address}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {ride.driver.firstName} {ride.driver.lastName} · {ride.vehicle?.model} · {ride.vehicle?.color} · {ride.distanceKm} km
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <p className="text-2xl font-semibold tracking-tight">{formatCurrency(ride.fareAmount)}</p>
          <Button disabled={ride.availableSeats <= 0} onClick={() => onBook(ride)}>
            {ride.availableSeats <= 0 ? "Full" : "Book"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
