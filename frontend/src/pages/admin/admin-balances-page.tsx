import { useEffect, useMemo, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { leaveBalancesApi } from "@/api/leave-balances.api";
import { DataTable } from "@/components/ui/data-table";
import { ModalShell } from "@/components/ui/modal-shell";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoader } from "@/components/ui/page-loader";
import { getErrorMessage } from "@/lib/http-error";
import type { LeaveBalance } from "@/types/domain";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

interface BalanceForm {
  totalDays: string;
  usedDays: string;
}

export function AdminBalancesPage() {
  const [items, setItems] = useState<LeaveBalance[]>([]);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<LeaveBalance | null>(null);
  const [form, setForm] = useState<BalanceForm>({ totalDays: "", usedDays: "" });
  const [initializing, setInitializing] = useState(false);

  const load = async (selectedYear = year) => {
    try {
      setLoading(true);
      setItems(await leaveBalancesApi.list({ year: Number(selectedYear) }));
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load leave balances."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [year]);

  const openAdjust = (balance: LeaveBalance) => {
    setSelectedBalance(balance);
    setForm({
      totalDays: String(balance.totalDays),
      usedDays: String(balance.usedDays),
    });
    setDialogOpen(true);
  };

  const submitAdjustment = async () => {
    if (!selectedBalance) {
      return;
    }
    try {
      await leaveBalancesApi.adjust(selectedBalance.id, {
        totalDays: Number(form.totalDays),
        usedDays: Number(form.usedDays),
      });
      toast.success("Leave balance updated.");
      setDialogOpen(false);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to adjust leave balance."));
    }
  };

  const initializeYear = async () => {
    try {
      setInitializing(true);
      const response = await leaveBalancesApi.initializeYear({ year: Number(year) });
      toast.success(`Initialized ${response.createdRecords} balance records for ${response.year}.`);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to initialize balances."));
    } finally {
      setInitializing(false);
    }
  };

  const columns = useMemo<ColumnDef<LeaveBalance>[]>(
    () => [
      {
        header: "Employee",
        cell: ({ row }) => row.original.user?.fullName ?? "—",
      },
      {
        header: "Leave Type",
        cell: ({ row }) => row.original.leaveType.name,
      },
      {
        header: "Total",
        cell: ({ row }) => row.original.totalDays,
      },
      {
        header: "Used",
        cell: ({ row }) => row.original.usedDays,
      },
      {
        header: "Remaining",
        cell: ({ row }) => row.original.remainingDays,
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <button type="button" onClick={() => openAdjust(row.original)} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
            Adjust
          </button>
        ),
      },
    ],
    [],
  );

  if (loading && items.length === 0) {
    return <PageLoader message="Loading balances..." />;
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Leave Balances"
        description="Review and adjust annual leave allocations for all employees."
        action={
          <div className="flex items-center gap-3">
            <input type="number" value={year} onChange={(event) => setYear(event.target.value)} className="w-28 rounded-xl border border-input bg-background px-3 py-2.5 text-sm" />
            <button
              type="button"
              onClick={() => void initializeYear()}
              disabled={initializing}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              <RefreshCcw className="h-4 w-4" />
              {initializing ? "Initializing..." : "Initialize year"}
            </button>
          </div>
        }
      />

      <DataTable data={items} columns={columns} emptyMessage="No leave balances found for the selected year." />

      <ModalShell open={dialogOpen} onClose={() => setDialogOpen(false)} title="Adjust leave balance">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Total days</span>
            <input type="number" value={form.totalDays} onChange={(event) => setForm({ ...form, totalDays: event.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2.5" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Used days</span>
            <input type="number" step="0.5" value={form.usedDays} onChange={(event) => setForm({ ...form, usedDays: event.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2.5" />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setDialogOpen(false)} className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground">
            Cancel
          </button>
          <button type="button" onClick={() => void submitAdjustment()} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Save balance
          </button>
        </div>
      </ModalShell>
    </section>
  );
}
