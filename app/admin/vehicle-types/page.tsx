"use client";
import * as React from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useToast } from "@/contexts/toast-context";
import { formatCurrency } from "@/lib/utils";
import type { VehicleTypeDto } from "@/types/api";
interface FormState {
  typeName: string;
  baseFare: string;
  perKmRate: string;
}
const EMPTY_FORM: FormState = { typeName: "", baseFare: "", perKmRate: "" };
export default function AdminVehicleTypesPage() {
  const { toast } = useToast();
  const [items, setItems] = React.useState<VehicleTypeDto[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<VehicleTypeDto | null>(null);
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<VehicleTypeDto | null>(null);
  const load = React.useCallback(() => {
    apiFetch<{ vehicleTypes: VehicleTypeDto[] }>("/api/vehicle-types")
      .then((result) => setItems(result.vehicleTypes))
      .catch((fetchError) => setError(fetchError instanceof ApiError ? fetchError.message : "Failed to load vehicle types"));
  }, []);
  React.useEffect(() => { load(); }, [load]);
  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };
  const openEdit = (type: VehicleTypeDto) => {
    setEditing(type);
    setForm({ typeName: type.typeName, baseFare: String(type.baseFare), perKmRate: String(type.perKmRate) });
    setDialogOpen(true);
  };
  const handleSave = async () => {
    setSaving(true);
    const body = { typeName: form.typeName, baseFare: Number(form.baseFare), perKmRate: Number(form.perKmRate) };
    try {
      if (editing) await apiFetch(`/api/vehicle-types/${editing.id}`, { method: "PATCH", body });
      else await apiFetch("/api/vehicle-types", { method: "POST", body });
      toast({ title: editing ? "Vehicle type updated" : "Vehicle type created", variant: "success" });
      setDialogOpen(false);
      load();
    } catch (saveError) {
      toast({ title: "Could not save vehicle type", description: saveError instanceof ApiError ? saveError.message : undefined, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/api/vehicle-types/${deleteTarget.id}`, { method: "DELETE" });
      toast({ title: "Vehicle type deleted", variant: "success" });
      setDeleteTarget(null);
      load();
    } catch (deleteError) {
      toast({ title: "Could not delete vehicle type", description: deleteError instanceof ApiError ? deleteError.message : undefined, variant: "destructive" });
    }
  };
  if (error) return <EmptyState title="Could not load vehicle types" description={error} />;
  if (!items) return <TableSkeleton />;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> New vehicle type</Button>
      </div>
      {items.length === 0 ? (
        <EmptyState title="No vehicle types yet" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Base fare</TableHead>
              <TableHead>Per km rate</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((type) => (
              <TableRow key={type.id}>
                <TableCell>{type.typeName}</TableCell>
                <TableCell>{formatCurrency(type.baseFare)}</TableCell>
                <TableCell>{formatCurrency(type.perKmRate)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" aria-label={`Edit ${type.typeName}`} onClick={() => openEdit(type)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" aria-label={`Delete ${type.typeName}`} onClick={() => setDeleteTarget(type)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit vehicle type" : "New vehicle type"}</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="vt-type-name">Type name</Label>
              <Input id="vt-type-name" value={form.typeName} onChange={(event) => setForm({ ...form, typeName: event.target.value })} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="vt-base-fare">Base fare</Label>
                <Input id="vt-base-fare" type="number" value={form.baseFare} onChange={(event) => setForm({ ...form, baseFare: event.target.value })} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="vt-per-km-rate">Per km rate</Label>
                <Input id="vt-per-km-rate" type="number" value={form.perKmRate} onChange={(event) => setForm({ ...form, perKmRate: event.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this vehicle type?"
        description="This can't be undone. Vehicle types in use by a vehicle can't be deleted."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
