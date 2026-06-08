import { useEffect, useState } from "react";
import { dashboardApi } from "@/api/dashboard.api";
import { LeaveRequestList } from "@/components/leave/leave-request-list";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoader } from "@/components/ui/page-loader";
import { StatCard } from "@/components/ui/stat-card";
import { getErrorMessage } from "@/lib/http-error";
import type { DashboardStats } from "@/types/domain";
import { toast } from "sonner";

export function ManagerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.manager();
        setStats(response);
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load manager dashboard."));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  if (loading && !stats) {
    return <PageLoader message="Loading manager dashboard..." />;
  }

  if (!stats) {
    return (
      <section className="space-y-6">
        <PageHeader
          title="Manager Dashboard"
          description="Pending team approvals, team leave visibility, and your current leave balance."
        />
        <EmptyState
          title="Dashboard unavailable"
          description="The dashboard data could not be loaded. Try refreshing the page once the backend is available."
        />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Manager Dashboard"
        description="Monitor team approvals, see who is away today, and keep your own leave balances in view."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Pending approvals"
          value={stats.metrics.pendingApprovals ?? 0}
          hint="Requests currently awaiting your action."
        />
        <StatCard
          label="Team members"
          value={stats.metrics.teamMembers ?? 0}
          hint="Employees currently in your reporting scope."
        />
        <StatCard
          label="Away today"
          value={stats.usersOnLeaveToday.length}
          hint="Approved leave currently active across your team."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="space-y-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold">Recent team requests</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Only requests assigned to you are shown here, including items already escalated after your review.
            </p>
          </div>
          <LeaveRequestList
            requests={stats.recentRequests}
            showEmployee
            emptyTitle="No recent team requests"
            emptyDescription="Your queue is clear for now."
          />
        </div>

        <div className="space-y-6">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-xl font-semibold">Team away today</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Approved leave currently active for your direct reports.
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {stats.usersOnLeaveToday.length} active
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {stats.usersOnLeaveToday.length > 0 ? (
                stats.usersOnLeaveToday.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/60 px-4 py-3"
                  >
                    <Avatar name={user.fullName} src={user.profilePicture ?? undefined} size="sm" />
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No one is away today"
                  description="Your team has full attendance at the moment."
                  compact
                />
              )}
            </div>
          </div>

          <div className="glass-card p-5">
            <div>
              <h2 className="font-heading text-xl font-semibold">My leave balances</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Personal balances shown here are your own, not your team&apos;s.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {stats.leaveBalances.length > 0 ? (
                stats.leaveBalances.map((balance) => (
                  <div
                    key={balance.leaveTypeId}
                    className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: balance.colorHex }}
                          aria-hidden="true"
                        />
                        <div>
                          <p className="font-medium">{balance.leaveTypeName}</p>
                          <p className="text-xs text-muted-foreground">{balance.totalDays} allocated days</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">{balance.remainingDays}</p>
                        <p className="text-xs text-muted-foreground">{balance.usedDays} used</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No balances found"
                  description="No leave balances are available for the current year."
                  compact
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
