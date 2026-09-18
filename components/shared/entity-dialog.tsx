"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
interface EntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  entityLabel: string;
  saving: boolean;
  error?: string | null;
  onSave: () => void;
  children: React.ReactNode;
}
export function EntityDialog({ open, onOpenChange, mode, entityLabel, saving, error, onSave, children }: EntityDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? `New ${entityLabel}` : `Edit ${entityLabel}`}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {error ? <Alert variant="destructive">{error}</Alert> : null}
          {children}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
