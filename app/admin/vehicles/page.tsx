"use client";
import * as React from "react";
import { Plus, Pencil, Trash2, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EntityDialog } from "@/components/shared/entity-dialog";
import { SearchableSelect, type SearchableSelectOption } from "@/components/shared/searchable-select";
import { useAdminCrud } from "@/hooks/use-admin-crud";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useToast } from "@/contexts/toast-context";
import type { VehicleDto, AdminDriverDto, VehicleTypeDto } from "@/types/api";
interface FormState {
  driverId: string;
  vehicleTypeId: string;
  plateNumber: string;
  model: string;
  color: string;
  manufactureYear: string;
}
const EMPTY_FORM: FormState = { driverId: "", vehicleTypeId: "", plateNumber: "", model: "", color: "", manufactureYear: String(new Date().getFullYear()) };
export default function AdminVehiclesPage() {
  const { toast } = useToast();
  const { items, total, page, setPage, search, setSearch, error, load, pageSize } = useAdminCrud<VehicleDto>("/api/vehicles");
  const [drivers, setDrivers] = React.useState<AdminDriverDto[]>([]);
  const [vehicleTypes, setVehicleTypes] = React.useState<VehicleTypeDto[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<VehicleDto | null>(null);
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<VehicleDto | null>(null);
  React.useEffect(() => {
    apiFetch<{ items: AdminDriverDto[] }>("/api/admin/drivers?pageSize=100").then((result) => setDrivers(result.items)).catch(() => setDrivers([]));
    apiFetch<{ vehicleTypes: VehicleTypeDto[] }>("/api/vehicle-types").then((result) => setVehicleTypes(result.vehicleTypes)).catch(() => setVehicleTypes([]));
  }, []);
  const driverOptions: SearchableSelectOption[] = drivers
    .filter((driver) => !driver.vehicle || driver.id === editing?.driverId)
    .map((driver) => ({ value: String(driver.id), label: `${driver.firstName} ${driver.lastName}`, description: driver.email }));
  const vehicleTypeOptions: SearchableSelectOption[] = vehicleTypes.map((type) => ({ value: String(type.id), label: type.typeName }));
  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setDialogOpen(true);
  };
  const openEdit = (vehicle: VehicleDto) => {
    setEditing(vehicle);
    setForm({
      driverId: String(vehicle.driverId),
      vehicleTypeId: String(vehicle.vehicleTypeId),
      plateNumber: vehicle.plateNumber,
      model: vehicle.model,
      color: vehicle.color,
      manufactureYear: String(vehicle.manufactureYear)
    });
    setFormError(null);
    setDialogOpen(true);
  };
  const handleSave = async () => {
    setSaving(true);
    setFormError(null);
    const body = {
      driverId: Number(form.driverId),
      vehicleTypeId: Number(form.vehicleTypeId),
      plateNumber: form.plateNumber,
      model: form.model,
      color: form.color,
      manufactureYear: Number(form.manufactureYear)
    };
    try {
      if (editing) await apiFetch(`/api/vehicles/${editing.id}`, { method: "PATCH", body });
      else await apiFetch("/api/vehicles", { method: "POST", body });
      toast({ title: editing ? "Vehicle updated" : "Vehicle created", variant: "success" });
      setDialogOpen(false);
      load();
    } catch (saveError) {
      setFormError(saveError instanceof ApiError ? saveError.message : "Could not save vehicle");
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/api/vehicles/${deleteTarget.id}`, { method: "DELETE" });
      toast({ title: "Vehicle deleted", variant: "success" });
      setDeleteTarget(null);
      load();
    } catch (deleteError) {
      toast({ title: "Could not delete vehicle", description: deleteError instanceof ApiError ? deleteError.message : undefined, variant: "destructive" });
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search plate, model, or driver" aria-label="Search vehicles" className="pl-9" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> New vehicle</Button>
      </div>
      {error ? <EmptyState title="Could not load vehicles" description={error} /> : null}
      {!items && !error ? <TableSkeleton /> : null}
      {items ? (
        <>
          {items.length === 0 ? (
            <EmptyState title="No vehicles found" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.plateNumber}</TableCell>
                    <TableCell>{vehicle.model}</TableCell>
                    <TableCell>{vehicle.color}</TableCell>
                    <TableCell>{vehicle.manufactureYear}</TableCell>
                    <TableCell>{vehicle.driver ? `${vehicle.driver.firstName} ${vehicle.driver.lastName}` : "—"}</TableCell>
                    <TableCell>{vehicle.vehicleType?.typeName ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" aria-label={`Edit vehicle ${vehicle.plateNumber}`} onClick={() => openEdit(vehicle)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" aria-label={`Delete vehicle ${vehicle.plateNumber}`} onClick={() => setDeleteTarget(vehicle)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </>
      ) : null}
      <EntityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={editing ? "edit" : "create"}
        entityLabel="vehicle"
        saving={saving}
        error={formError}
        onSave={handleSave}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="vehicle-driver">Driver</Label>
          <SearchableSelect
            label="Driver"
            options={driverOptions}
            value={form.driverId || null}
            onChange={(value) => setForm({ ...form, driverId: value })}
            placeholder="Select a driver without a vehicle"
            emptyMessage="No available drivers"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="vehicle-type">Vehicle type</Label>
          <SearchableSelect
            label="Vehicle type"
            options={vehicleTypeOptions}
            value={form.vehicleTypeId || null}
            onChange={(value) => setForm({ ...form, vehicleTypeId: value })}
            placeholder="Select a vehicle type"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="vehicle-plate">Plate number</Label>
            <Input id="vehicle-plate" value={form.plateNumber} onChange={(event) => setForm({ ...form, plateNumber: event.target.value })} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="vehicle-model">Model</Label>
            <Input id="vehicle-model" value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="vehicle-color">Color</Label>
            <Input id="vehicle-color" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="vehicle-year">Manufacture year</Label>
            <Input id="vehicle-year" type="number" value={form.manufactureYear} onChange={(event) => setForm({ ...form, manufactureYear: event.target.value })} />
          </div>
        </div>
      </EntityDialog>
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this vehicle?"
        description="This can't be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
