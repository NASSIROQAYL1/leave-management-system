import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { publicHolidaysApi } from "@/api/public-holidays.api";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { ModalShell } from "@/components/ui/modal-shell";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoader } from "@/components/ui/page-loader";
import { getErrorMessage } from "@/lib/http-error";
import type { PublicHoliday } from "@/types/domain";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

interface HolidayForm {
  name: string;
  date: string;
  year: string;
  recurring: boolean;
}

const emptyHolidayForm: HolidayForm = {
  name: "",
  date: "",
  year: String(new Date().getFullYear()),
  recurring: false,
};

export function AdminHolidaysPage() {
  const [items, setItems] = useState<PublicHoliday[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PublicHoliday | null>(null);
  const [form, setForm] = useState<HolidayForm>(emptyHolidayForm);

  const load = async (selectedYear = year) => {
    try {
      setLoading(true);
      setItems(await publicHolidaysApi.list(Number(selectedYear)));
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load public holidays."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [year]);

  const create = async () => {
    try {
      await publicHolidaysApi.create({
        name: form.name,
        date: form.date,
        year: Number(form.year),
        recurring: form.recurring,
      });
      toast.success("Holiday created.");
      setDialogOpen(false);
      setForm(emptyHolidayForm);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to create holiday."));
    }
  };

  const remove = async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      await publicHolidaysApi.remove(deleteTarget.id);
      toast.success("Holiday deleted.");
      setDeleteTarget(null);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete holiday."));
    }
  };

  const columns = useMemo<ColumnDef<PublicHoliday>[]>(
    () => [
      {
        header: "Holiday",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.recurring ? "Recurring" : "One-time"}</p>
          </div>
        ),
      },
      {
        header: "Date",
        cell: ({ row }) => row.original.date,
      },
      {
        header: "Year",
        cell: ({ row }) => row.original.year,
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <button type="button" onClick={() => setDeleteTarget(row.original)} className="rounded-lg border border-danger/20 px-2.5 py-1.5 text-xs font-medium text-danger">
            Delete
          </button>
        ),
      },
    ],
    [],
  );

  if (loading && items.length === 0) {
    return <PageLoader message="Loading holidays..." />;
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Public Holidays"
        description="Maintain company holiday dates that affect working-day calculations."
        action={
          <div className="flex items-center gap-3">
            <input type="number" value={year} onChange={(event) => setYear(event.target.value)} className="w-28 rounded-xl border border-input bg-background px-3 py-2.5 text-sm" />
            <button type="button" onClick={() => setDialogOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
              <Plus className="h-4 w-4" />
              Add holiday
            </button>
          </div>
        }
      />

      <DataTable data={items} columns={columns} emptyMessage="No public holidays defined for the selected year." />

      <ModalShell open={dialogOpen} onClose={() => setDialogOpen(false)} title="Create public holiday">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Name</span>
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2.5" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Date</span>
            <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2.5" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Year</span>
            <input type="number" value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2.5" />
          </label>
          <label className="inline-flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={form.recurring} onChange={(event) => setForm({ ...form, recurring: event.target.checked })} />
            Recurring holiday
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setDialogOpen(false)} className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground">
            Cancel
          </button>
          <button type="button" onClick={() => void create()} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Save holiday
          </button>
        </div>
      </ModalShell>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete holiday"
        description={`Delete ${deleteTarget?.name ?? "this holiday"}?`}
        confirmLabel="Delete"
        onConfirm={() => void remove()}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}
