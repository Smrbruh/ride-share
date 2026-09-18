import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Compass className="h-7 w-7" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">404</h1>
            <p className="mt-1 text-sm text-muted-foreground">This page doesn&apos;t exist or may have moved.</p>
          </div>
          <Link href="/"><Button><Home className="h-4 w-4" /> Back to home</Button></Link>
        </CardContent>
      </Card>
    </main>
  );
}
