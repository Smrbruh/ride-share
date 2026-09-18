"use client";
import * as React from "react";
import { Plus, Pencil, Ban, Trash2, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EntityDialog } from "@/components/shared/entity-dialog";
import { SearchableSelect, type SearchableSelectOption } from "@/components/shared/searchable-select";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useToast } from "@/contexts/toast-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AdminRideDto, AdminDriverDto, LocationDto } from "@/types/api";
const STATUS_VARIANT: Record<string, "default" | "accent" | "success" | "warning" | "destructive"> = {
  scheduled: "accent",
  in_progress: "warning",
  completed: "success",
  cancelled: "destructive"
};
const PAGE_SIZE = 10;
interface FormState {
  driverId: string;
  pickupLocationId: string;
  dropoffLocationId: string;
  distanceKm: string;
  departureDate: string;
  departureTime: string;
}
const EMPTY_FORM: FormState = { driverId: "", pickupLocationId: "", dropoffLocationId: "", distanceKm: "", departureDate: "", departureTime: "" };
export default function AdminRidesPage() {
  const { toast } = useToast();
  const [rides, setRides] = React.useState<AdminRideDto[] | null>(null);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [date, setDate] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [drivers, setDrivers] = React.useState<AdminDriverDto[]>([]);
  const [locations, setLocations] = React.useState<LocationDto[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminRideDto | null>(null);
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = React.useState<AdminRideDto | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminRideDto | null>(null);
  const load = React.useCallback(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (date) params.set("date", date);
    apiFetch<{ items: AdminRideDto[]; total: number }>(`/api/admin/rides?${params.toString()}`)
      .then((result) => {
        setRides(result.items);
        setTotal(result.total);
      })
      .catch((fetchError) => setError(fetchError instanceof ApiError ? fetchError.message : "Failed to load rides"));
  }, [page, search, status, date]);
  React.useEffect(() => { load(); }, [load]);
  React.useEffect(() => {
    apiFetch<{ items: AdminDriverDto[] }>("/api/admin/drivers?pageSize=100").then((result) => setDrivers(result.items)).catch(() => setDrivers([]));
    apiFetch<{ items: LocationDto[] }>("/api/locations?pageSize=100", { auth: false }).then((result) => setLocations(result.items)).catch(() => setLocations([]));
  }, []);
  const driversWithVehicle = drivers.filter((driver) => driver.vehicle);
  const driverOptions: SearchableSelectOption[] = driversWithVehicle.map((driver) => ({
    value: String(driver.id),
    label: `${driver.firstName} ${driver.lastName}`,
    description: driver.vehicle?.plateNumber
  }));
  const locationOptions: SearchableSelectOption[] = locations.map((location) => ({ value: String(location.id), label: location.address, description: location.city }));
  const selectedDriver = driversWithVehicle.find((driver) => String(driver.id) === form.driverId);
  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setDialogOpen(true);
  };
  const openEdit = (ride: AdminRideDto) => {
    setEditing(ride);
    const start = new Date(ride.startTime);
    setForm({
      driverId: String(ride.driverId),
      pickupLocationId: String(ride.pickupLocationId),
      dropoffLocationId: String(ride.dropoffLocationId),
      distanceKm: String(ride.distanceKm),
      departureDate: start.toISOString().slice(0, 10),
      departureTime: start.toISOString().slice(11, 16)
    });
    setFormError(null);
    setDialogOpen(true);
  };
  const handleSave = async () => {
    setSaving(true);
    setFormError(null);
    const startTime = `${form.departureDate}T${form.departureTime}:00`;
    try {
      if (editing) {
        await apiFetch(`/api/rides/${editing.id}`, {
          method: "PATCH",
          body: {
            pickupLocationId: Number(form.pickupLocationId),
            dropoffLocationId: Number(form.dropoffLocationId),
            distanceKm: Number(form.distanceKm),
            startTime
          }
        });
        toast({ title: "Ride updated", variant: "success" });
      } else {
        await apiFetch("/api/rides", {
          method: "POST",
          body: {
            driverId: Number(form.driverId),
            pickupLocationId: Number(form.pickupLocationId),
            dropoffLocationId: Number(form.dropoffLocationId),
            distanceKm: Number(form.distanceKm),
            startTime
          }
        });
        toast({ title: "Ride created", variant: "success" });
      }
      setDialogOpen(false);
      load();
    } catch (saveError) {
      setFormError(saveError instanceof ApiError ? saveError.message : "Could not save ride");
    } finally {
      setSaving(false);
    }
  };
  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await apiFetch(`/api/rides/${cancelTarget.id}/cancel`, { method: "PATCH" });
      toast({ title: "Ride cancelled", variant: "success" });
      setCancelTarget(null);
      load();
    } catch (cancelError) {
      toast({ title: "Could not cancel ride", description: cancelError instanceof ApiError ? cancelError.message : undefined, variant: "destructive" });
    }
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/api/rides/${deleteTarget.id}`, { method: "DELETE" });
      toast({ title: "Ride deleted", variant: "success" });
      setDeleteTarget(null);
      load();
    } catch (deleteError) {
      toast({ title: "Could not delete ride", description: deleteError instanceof ApiError ? deleteError.message : undefined, variant: "destructive" });
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search address or driver" aria-label="Search rides" className="pl-9" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
          </div>
          <Select value={status || "all"} onValueChange={(value) => { setStatus(value === "all" ? "" : value); setPage(1); }}>
            <SelectTrigger className="w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" aria-label="Filter by date" className="w-40" value={date} onChange={(event) => { setDate(event.target.value); setPage(1); }} />
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> New ride</Button>
      </div>
      {error ? <EmptyState title="Could not load rides" description={error} /> : null}
      {!rides && !error ? <TableSkeleton /> : null}
      {rides ? (
        <>
          {rides.length === 0 ? (
            <EmptyState title="No rides found" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Pickup</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rides.map((ride) => (
                  <TableRow key={ride.id}>
                    <TableCell>{ride.driver.firstName} {ride.driver.lastName}</TableCell>
                    <TableCell>{ride.driver.vehicle ? ride.driver.vehicle.plateNumber : "—"}</TableCell>
                    <TableCell className="max-w-[160px] truncate">{ride.pickupLocation.address}</TableCell>
                    <TableCell className="max-w-[160px] truncate">{ride.dropoffLocation.address}</TableCell>
                    <TableCell>{ride.distanceKm} km</TableCell>
                    <TableCell>{formatCurrency(ride.fareAmount)}</TableCell>
                    <TableCell>{formatDate(ride.startTime)}</TableCell>
                    <TableCell><Badge variant={STATUS_VARIANT[ride.status] ?? "default"}>{ride.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" aria-label={`Edit ride to ${ride.dropoffLocation.address}`} disabled={ride.status !== "scheduled"} onClick={() => openEdit(ride)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" aria-label={`Cancel ride to ${ride.dropoffLocation.address}`} disabled={ride.status === "completed" || ride.status === "cancelled"} onClick={() => setCancelTarget(ride)}><Ban className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" aria-label={`Delete ride to ${ride.dropoffLocation.address}`} disabled={ride.status !== "scheduled"} onClick={() => setDeleteTarget(ride)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
        </>
      ) : null}
      <EntityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={editing ? "edit" : "create"}
        entityLabel="ride"
        saving={saving}
        error={formError}
        onSave={handleSave}
      >
        {!editing ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="ride-driver">Driver</Label>
            <SearchableSelect
              label="Driver"
              options={driverOptions}
              value={form.driverId || null}
              onChange={(value) => setForm({ ...form, driverId: value })}
              placeholder="Select a driver with a vehicle"
              emptyMessage="No drivers with a vehicle assigned"
            />
            {selectedDriver?.vehicle ? (
              <p className="text-xs text-muted-foreground">Vehicle: {selectedDriver.vehicle.plateNumber} · {selectedDriver.vehicle.model}</p>
            ) : null}
          </div>
        ) : null}
        <div className="flex flex-col gap-2">
          <Label htmlFor="ride-pickup">Pickup location</Label>
          <SearchableSelect
            label="Pickup location"
            options={locationOptions}
            value={form.pickupLocationId || null}
            onChange={(value) => setForm({ ...form, pickupLocationId: value })}
            placeholder="Select pickup"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ride-dropoff">Dropoff location</Label>
          <SearchableSelect
            label="Dropoff location"
            options={locationOptions}
            value={form.dropoffLocationId || null}
            onChange={(value) => setForm({ ...form, dropoffLocationId: value })}
            placeholder="Select destination"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ride-distance">Distance (km)</Label>
          <Input id="ride-distance" type="number" value={form.distanceKm} onChange={(event) => setForm({ ...form, distanceKm: event.target.value })} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ride-departure-date">Departure date</Label>
            <Input id="ride-departure-date" type="date" value={form.departureDate} onChange={(event) => setForm({ ...form, departureDate: event.target.value })} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ride-departure-time">Departure time</Label>
            <Input id="ride-departure-time" type="time" value={form.departureTime} onChange={(event) => setForm({ ...form, departureTime: event.target.value })} />
          </div>
        </div>
      </EntityDialog>
      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel this ride?"
        description="All active bookings will be cancelled and paid payments refunded."
        confirmLabel="Cancel ride"
        onConfirm={handleCancel}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this ride?"
        description="Only scheduled rides with no active bookings can be deleted."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
