"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}
interface AppShellProps {
  navItems: NavItem[];
  roleLabel: string;
  children: React.ReactNode;
}
function NavLinks({ navItems, pathname, onNavigate }: { navItems: NavItem[]; pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Primary" className="flex flex-1 flex-col gap-1">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground",
              active && "bg-accent/10 text-accent"
            )}
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
export function AppShell({ navItems, roleLabel, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-background px-4 py-6 md:flex">
        <div className="mb-8 px-2 text-lg font-semibold tracking-tight">Ride</div>
        <NavLinks navItems={navItems} pathname={pathname} />
        <Button variant="ghost" className="justify-start gap-3 text-muted-foreground" onClick={handleLogout}>
          <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
        </Button>
      </aside>
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-border bg-background px-4 py-6 animate-slide-up">
            <div className="mb-8 flex items-center justify-between px-2">
              <span className="text-lg font-semibold tracking-tight">Ride</span>
              <Button variant="ghost" size="icon" aria-label="Close navigation menu" onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <NavLinks navItems={navItems} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            <Button variant="ghost" className="justify-start gap-3 text-muted-foreground" onClick={handleLogout}>
              <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
            </Button>
          </aside>
        </div>
      ) : null}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation menu" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <p className="text-sm font-medium text-muted-foreground">{roleLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
              {session?.user.firstName?.[0]}
              {session?.user.lastName?.[0]}
            </div>
            <div className="hidden text-sm md:block">
              <p className="font-medium">{session?.user.firstName} {session?.user.lastName}</p>
              <p className="text-xs text-muted-foreground">{session?.user.email}</p>
            </div>
          </div>
        </header>
        <main id="main-content" className="flex-1 bg-muted/30 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
