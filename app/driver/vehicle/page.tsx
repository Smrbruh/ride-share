"use client";
import * as React from "react";
import { Pencil } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useToast } from "@/contexts/toast-context";
import type { VehicleDto } from "@/types/api";
export default function DriverVehiclePage() {
  const { toast } = useToast();
  const [vehicle, setVehicle] = React.useState<VehicleDto | null | undefined>(undefined);
  const [error, setError] = React.useState<string | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const [model, setModel] = React.useState("");
  const [color, setColor] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const load = React.useCallback(() => {
    apiFetch<{ vehicle: VehicleDto }>("/api/vehicles/me")
      .then((result) => {
        setVehicle(result.vehicle);
        setModel(result.vehicle.model);
        setColor(result.vehicle.color);
      })
      .catch((fetchError) => {
        if (fetchError instanceof ApiError && fetchError.status === 404) setVehicle(null);
        else setError(fetchError instanceof ApiError ? fetchError.message : "Failed to load vehicle");
      });
  }, []);
  React.useEffect(() => { load(); }, [load]);
  const handleSave = async () => {
    if (!vehicle) return;
    setSaving(true);
    try {
      await apiFetch(`/api/vehicles/${vehicle.id}`, { method: "PATCH", body: { model, color } });
      toast({ title: "Vehicle updated", variant: "success" });
      setEditOpen(false);
      load();
    } catch (saveError) {
      toast({ title: "Could not update vehicle", description: saveError instanceof ApiError ? saveError.message : undefined, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };
  if (error) return <EmptyState title="Could not load vehicle" description={error} />;
  if (vehicle === undefined) return <ProfileSkeleton />;
  if (vehicle === null) return <EmptyState title="No vehicle assigned yet" description="Contact your administrator to get a vehicle assigned to your account" />;
  const fields: Array<[string, string]> = [
    ["Plate number", vehicle.plateNumber],
    ["Model", vehicle.model],
    ["Color", vehicle.color],
    ["Year", String(vehicle.manufactureYear)],
    ["Vehicle type", vehicle.vehicleType?.typeName ?? "—"]
  ];
  return (
    <Card className="max-w-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Vehicle</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}><Pencil className="h-4 w-4" /> Edit</Button>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-base font-medium">{value}</p>
          </div>
        ))}
      </CardContent>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit vehicle details</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="driver-vehicle-model">Model</Label>
              <Input id="driver-vehicle-model" value={model} onChange={(event) => setModel(event.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="driver-vehicle-color">Color</Label>
              <Input id="driver-vehicle-color" value={color} onChange={(event) => setColor(event.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
