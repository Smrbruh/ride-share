"use client";
import * as React from "react";
import { Plus, Pencil, Trash2, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useAdminCrud } from "@/hooks/use-admin-crud";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useToast } from "@/contexts/toast-context";
import type { LocationDto } from "@/types/api";
interface FormState {
  address: string;
  city: string;
  latitude: string;
  longitude: string;
}
const EMPTY_FORM: FormState = { address: "", city: "", latitude: "", longitude: "" };
export default function AdminLocationsPage() {
  const { toast } = useToast();
  const { items, total, page, setPage, search, setSearch, error, load, pageSize } = useAdminCrud<LocationDto>("/api/locations");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<LocationDto | null>(null);
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<LocationDto | null>(null);
  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };
  const openEdit = (location: LocationDto) => {
    setEditing(location);
    setForm({ address: location.address, city: location.city, latitude: String(location.latitude), longitude: String(location.longitude) });
    setDialogOpen(true);
  };
  const handleSave = async () => {
    setSaving(true);
    const body = { address: form.address, city: form.city, latitude: Number(form.latitude), longitude: Number(form.longitude) };
    try {
      if (editing) await apiFetch(`/api/locations/${editing.id}`, { method: "PATCH", body });
      else await apiFetch("/api/locations", { method: "POST", body });
      toast({ title: editing ? "Location updated" : "Location created", variant: "success" });
      setDialogOpen(false);
      load();
    } catch (saveError) {
      toast({ title: "Could not save location", description: saveError instanceof ApiError ? saveError.message : undefined, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/api/locations/${deleteTarget.id}`, { method: "DELETE" });
      toast({ title: "Location deleted", variant: "success" });
      setDeleteTarget(null);
      load();
    } catch (deleteError) {
      toast({ title: "Could not delete location", description: deleteError instanceof ApiError ? deleteError.message : undefined, variant: "destructive" });
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by city" aria-label="Search locations" className="pl-9" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> New location</Button>
      </div>
      {error ? <EmptyState title="Could not load locations" description={error} /> : null}
      {!items && !error ? <TableSkeleton /> : null}
      {items ? (
        <>
          {items.length === 0 ? (
            <EmptyState title="No locations found" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Address</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Latitude</TableHead>
                  <TableHead>Longitude</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>{location.address}</TableCell>
                    <TableCell>{location.city}</TableCell>
                    <TableCell>{location.latitude}</TableCell>
                    <TableCell>{location.longitude}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" aria-label={`Edit ${location.address}`} onClick={() => openEdit(location)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" aria-label={`Delete ${location.address}`} onClick={() => setDeleteTarget(location)}><Trash2 className="h-4 w-4" /></Button>
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit location" : "New location"}</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="loc-address">Address</Label>
              <Input id="loc-address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="loc-city">City</Label>
              <Input id="loc-city" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="loc-latitude">Latitude</Label>
                <Input id="loc-latitude" type="number" value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="loc-longitude">Longitude</Label>
                <Input id="loc-longitude" type="number" value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} />
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
        title="Delete this location?"
        description="Locations referenced by existing rides can't be deleted."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
