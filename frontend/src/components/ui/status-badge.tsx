import type { LeaveRequestStatus } from "@/types/enums";
import { cn } from "@/lib/cn";

const statusClasses: Record<LeaveRequestStatus, string> = {
  PENDING: "bg-warning/10 text-warning border-warning/20",
  APPROVED_BY_MANAGER: "bg-info/10 text-info border-info/20",
  REJECTED_BY_MANAGER: "bg-danger/10 text-danger border-danger/20",
  APPROVED: "bg-success/10 text-success border-success/20",
  REJECTED: "bg-danger/10 text-danger border-danger/20",
  CANCELLED: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status }: { status: LeaveRequestStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium", statusClasses[status])}>
      <span className="h-2 w-2 rounded-full bg-current" />
      {status.replace(/_/g, " ")}
    </span>
  );
}
