import { useEffect, useState } from "react";
import { ModalShell } from "@/components/ui/modal-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import type { LeaveRequest } from "@/types/domain";

interface RequestReviewModalProps {
  request: LeaveRequest | null;
  open: boolean;
  onClose: () => void;
  onApprove: (comment: string) => Promise<void>;
  onReject: (comment: string) => Promise<void>;
  submitting: boolean;
}

export function RequestReviewModal({
  request,
  open,
  onClose,
  onApprove,
  onReject,
  submitting,
}: RequestReviewModalProps) {
  const [comment, setComment] = useState("");

  useEffect(() => {
    setComment(request?.managerComment ?? "");
  }, [request]);

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Review team request"
      description={request ? `${request.employee.fullName} · ${request.leaveType.name}` : undefined}
    >
      {request ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Dates</p>
              <p className="mt-1 text-sm font-medium">
                {request.startDate} to {request.endDate}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
              <div className="mt-2">
                <StatusBadge status={request.status} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Reason</p>
            <p className="mt-2 text-sm">{request.reason || "No reason provided."}</p>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium">Manager comment</span>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="min-h-28 w-full rounded-xl border border-input bg-background px-3 py-2.5"
              placeholder="Add the context the backend stores with this decision."
            />
          </label>

          <p className="text-xs text-muted-foreground">
            This workflow currently requires a non-empty review comment for both approval and rejection.
          </p>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => void onReject(comment)}
              disabled={submitting}
              className="rounded-xl bg-danger px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => void onApprove(comment)}
              disabled={submitting}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              Approve
            </button>
          </div>
        </div>
      ) : null}
    </ModalShell>
  );
}
