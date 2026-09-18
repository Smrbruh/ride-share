import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Lock className="h-7 w-7" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">401</h1>
            <p className="mt-1 text-sm text-muted-foreground">You need to sign in to view this page.</p>
          </div>
          <Link href="/login"><Button>Sign in</Button></Link>
        </CardContent>
      </Card>
    </main>
  );
}
