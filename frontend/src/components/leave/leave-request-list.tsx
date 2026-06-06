import { format, formatDistanceToNow, parseISO } from "date-fns";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import type { LeaveRequest } from "@/types/domain";

interface LeaveRequestListProps {
  requests: LeaveRequest[];
  emptyTitle: string;
  emptyDescription: string;
  renderAction?: (request: LeaveRequest) => ReactNode;
  showEmployee?: boolean;
  className?: string;
}

export function LeaveRequestList({
  requests,
  emptyTitle,
  emptyDescription,
  renderAction,
  showEmployee = false,
  className,
}: LeaveRequestListProps) {
  if (requests.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} compact />;
  }

  return (
    <div className={className ?? "space-y-4"}>
      {requests.map((request) => {
        const timelineEntries = [
          request.managerComment
            ? {
                label: "Manager note",
                value: request.managerComment,
              }
            : null,
          request.adminComment
            ? {
                label: "Admin note",
                value: request.adminComment,
              }
            : null,
        ].filter(Boolean) as { label: string; value: string }[];

        return (
          <article key={request.id} className="glass-card space-y-4 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                {showEmployee ? (
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={request.employee.fullName}
                      src={request.employee.profilePicture ?? undefined}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium">{request.employee.fullName}</p>
                      <p className="text-xs text-muted-foreground">{request.employee.email}</p>
                    </div>
                  </div>
                ) : null}
                <div>
                  <p className="font-heading text-lg font-semibold">{request.leaveType.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {format(parseISO(request.startDate), "MMM d, yyyy")} to{" "}
                    {format(parseISO(request.endDate), "MMM d, yyyy")}
                    {" · "}
                    {request.totalDays} day{Number(request.totalDays) === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 md:items-end">
                <StatusBadge status={request.status} />
                <p className="text-xs text-muted-foreground">
                  Submitted {formatDistanceToNow(parseISO(request.createdAt), { addSuffix: true })}
                </p>
                {renderAction ? <div>{renderAction(request)}</div> : null}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Reason</p>
                <p className="mt-2 text-sm">{request.reason || "No reason provided."}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Manager</p>
                <p className="mt-2 text-sm">{request.manager?.fullName ?? "No manager assigned"}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Latest action</p>
                <p className="mt-2 text-sm">
                  {request.adminActionDate
                    ? `Admin on ${format(parseISO(request.adminActionDate), "MMM d, yyyy")}`
                    : request.managerActionDate
                      ? `Manager on ${format(parseISO(request.managerActionDate), "MMM d, yyyy")}`
                      : "Awaiting review"}
                </p>
              </div>
            </div>

            {timelineEntries.length > 0 ? (
              <div className="space-y-2 rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
                {timelineEntries.map((entry) => (
                  <div key={entry.label}>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{entry.label}</p>
                    <p className="mt-1 text-sm">{entry.value}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
