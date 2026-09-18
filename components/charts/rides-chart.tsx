"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
interface RidesChartProps {
  data: { label: string; count: number }[];
}
export default function RidesChart({ data }: RidesChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: 12, color: "hsl(var(--card-foreground))" }} />
        <Bar dataKey="count" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
