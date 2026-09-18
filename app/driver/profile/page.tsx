"use client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
export default function DriverProfilePage() {
  const { session } = useAuth();
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your driver account details</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="profile-first-name">First name</Label>
              <Input id="profile-first-name" value={session?.user.firstName ?? ""} disabled />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="profile-last-name">Last name</Label>
              <Input id="profile-last-name" value={session?.user.lastName ?? ""} disabled />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" value={session?.user.email ?? ""} disabled />
          </div>
          <Alert>
            Profile editing isn&apos;t available yet — there&apos;s no self-service update endpoint for driver accounts. Contact an admin to update your details.
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
