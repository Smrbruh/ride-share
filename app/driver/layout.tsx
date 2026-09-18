"use client";
import { LayoutDashboard, Car, Navigation, History, Wallet, User } from "lucide-react";
import { AppShell, type NavItem } from "@/components/shared/app-shell";
import { useRequireRole } from "@/hooks/use-require-role";
const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/driver/dashboard", icon: LayoutDashboard },
  { label: "My Vehicle", href: "/driver/vehicle", icon: Car },
  { label: "Active Ride", href: "/driver/active-ride", icon: Navigation },
  { label: "Ride History", href: "/driver/history", icon: History },
  { label: "Earnings", href: "/driver/earnings", icon: Wallet },
  { label: "Profile", href: "/driver/profile", icon: User }
];
export default function DriverGroupLayout({ children }: { children: React.ReactNode }) {
  const { ready, session } = useRequireRole("driver");
  if (!ready || !session) return null;
  return (
    <AppShell navItems={NAV_ITEMS} roleLabel="Driver account">
      {children}
    </AppShell>
  );
}
