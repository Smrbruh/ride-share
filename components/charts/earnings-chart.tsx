"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatCurrency } from "@/lib/utils";
interface EarningsChartProps {
  data: { period: string; amount: number }[];
}
export default function EarningsChart({ data }: EarningsChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="period" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => formatCurrency(value)} fontSize={12} />
        <Tooltip formatter={(value: number | string) => formatCurrency(Number(value))} contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: 12, color: "hsl(var(--card-foreground))" }} />
        <Bar dataKey="amount" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
