"use client";
import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") console.error(error);
  }, [error]);
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Something went wrong</h1>
            <p className="mt-1 text-sm text-muted-foreground">An unexpected error occurred. You can try again or head back home.</p>
          </div>
          {process.env.NODE_ENV === "development" ? (
            <p className="w-full overflow-x-auto rounded-xl bg-muted p-3 text-left text-xs text-muted-foreground">{error.message}</p>
          ) : null}
          <div className="flex gap-3">
            <Button onClick={reset}><RotateCcw className="h-4 w-4" /> Try again</Button>
            <Link href="/"><Button variant="outline"><Home className="h-4 w-4" /> Go home</Button></Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
