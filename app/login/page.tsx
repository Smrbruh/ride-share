"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useAuth, type SessionRole } from "@/contexts/auth-context";
import type { AuthResponseDto } from "@/types/api";
function LoginForm({ role }: { role: SessionRole }) {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  const endpoint = role === "driver" ? "/api/auth/driver-login" : role === "admin" ? "/api/admin/login" : "/api/auth/login";
  const dashboard = role === "driver" ? "/driver/dashboard" : role === "admin" ? "/admin/dashboard" : "/dashboard";
  const onSubmit = async (values: LoginInput) => {
    setError(null);
    setLoading(true);
    try {
      const result = await apiFetch<AuthResponseDto>(endpoint, { method: "POST", body: values, auth: false });
      const person = role === "driver" ? result.driver : role === "admin" ? result.admin : result.user;
      if (!person) throw new ApiError("Unexpected response from server", 500);
      login(result.token, { role, user: { id: person.id, firstName: person.firstName, lastName: person.lastName, email: person.email } });
      router.push(dashboard);
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${role}-email`}>Email</Label>
        <Input id={`${role}-email`} type="email" placeholder="you@example.com" {...register("email")} />
        {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${role}-password`}>Password</Label>
        <Input id={`${role}-password`} type="password" placeholder="••••••••" {...register("password")} />
        {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
      </div>
      <Button type="submit" size="lg" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
    </form>
  );
}
export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginPageContent />
    </React.Suspense>
  );
}
function LoginPageContent() {
  const searchParams = useSearchParams();
  const expired = searchParams.get("expired") === "1";
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to continue to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {expired ? <Alert variant="warning" className="mb-4">Your session expired. Please sign in again.</Alert> : null}
          <Tabs defaultValue="user">
            <TabsList className="mb-2 grid w-full grid-cols-3">
              <TabsTrigger value="user">Rider</TabsTrigger>
              <TabsTrigger value="driver">Driver</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            <TabsContent value="user"><LoginForm role="user" /></TabsContent>
            <TabsContent value="driver"><LoginForm role="driver" /></TabsContent>
            <TabsContent value="admin"><LoginForm role="admin" /></TabsContent>
          </Tabs>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here? <Link href="/register" className="font-medium text-accent">Create an account</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
