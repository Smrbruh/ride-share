"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { registerSchema } from "@/schemas/auth";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import type { AuthResponseDto } from "@/types/api";
const formSchema = registerSchema
  .extend({ confirmPassword: z.string().min(8) })
  .refine((data) => data.password === data.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });
type FormValues = z.infer<typeof formSchema>;
export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(formSchema) });
  const onSubmit = async (values: FormValues) => {
    setError(null);
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = values;
      const result = await apiFetch<AuthResponseDto>("/api/auth/register", { method: "POST", body: payload, auth: false });
      if (!result.user) throw new ApiError("Unexpected response from server", 500);
      login(result.token, { role: "user", user: result.user });
      router.push("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Book your first ride in minutes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {error ? <Alert variant="destructive">{error}</Alert> : null}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" {...register("firstName")} />
                {errors.firstName ? <p className="text-xs text-destructive">{errors.firstName.message}</p> : null}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" {...register("lastName")} />
                {errors.lastName ? <p className="text-xs text-destructive">{errors.lastName.message}</p> : null}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phoneNumber">Phone number</Label>
              <Input id="phoneNumber" {...register("phoneNumber")} />
              {errors.phoneNumber ? <p className="text-xs text-destructive">{errors.phoneNumber.message}</p> : null}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                {errors.confirmPassword ? <p className="text-xs text-destructive">{errors.confirmPassword.message}</p> : null}
              </div>
            </div>
            <Button type="submit" size="lg" disabled={loading}>{loading ? "Creating account..." : "Create account"}</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="font-medium text-accent">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
