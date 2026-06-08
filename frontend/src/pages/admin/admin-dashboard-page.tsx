import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardApi } from "@/api/dashboard.api";
import { Avatar } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoader } from "@/components/ui/page-loader";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getErrorMessage } from "@/lib/http-error";
import type { DashboardStats, LeaveRequest } from "@/types/domain";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

const requestColumns: ColumnDef<LeaveRequest>[] = [
  {
    header: "Employee",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.employee.fullName}</p>
        <p className="text-xs text-muted-foreground">{row.original.leaveType.name}</p>
      </div>
    ),
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

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setStats(await dashboardApi.admin());
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load dashboard."));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  if (loading) {
    return <PageLoader message="Loading admin dashboard..." />;
  }

  if (!stats) {
    return (
      <EmptyState
        title="Dashboard unavailable"
        description="The admin dashboard endpoint did not return data."
      />
    );
  }

  return (
    <section className="space-y-8">
      <PageHeader
        title="Admin Dashboard"
        description="High-level visibility into requests, approvals, employees, and departments."
        action={
          <Link to="/admin/requests" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
            Review requests
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending Requests" value={stats.metrics.pending ?? 0} />
        <StatCard label="Approved Requests" value={stats.metrics.approved ?? 0} />
        <StatCard label="Active Employees" value={stats.metrics.employees ?? 0} />
        <StatCard label="Departments" value={stats.metrics.departments ?? 0} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <PageHeader
            title="Recent Requests"
            description="Most recent leave requests across the company."
          />
          <DataTable data={stats.recentRequests} columns={requestColumns} emptyMessage="No recent requests." />
        </div>
        <div className="space-y-4">
          <PageHeader
            title="On Leave Today"
            description="Employees currently absent on approved leave."
          />
          <div className="glass-card space-y-3 p-5">
            {stats.usersOnLeaveToday.length === 0 ? (
              <EmptyState title="Nobody is out today" description="Approved absences will appear here." compact />
            ) : (
              stats.usersOnLeaveToday.map((user) => (
                <div key={user.id} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                  <Avatar name={user.fullName} src={user.profilePicture ?? undefined} size="sm" />
                  <div>
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
