"use client";
import { LayoutDashboard, Search, Ticket, CreditCard, Star, User } from "lucide-react";
import { AppShell, type NavItem } from "@/components/shared/app-shell";
import { useRequireRole } from "@/hooks/use-require-role";
const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Search Rides", href: "/search", icon: Search },
  { label: "My Bookings", href: "/bookings", icon: Ticket },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Ratings", href: "/ratings", icon: Star },
  { label: "Profile", href: "/profile", icon: User }
];
export default function UserGroupLayout({ children }: { children: React.ReactNode }) {
  const { ready, session } = useRequireRole("user");
  if (!ready || !session) return null;
  return (
    <AppShell navItems={NAV_ITEMS} roleLabel="Rider account">
      {children}
    </AppShell>
  );
}
