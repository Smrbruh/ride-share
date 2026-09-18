"use client";
import { LayoutDashboard, Users, Car, Truck, Tag, MapPin, Route, Ticket, CreditCard, Star } from "lucide-react";
import { AppShell, type NavItem } from "@/components/shared/app-shell";
import { useRequireRole } from "@/hooks/use-require-role";
const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Drivers", href: "/admin/drivers", icon: Car },
  { label: "Vehicles", href: "/admin/vehicles", icon: Truck },
  { label: "Vehicle Types", href: "/admin/vehicle-types", icon: Tag },
  { label: "Locations", href: "/admin/locations", icon: MapPin },
  { label: "Rides", href: "/admin/rides", icon: Route },
  { label: "Promo Codes", href: "/admin/promo-codes", icon: Ticket },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Ratings", href: "/admin/ratings", icon: Star }
];
export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  const { ready, session } = useRequireRole("admin");
  if (!ready || !session) return null;
  return (
    <AppShell navItems={NAV_ITEMS} roleLabel="Admin console">
      {children}
    </AppShell>
  );
}
