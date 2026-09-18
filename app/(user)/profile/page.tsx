"use client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
export default function ProfilePage() {
  const { session } = useAuth();
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-profile-first-name">First name</Label>
              <Input id="user-profile-first-name" value={session?.user.firstName ?? ""} disabled />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-profile-last-name">Last name</Label>
              <Input id="user-profile-last-name" value={session?.user.lastName ?? ""} disabled />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="user-profile-email">Email</Label>
            <Input id="user-profile-email" value={session?.user.email ?? ""} disabled />
          </div>
          <Alert>
            Editing your name, phone, or password isn&apos;t available yet — the backend doesn&apos;t expose a profile update endpoint for this account type.
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
