"use client";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
const DASHBOARD_BY_ROLE: Record<string, string> = {
  user: "/dashboard",
  driver: "/driver/dashboard",
  admin: "/admin/dashboard"
};
export default function ForbiddenPage() {
  const { session } = useAuth();
  const dashboard = session ? DASHBOARD_BY_ROLE[session.role] : "/login";
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warning/10 text-warning">
            <ShieldAlert className="h-7 w-7" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">403</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your account doesn&apos;t have access to this page.</p>
          </div>
          <Link href={dashboard}><Button>Go to my dashboard</Button></Link>
        </CardContent>
      </Card>
    </main>
  );
}
