import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarRange, Clock3, Plus } from "lucide-react";
import { dashboardApi } from "@/api/dashboard.api";
import { LeaveBalanceRing } from "@/components/leave/leave-balance-ring";
import { LeaveRequestList } from "@/components/leave/leave-request-list";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoader } from "@/components/ui/page-loader";
import { StatCard } from "@/components/ui/stat-card";
import { getErrorMessage } from "@/lib/http-error";
import type { DashboardStats } from "@/types/domain";
import { toast } from "sonner";

export function EmployeeDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.employee();
        setStats(response);
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load employee dashboard."));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const approvedUpcoming = useMemo(
    () =>
      (stats?.recentRequests ?? []).filter((request) => request.status === "APPROVED" || request.status === "APPROVED_BY_MANAGER"),
    [stats?.recentRequests],
  );

  if (loading && !stats) {
    return <PageLoader message="Loading employee dashboard..." />;
  }

  if (!stats) {
    return (
      <section className="space-y-6">
        <PageHeader title="Employee Dashboard" description="Balance overview, upcoming leave, and recent activity." />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Employee Dashboard"
        description="Track balances, upcoming approved leave, and recent request activity in one place."
        action={
          <Link
            to="/employee/request-leave"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            New Request
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Pending requests" value={stats.metrics.pending ?? 0} hint="Awaiting review by your chain." />
        <StatCard label="Approved requests" value={stats.metrics.approved ?? 0} hint="Approved in your recent activity window." />
        <StatCard label="Balances tracked" value={stats.leaveBalances.length} hint="Leave types with annual balance records." />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.leaveBalances.map((balance) => (
          <LeaveBalanceRing
            key={balance.leaveTypeId}
            label={balance.leaveTypeName}
            total={balance.totalDays}
            used={balance.usedDays}
            remaining={balance.remainingDays}
            colorHex={balance.colorHex}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold">Upcoming approved leave</h2>
            <p className="mt-1 text-sm text-muted-foreground">Your approved and manager-approved leave appears here first.</p>
          </div>
          {approvedUpcoming.length > 0 ? (
            <LeaveRequestList
              requests={approvedUpcoming}
              emptyTitle="No approved leave ahead"
              emptyDescription="Approved time away will appear here."
            />
          ) : (
            <div className="glass-card flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-info/10 p-3 text-info">
                <CalendarRange className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">No upcoming approved leave</p>
                <p className="mt-1 text-sm text-muted-foreground">Create a new request when you are ready to plan time away.</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold">Recent activity</h2>
            <p className="mt-1 text-sm text-muted-foreground">The latest requests and decisions affecting your account.</p>
          </div>
          <div className="space-y-3">
            {stats.recentRequests.map((request) => (
              <article key={request.id} className="glass-card flex gap-4 p-4">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{request.leaveType.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {request.startDate} to {request.endDate} · {request.status.replace(/_/g, " ")}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {request.managerComment || request.adminComment || request.reason || "No additional note."}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
