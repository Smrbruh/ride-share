"use client";
import * as React from "react";
import { MapPin, Search as SearchIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { apiFetch, ApiError } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { RideDto } from "@/types/api";
const PAGE_SIZE = 5;
function withinRange(date: string, range: "today" | "week" | "month" | "all") {
  if (range === "all") return true;
  const target = new Date(date);
  const now = new Date();
  if (range === "today") return target.toDateString() === now.toDateString();
  const diffDays = (now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24);
  if (range === "week") return diffDays >= 0 && diffDays <= 7;
  return diffDays >= 0 && diffDays <= 31;
}
function RangeList({ rides, range, search }: { rides: RideDto[]; range: "today" | "week" | "month" | "all"; search: string }) {
  const [page, setPage] = React.useState(1);
  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return rides.filter((ride) => {
      if (!withinRange(ride.startTime, range)) return false;
      if (!term) return true;
      return (
        ride.pickupLocation?.address.toLowerCase().includes(term) ||
        ride.dropoffLocation?.address.toLowerCase().includes(term)
      );
    });
  }, [rides, range, search]);
  React.useEffect(() => { setPage(1); }, [range, search]);
  if (filtered.length === 0) return <EmptyState title="No rides in this range" />;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <div className="flex flex-col gap-4">
      {paged.map((ride) => (
        <Card key={ride.id}>
          <CardContent className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 text-accent" />
              <div>
                <p className="font-medium">{ride.pickupLocation?.address} → {ride.dropoffLocation?.address}</p>
                <p className="text-muted-foreground">{formatDate(ride.startTime)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold">{formatCurrency(ride.fareAmount)}</p>
              <Badge>{ride.status}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
      <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
    </div>
  );
}
export default function DriverHistoryPage() {
  const [rides, setRides] = React.useState<RideDto[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  React.useEffect(() => {
    apiFetch<{ rides: RideDto[] }>("/api/drivers/me/rides")
      .then((result) => setRides(result.rides))
      .catch((fetchError) => setError(fetchError instanceof ApiError ? fetchError.message : "Failed to load ride history"));
  }, []);
  if (error) return <EmptyState title="Could not load ride history" description={error} />;
  if (!rides) return <TableSkeleton />;
  return (
    <div className="flex flex-col gap-6">
      <div className="relative max-w-sm">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by address" aria-label="Search ride history" className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>
      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        <TabsContent value="today"><RangeList rides={rides} range="today" search={search} /></TabsContent>
        <TabsContent value="week"><RangeList rides={rides} range="week" search={search} /></TabsContent>
        <TabsContent value="month"><RangeList rides={rides} range="month" search={search} /></TabsContent>
        <TabsContent value="all"><RangeList rides={rides} range="all" search={search} /></TabsContent>
      </Tabs>
    </div>
  );
}
