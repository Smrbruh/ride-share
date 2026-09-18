"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import { Users, Car, Navigation, Wallet, CreditCard, Star } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";
import { ChartSkeleton } from "@/components/skeletons/chart-skeleton";
import { apiFetch, ApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import type { AnalyticsOverviewDto, AnalyticsRevenueDto, AnalyticsRidesDto } from "@/types/api";
const RevenueChart = dynamic(() => import("@/components/charts/revenue-chart"), { ssr: false, loading: () => <ChartSkeleton title={false} /> });
const RidesChart = dynamic(() => import("@/components/charts/rides-chart"), { ssr: false, loading: () => <ChartSkeleton title={false} /> });
export default function AdminDashboardPage() {
  const [overview, setOverview] = React.useState<AnalyticsOverviewDto | null>(null);
  const [revenue, setRevenue] = React.useState<AnalyticsRevenueDto[] | null>(null);
  const [rides, setRides] = React.useState<AnalyticsRidesDto | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    Promise.all([
      apiFetch<{ overview: AnalyticsOverviewDto }>("/api/admin/analytics/overview"),
      apiFetch<{ revenue: AnalyticsRevenueDto[] }>("/api/admin/analytics/revenue"),
      apiFetch<{ rides: AnalyticsRidesDto }>("/api/admin/analytics/rides")
    ])
      .then(([overviewResult, revenueResult, ridesResult]) => {
        setOverview(overviewResult.overview);
        setRevenue(revenueResult.revenue);
        setRides(ridesResult.rides);
      })
      .catch((fetchError) => setError(fetchError instanceof ApiError ? fetchError.message : "Failed to load dashboard"));
  }, []);
  if (error) return <EmptyState title="Could not load dashboard" description={error} />;
  if (!overview || !revenue || !rides) return <DashboardSkeleton cards={6} />;
  const dailyRides = rides.daily.map((entry) => ({ label: entry.date.slice(5), count: entry.count }));
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Users" value={String(overview.totalUsers)} icon={Users} />
        <StatCard label="Drivers" value={String(overview.totalDrivers)} icon={Car} />
        <StatCard label="Active rides" value={String(overview.activeRides)} icon={Navigation} />
        <StatCard label="Revenue" value={formatCurrency(overview.totalRevenue)} icon={Wallet} />
        <StatCard label="Payments" value={String(overview.totalPayments)} icon={CreditCard} />
        <StatCard label="Avg rating" value={overview.averageRating ? overview.averageRating.toFixed(1) : "—"} icon={Star} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Monthly revenue</CardTitle></CardHeader>
          <CardContent className="h-72">
            <RevenueChart data={revenue} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Rides per day (last 14 days)</CardTitle></CardHeader>
          <CardContent className="h-72">
            <RidesChart data={dailyRides} />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Vehicle distribution</CardTitle></CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {overview.vehicleDistribution.length === 0 ? (
              <EmptyState title="No vehicles yet" />
            ) : (
              overview.vehicleDistribution.map((entry) => (
                <div key={entry.typeName} className="flex items-center justify-between py-2 text-sm">
                  <span>{entry.typeName}</span>
                  <span className="font-medium">{entry.count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Payment methods</CardTitle></CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {overview.paymentMethodDistribution.length === 0 ? (
              <EmptyState title="No payments yet" />
            ) : (
              overview.paymentMethodDistribution.map((entry) => (
                <div key={entry.method} className="flex items-center justify-between py-2 text-sm capitalize">
                  <span>{entry.method}</span>
                  <span className="font-medium">{entry.count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
