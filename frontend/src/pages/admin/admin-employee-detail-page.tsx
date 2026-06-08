import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { usersApi } from "@/api/users.api";
import { Avatar } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoader } from "@/components/ui/page-loader";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { getErrorMessage } from "@/lib/http-error";
import type { LeaveRequest, User } from "@/types/domain";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

const historyColumns: ColumnDef<LeaveRequest>[] = [
  {
    header: "Type",
    cell: ({ row }) => row.original.leaveType.name,
  },
  {
    header: "Dates",
    cell: ({ row }) => `${row.original.startDate} → ${row.original.endDate}`,
  },
  {
    header: "Days",
    cell: ({ row }) => row.original.totalDays,
  },
  {
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export function AdminEmployeeDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }
      try {
        const [userData, leaveHistory] = await Promise.all([usersApi.getById(Number(id)), usersApi.leaveHistory(Number(id))]);
        setUser(userData);
        setHistory(leaveHistory);
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load employee details."));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  if (loading) {
    return <PageLoader message="Loading employee profile..." />;
  }

  if (!user) {
    return <EmptyState title="Employee not found" description="The requested employee record could not be loaded." />;
  }

  const approvedDays = history
    .filter((item) => item.status === "APPROVED")
    .reduce((total, item) => total + Number(item.totalDays), 0);

  return (
    <section className="space-y-8">
      <PageHeader
        title={user.fullName}
        description="Profile details and complete leave history."
        action={
          <Link to="/admin/employees" className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground">
            Back to employees
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <Avatar name={user.fullName} src={user.profilePicture ?? undefined} size="lg" />
            <div>
              <p className="font-heading text-2xl font-semibold">{user.fullName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Role</dt>
              <dd className="mt-1 text-sm font-medium">{user.role}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Department</dt>
              <dd className="mt-1 text-sm font-medium">{user.department?.name ?? "Unassigned"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Manager</dt>
              <dd className="mt-1 text-sm font-medium">{user.manager?.fullName ?? "None"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Phone</dt>
              <dd className="mt-1 text-sm font-medium">{user.phone ?? "Not provided"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Hire date</dt>
              <dd className="mt-1 text-sm font-medium">{user.hireDate ?? "Not set"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Status</dt>
              <dd className="mt-1 text-sm font-medium">{user.active ? "Active" : "Inactive"}</dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <StatCard label="Total Requests" value={history.length} />
          <StatCard label="Approved Days" value={approvedDays.toFixed(1)} />
        </div>
      </div>

      <div>
        <PageHeader title="Leave History" description="All requests submitted by this employee." />
        <DataTable data={history} columns={historyColumns} emptyMessage="No leave history available." />
      </div>
    </section>
  );
}
