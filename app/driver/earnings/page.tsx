"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import { Wallet, CheckCircle2, Star } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";
import { ChartSkeleton } from "@/components/skeletons/chart-skeleton";
import { apiFetch, ApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import type { DriverEarningsDto } from "@/types/api";
const EarningsChart = dynamic(() => import("@/components/charts/earnings-chart"), { ssr: false, loading: () => <ChartSkeleton title={false} /> });
export default function DriverEarningsPage() {
  const [earnings, setEarnings] = React.useState<DriverEarningsDto | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    apiFetch<{ earnings: DriverEarningsDto }>("/api/drivers/me/earnings")
      .then((result) => setEarnings(result.earnings))
      .catch((fetchError) => setError(fetchError instanceof ApiError ? fetchError.message : "Failed to load earnings"));
  }, []);
  if (error) return <EmptyState title="Could not load earnings" description={error} />;
  if (!earnings) return <DashboardSkeleton cards={3} />;
  const chartData = [
    { period: "Today", amount: earnings.dailyEarnings },
    { period: "This week", amount: earnings.weeklyEarnings },
    { period: "This month", amount: earnings.monthlyEarnings }
  ];
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total revenue" value={formatCurrency(earnings.totalEarnings)} icon={Wallet} />
        <StatCard label="Completed rides" value={String(earnings.completedRidesCount)} icon={CheckCircle2} />
        <StatCard label="Average rating" value={earnings.averageRating ? earnings.averageRating.toFixed(1) : "—"} icon={Star} />
      </div>
      <Card>
        <CardHeader><CardTitle>Earnings breakdown</CardTitle></CardHeader>
        <CardContent className="h-80">
          <EarningsChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}
