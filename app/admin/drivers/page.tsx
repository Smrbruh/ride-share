"use client";
import * as React from "react";
import { Plus, Pencil, Eye, Ban, CheckCircle2, Trash2, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EntityDialog } from "@/components/shared/entity-dialog";
import { useAdminCrud } from "@/hooks/use-admin-crud";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useToast } from "@/contexts/toast-context";
import { formatDateOnly } from "@/lib/utils";
import type { AdminDriverDto } from "@/types/api";
const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "destructive"> = {
  active: "success",
  suspended: "warning",
  deleted: "destructive"
};
interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  hireDate: string;
  status: string;
}
const EMPTY_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
  licenseNumber: "",
  licenseExpiryDate: "",
  hireDate: "",
  status: "active"
};
export default function AdminDriversPage() {
  const { toast } = useToast();
  const { items, total, page, setPage, search, setSearch, error, load, pageSize } = useAdminCrud<AdminDriverDto>("/api/admin/drivers");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminDriverDto | null>(null);
  const [viewing, setViewing] = React.useState<AdminDriverDto | null>(null);
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminDriverDto | null>(null);
  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setDialogOpen(true);
  };
  const openEdit = (driver: AdminDriverDto) => {
    setEditing(driver);
    setForm({
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phoneNumber: driver.phoneNumber,
      password: "",
      licenseNumber: driver.licenseNumber,
      licenseExpiryDate: driver.licenseExpiryDate.slice(0, 10),
      hireDate: driver.hireDate.slice(0, 10),
      status: driver.status
    });
    setFormError(null);
    setDialogOpen(true);
  };
  const handleSave = async () => {
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await apiFetch(`/api/admin/drivers/${editing.id}`, {
          method: "PATCH",
          body: {
            firstName: form.firstName,
            lastName: form.lastName,
            phoneNumber: form.phoneNumber,
            licenseNumber: form.licenseNumber,
            licenseExpiryDate: form.licenseExpiryDate
          }
        });
        toast({ title: "Driver updated", variant: "success" });
      } else {
        await apiFetch("/api/admin/drivers", {
          method: "POST",
          body: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phoneNumber: form.phoneNumber,
            password: form.password,
            licenseNumber: form.licenseNumber,
            licenseExpiryDate: form.licenseExpiryDate,
            hireDate: form.hireDate,
            status: form.status
          }
        });
        toast({ title: "Driver created", variant: "success" });
      }
      setDialogOpen(false);
      load();
    } catch (saveError) {
      setFormError(saveError instanceof ApiError ? saveError.message : "Could not save driver");
    } finally {
      setSaving(false);
    }
  };
  const toggleStatus = async (driver: AdminDriverDto) => {
    try {
      const action = driver.status === "suspended" ? "activate" : "suspend";
      await apiFetch(`/api/admin/drivers/${driver.id}/${action}`, { method: "PATCH" });
      toast({ title: `Driver ${action}d`, variant: "success" });
      load();
    } catch (actionError) {
      toast({ title: "Action failed", description: actionError instanceof ApiError ? actionError.message : undefined, variant: "destructive" });
    }
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/api/admin/drivers/${deleteTarget.id}`, { method: "DELETE" });
      toast({ title: "Driver deleted", variant: "success" });
      setDeleteTarget(null);
      load();
    } catch (deleteError) {
      toast({ title: "Could not delete driver", description: deleteError instanceof ApiError ? deleteError.message : undefined, variant: "destructive" });
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search name, email, phone, license" aria-label="Search drivers" className="pl-9" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> New driver</Button>
      </div>
      {error ? <EmptyState title="Could not load drivers" description={error} /> : null}
      {!items && !error ? <TableSkeleton /> : null}
      {items ? (
        <>
          {items.length === 0 ? (
            <EmptyState title="No drivers found" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>{driver.firstName} {driver.lastName}</TableCell>
                    <TableCell>{driver.email}</TableCell>
                    <TableCell>{driver.licenseNumber}</TableCell>
                    <TableCell>{driver.vehicle ? driver.vehicle.plateNumber : "—"}</TableCell>
                    <TableCell><Badge variant={STATUS_VARIANT[driver.status] ?? "default"}>{driver.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" aria-label={`View ${driver.firstName} ${driver.lastName}`} onClick={() => setViewing(driver)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" aria-label={`Edit ${driver.firstName} ${driver.lastName}`} onClick={() => openEdit(driver)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" aria-label={driver.status === "suspended" ? `Activate ${driver.firstName} ${driver.lastName}` : `Suspend ${driver.firstName} ${driver.lastName}`} onClick={() => toggleStatus(driver)} disabled={driver.status === "deleted"}>
                          {driver.status === "suspended" ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" aria-label={`Delete ${driver.firstName} ${driver.lastName}`} onClick={() => setDeleteTarget(driver)}><Trash2 className="h-4 w-4" /></Button>
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
        entityLabel="driver"
        saving={saving}
        error={formError}
        onSave={handleSave}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="driver-first-name">First name</Label>
            <Input id="driver-first-name" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="driver-last-name">Last name</Label>
            <Input id="driver-last-name" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="driver-email">Email</Label>
          <Input id="driver-email" type="email" value={form.email} disabled={!!editing} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="driver-phone">Phone number</Label>
          <Input id="driver-phone" value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} />
        </div>
        {!editing ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="driver-password">Password</Label>
            <Input id="driver-password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="driver-license">License number</Label>
            <Input id="driver-license" value={form.licenseNumber} onChange={(event) => setForm({ ...form, licenseNumber: event.target.value })} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="driver-license-expiry">License expiry</Label>
            <Input id="driver-license-expiry" type="date" value={form.licenseExpiryDate} onChange={(event) => setForm({ ...form, licenseExpiryDate: event.target.value })} />
          </div>
        </div>
        {!editing ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="driver-hire-date">Hire date</Label>
              <Input id="driver-hire-date" type="date" value={form.hireDate} onChange={(event) => setForm({ ...form, hireDate: event.target.value })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="driver-status">Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                <SelectTrigger id="driver-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : null}
      </EntityDialog>
      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Driver details</DialogTitle></DialogHeader>
          {viewing ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground">Name</p><p>{viewing.firstName} {viewing.lastName}</p></div>
              <div><p className="text-xs text-muted-foreground">Email</p><p>{viewing.email}</p></div>
              <div><p className="text-xs text-muted-foreground">Phone</p><p>{viewing.phoneNumber}</p></div>
              <div><p className="text-xs text-muted-foreground">License</p><p>{viewing.licenseNumber}</p></div>
              <div><p className="text-xs text-muted-foreground">License expiry</p><p>{formatDateOnly(viewing.licenseExpiryDate)}</p></div>
              <div><p className="text-xs text-muted-foreground">Hire date</p><p>{formatDateOnly(viewing.hireDate)}</p></div>
              <div><p className="text-xs text-muted-foreground">Status</p><Badge variant={STATUS_VARIANT[viewing.status] ?? "default"}>{viewing.status}</Badge></div>
              <div><p className="text-xs text-muted-foreground">Vehicle</p><p>{viewing.vehicle ? `${viewing.vehicle.plateNumber} · ${viewing.vehicle.model}` : "Unassigned"}</p></div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this driver?"
        description="This is permanent. The driver must already be suspended, have no active rides, and no ride history."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
