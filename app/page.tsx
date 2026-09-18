import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
const FEATURES = [
  { icon: MapPin, title: "Live ride search", description: "Find scheduled rides across the city with real-time seat availability." },
  { icon: Zap, title: "Instant booking", description: "Reserve a seat, apply a promo code, and pay in a few taps." },
  { icon: ShieldCheck, title: "Verified drivers", description: "Every driver is licensed and every vehicle is registered before it goes live." }
];
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="container flex items-center justify-between py-8">
        <span className="text-lg font-semibold tracking-tight">Ride</span>
        <nav className="flex items-center gap-3">
          <Link href="/login"><Button variant="ghost">Log in</Button></Link>
          <Link href="/register"><Button>Sign up</Button></Link>
        </nav>
      </header>
      <section className="container flex flex-1 flex-col items-center justify-center gap-8 py-24 text-center">
        <h1 className="max-w-2xl text-5xl font-semibold tracking-tight md:text-6xl">
          Ride booking, done simply.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Search scheduled rides, book a seat, and track your trip from pickup to drop-off.
        </p>
        <div className="flex items-center gap-3">
          <Link href="/register"><Button size="lg">Get started <ArrowRight className="h-4 w-4" /></Button></Link>
          <Link href="/login"><Button size="lg" variant="outline">I have an account</Button></Link>
        </div>
      </section>
      <section className="container grid gap-6 pb-24 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title}>
            <CardContent className="flex flex-col gap-3 p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <feature.icon className="h-6 w-6" />
              </div>
              <p className="text-base font-semibold">{feature.title}</p>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
