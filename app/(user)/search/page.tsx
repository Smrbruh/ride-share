"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { RideCard } from "@/components/shared/ride-card";
import { RideCardSkeleton } from "@/components/skeletons/ride-card-skeleton";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { LocationDto, RideSearchResultDto } from "@/types/api";
export default function SearchRidesPage() {
  const router = useRouter();
  const [cities, setCities] = React.useState<string[]>([]);
  const [city, setCity] = React.useState<string>("");
  const [date, setDate] = React.useState<string>("");
  const [minSeats, setMinSeats] = React.useState<string>("1");
  const [rides, setRides] = React.useState<RideSearchResultDto[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    apiFetch<{ items: LocationDto[] }>("/api/locations?pageSize=100", { auth: false })
      .then((result) => setCities(Array.from(new Set(result.items.map((location) => location.city)))))
      .catch(() => setCities([]));
  }, []);
  const runSearch = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (city) params.set("city", city);
      if (date) params.set("date", date);
      if (minSeats) params.set("minSeats", minSeats);
      const result = await apiFetch<{ rides: RideSearchResultDto[] }>(`/api/rides?${params.toString()}`, { auth: false });
      setRides(result.rides);
    } catch (searchError) {
      setError(searchError instanceof ApiError ? searchError.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, [city, date, minSeats]);
  React.useEffect(() => {
    runSearch();
  }, [runSearch]);
  const handleBook = React.useCallback((ride: RideSearchResultDto) => {
    sessionStorage.setItem(`ride-${ride.id}`, JSON.stringify(ride));
    router.push(`/book/${ride.id}`);
  }, [router]);
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="search-city">Pickup city</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger id="search-city"><SelectValue placeholder="Any city" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any city</SelectItem>
                {cities.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="search-date">Date</Label>
            <Input id="search-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="search-passengers">Passengers</Label>
            <Input id="search-passengers" type="number" min={1} value={minSeats} onChange={(event) => setMinSeats(event.target.value)} />
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={runSearch} disabled={loading}>
              <SearchIcon className="h-4 w-4" /> {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>
      {error ? <EmptyState title="Search failed" description={error} /> : null}
      {!rides && !error ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => <RideCardSkeleton key={index} />)}
        </div>
      ) : null}
      {rides && rides.length === 0 ? <EmptyState title="No rides found" description="Try a different city, date, or passenger count" /> : null}
      {rides && rides.length > 0 ? (
        <div className="flex flex-col gap-4">
          {rides.map((ride) => (
            <RideCard key={ride.id} ride={ride} onBook={handleBook} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
