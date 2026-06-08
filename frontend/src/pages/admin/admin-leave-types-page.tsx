import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { leaveTypesApi } from "@/api/leave-types.api";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { ModalShell } from "@/components/ui/modal-shell";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoader } from "@/components/ui/page-loader";
import { getErrorMessage } from "@/lib/http-error";
import type { LeaveType } from "@/types/domain";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

interface LeaveTypeForm {
  name: string;
  description: string;
  colorHex: string;
  maxDaysPerYear: string;
  requiresDocument: boolean;
  paid: boolean;
  active: boolean;
}

const emptyLeaveTypeForm: LeaveTypeForm = {
  name: "",
  description: "",
  colorHex: "#6366F1",
  maxDaysPerYear: "",
  requiresDocument: false,
  paid: true,
  active: true,
};

export function AdminLeaveTypesPage() {
  const [items, setItems] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LeaveType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LeaveType | null>(null);
  const [form, setForm] = useState<LeaveTypeForm>(emptyLeaveTypeForm);

  const load = async () => {
    try {
      setLoading(true);
      setItems(await leaveTypesApi.list());
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load leave types."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyLeaveTypeForm);
    setDialogOpen(true);
  };

  const openEdit = (item: LeaveType) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description ?? "",
      colorHex: item.colorHex,
      maxDaysPerYear: item.maxDaysPerYear ? String(item.maxDaysPerYear) : "",
      requiresDocument: item.requiresDocument,
      paid: item.paid,
      active: item.active,
    });
    setDialogOpen(true);
  };

  const submit = async () => {
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        colorHex: form.colorHex,
        maxDaysPerYear: form.maxDaysPerYear ? Number(form.maxDaysPerYear) : null,
        requiresDocument: form.requiresDocument,
        paid: form.paid,
        active: form.active,
      };
      if (editing) {
        await leaveTypesApi.update(editing.id, payload);
        toast.success("Leave type updated.");
      } else {
        await leaveTypesApi.create(payload);
        toast.success("Leave type created.");
      }
      setDialogOpen(false);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save leave type."));
    }
  };

  const remove = async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      await leaveTypesApi.remove(deleteTarget.id);
      toast.success("Leave type deactivated.");
      setDeleteTarget(null);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to deactivate leave type."));
    }
  };

  const columns = useMemo<ColumnDef<LeaveType>[]>(
    () => [
      {
        header: "Type",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: row.original.colorHex }} />
            <div>
              <p className="font-medium">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">{row.original.description ?? "No description"}</p>
            </div>
          </div>
        ),
      },
      {
        header: "Max / Year",
        cell: ({ row }) => row.original.maxDaysPerYear ?? "—",
      },
      {
        header: "Flags",
        cell: ({ row }) => (
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>{row.original.requiresDocument ? "Requires document" : "No document required"}</p>
            <p>{row.original.paid ? "Paid leave" : "Unpaid leave"}</p>
          </div>
        ),
      },
      {
        header: "Status",
        cell: ({ row }) => (
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${row.original.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
            {row.original.active ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button type="button" onClick={() => openEdit(row.original)} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
              Edit
            </button>
            <button type="button" onClick={() => setDeleteTarget(row.original)} className="rounded-lg border border-danger/20 px-2.5 py-1.5 text-xs font-medium text-danger">
              Deactivate
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  if (loading) {
    return <PageLoader message="Loading leave types..." />;
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Leave Types"
        description="Configure the leave categories available to employees and managers."
        action={
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
            <Plus className="h-4 w-4" />
            Add leave type
          </button>
        }
      />

      <DataTable data={items} columns={columns} emptyMessage="No leave types available." />

      <ModalShell open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? "Edit leave type" : "Create leave type"}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Name</span>
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2.5" />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Description</span>
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="min-h-24 w-full rounded-xl border border-input bg-background px-3 py-2.5" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Color</span>
            <input type="color" value={form.colorHex} onChange={(event) => setForm({ ...form, colorHex: event.target.value })} className="h-11 w-full rounded-xl border border-input bg-background px-2 py-2" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Max days per year</span>
            <input type="number" value={form.maxDaysPerYear} onChange={(event) => setForm({ ...form, maxDaysPerYear: event.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2.5" />
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.requiresDocument} onChange={(event) => setForm({ ...form, requiresDocument: event.target.checked })} />
            Requires document
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.paid} onChange={(event) => setForm({ ...form, paid: event.target.checked })} />
            Paid leave
          </label>
          <label className="inline-flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
            Active
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setDialogOpen(false)} className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground">
            Cancel
          </button>
          <button type="button" onClick={() => void submit()} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Save leave type
          </button>
        </div>
      </ModalShell>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Deactivate leave type"
        description={`Deactivate ${deleteTarget?.name ?? "this leave type"}?`}
        confirmLabel="Deactivate"
        onConfirm={() => void remove()}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}
