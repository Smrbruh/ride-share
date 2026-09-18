"use client";
import * as React from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import { formatDateOnly } from "@/lib/utils";
import type { PromoCodeDto } from "@/types/api";
interface FormState {
  code: string;
  discountPercent: string;
  validFrom: string;
  validTo: string;
  maxUsage: string;
}
const EMPTY_FORM: FormState = { code: "", discountPercent: "", validFrom: "", validTo: "", maxUsage: "" };
export default function AdminPromoCodesPage() {
  const { toast } = useToast();
  const { items, total, page, setPage, error, load, pageSize } = useAdminCrud<PromoCodeDto>("/api/admin/promo-codes");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PromoCodeDto | null>(null);
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<PromoCodeDto | null>(null);
  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };
  const openEdit = (promo: PromoCodeDto) => {
    setEditing(promo);
    setForm({
      code: promo.code,
      discountPercent: String(promo.discountPercent),
      validFrom: promo.validFrom.slice(0, 10),
      validTo: promo.validTo.slice(0, 10),
      maxUsage: String(promo.maxUsage)
    });
    setDialogOpen(true);
  };
  const handleSave = async () => {
    setSaving(true);
    const body = {
      code: form.code,
      discountPercent: Number(form.discountPercent),
      validFrom: form.validFrom,
      validTo: form.validTo,
      maxUsage: Number(form.maxUsage)
    };
    try {
      if (editing) await apiFetch(`/api/admin/promo-codes/${editing.id}`, { method: "PATCH", body });
      else await apiFetch("/api/admin/promo-codes", { method: "POST", body });
      toast({ title: editing ? "Promo code updated" : "Promo code created", variant: "success" });
      setDialogOpen(false);
      load();
    } catch (saveError) {
      toast({ title: "Could not save promo code", description: saveError instanceof ApiError ? saveError.message : undefined, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/api/admin/promo-codes/${deleteTarget.id}`, { method: "DELETE" });
      toast({ title: "Promo code deleted", variant: "success" });
      setDeleteTarget(null);
      load();
    } catch (deleteError) {
      toast({ title: "Could not delete promo code", description: deleteError instanceof ApiError ? deleteError.message : undefined, variant: "destructive" });
    }
  };
  if (error) return <EmptyState title="Could not load promo codes" description={error} />;
  if (!items) return <TableSkeleton />;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> New promo code</Button>
      </div>
      {items.length === 0 ? (
        <EmptyState title="No promo codes yet" />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Valid from</TableHead>
                <TableHead>Valid to</TableHead>
                <TableHead>Max usage</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-medium">{promo.code}</TableCell>
                  <TableCell>{promo.discountPercent}%</TableCell>
                  <TableCell>{formatDateOnly(promo.validFrom)}</TableCell>
                  <TableCell>{formatDateOnly(promo.validTo)}</TableCell>
                  <TableCell>{promo.maxUsage}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" aria-label={`Edit promo code ${promo.code}`} onClick={() => openEdit(promo)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" aria-label={`Delete promo code ${promo.code}`} onClick={() => setDeleteTarget(promo)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit promo code" : "New promo code"}</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="promo-code">Code</Label>
              <Input id="promo-code" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="promo-discount">Discount percent</Label>
              <Input id="promo-discount" type="number" value={form.discountPercent} onChange={(event) => setForm({ ...form, discountPercent: event.target.value })} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="promo-valid-from">Valid from</Label>
                <Input id="promo-valid-from" type="date" value={form.validFrom} onChange={(event) => setForm({ ...form, validFrom: event.target.value })} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="promo-valid-to">Valid to</Label>
                <Input id="promo-valid-to" type="date" value={form.validTo} onChange={(event) => setForm({ ...form, validTo: event.target.value })} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="promo-max-usage">Max usage</Label>
              <Input id="promo-max-usage" type="number" value={form.maxUsage} onChange={(event) => setForm({ ...form, maxUsage: event.target.value })} />
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
        title="Delete this promo code?"
        description="Promo codes that have already been used can't be deleted."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
