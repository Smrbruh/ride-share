"use client";
import * as React from "react";
import { Search as SearchIcon, Pencil, Ban, CheckCircle2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { formatDateOnly } from "@/lib/utils";
import type { AdminUserDto } from "@/types/api";
const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "destructive"> = {
  active: "success",
  suspended: "warning",
  deleted: "destructive"
};
export default function AdminUsersPage() {
  const { toast } = useToast();
  const { items, total, page, setPage, search, setSearch, error, load, pageSize } = useAdminCrud<AdminUserDto>("/api/admin/users");
  const [editing, setEditing] = React.useState<AdminUserDto | null>(null);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminUserDto | null>(null);
  const openEdit = (user: AdminUserDto) => {
    setEditing(user);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhoneNumber(user.phoneNumber);
  };
  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await apiFetch(`/api/admin/users/${editing.id}`, { method: "PATCH", body: { firstName, lastName, phoneNumber } });
      toast({ title: "User updated", variant: "success" });
      setEditing(null);
      load();
    } catch (saveError) {
      toast({ title: "Could not update user", description: saveError instanceof ApiError ? saveError.message : undefined, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };
  const toggleStatus = async (user: AdminUserDto) => {
    try {
      const action = user.status === "suspended" ? "activate" : "suspend";
      await apiFetch(`/api/admin/users/${user.id}/${action}`, { method: "PATCH" });
      toast({ title: `User ${action}d`, variant: "success" });
      load();
    } catch (actionError) {
      toast({ title: "Action failed", description: actionError instanceof ApiError ? actionError.message : undefined, variant: "destructive" });
    }
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/api/admin/users/${deleteTarget.id}`, { method: "DELETE" });
      toast({ title: "User deleted", variant: "success" });
      setDeleteTarget(null);
      load();
    } catch (deleteError) {
      toast({ title: "Could not delete user", description: deleteError instanceof ApiError ? deleteError.message : undefined, variant: "destructive" });
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name or email" aria-label="Search users" className="pl-9" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
      </div>
      {error ? <EmptyState title="Could not load users" description={error} /> : null}
      {!items && !error ? <TableSkeleton /> : null}
      {items ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.firstName} {user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell>{formatDateOnly(user.registrationDate)}</TableCell>
                  <TableCell><Badge variant={STATUS_VARIANT[user.status] ?? "default"}>{user.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" aria-label={`Edit ${user.firstName} ${user.lastName}`} onClick={() => openEdit(user)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" aria-label={user.status === "suspended" ? `Activate ${user.firstName} ${user.lastName}` : `Suspend ${user.firstName} ${user.lastName}`} onClick={() => toggleStatus(user)} disabled={user.status === "deleted"}>
                        {user.status === "suspended" ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Delete ${user.firstName} ${user.lastName}`} onClick={() => setDeleteTarget(user)} disabled={user.status === "deleted"}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {items.length === 0 ? <EmptyState title="No users found" /> : <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />}
        </>
      ) : null}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit user</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-user-first-name">First name</Label>
                <Input id="edit-user-first-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-user-last-name">Last name</Label>
                <Input id="edit-user-last-name" value={lastName} onChange={(event) => setLastName(event.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-user-phone">Phone number</Label>
              <Input id="edit-user-phone" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this user?"
        description="The user will be soft-deleted and hidden from the active user list."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
