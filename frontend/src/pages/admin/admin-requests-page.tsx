import { useEffect, useMemo, useState } from "react";
import { leaveRequestsApi } from "@/api/leave-requests.api";
import { Avatar } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import { ModalShell } from "@/components/ui/modal-shell";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoader } from "@/components/ui/page-loader";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { StatusBadge } from "@/components/ui/status-badge";
import { getErrorMessage } from "@/lib/http-error";
import type { LeaveRequest } from "@/types/domain";
import type { LeaveRequestStatus } from "@/types/enums";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

export function AdminRequestsPage() {
  const [items, setItems] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState<"" | LeaveRequestStatus>("");
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [comment, setComment] = useState("");

  const load = async (requestedPage = page) => {
    try {
      setLoading(true);
      const response = await leaveRequestsApi.adminList({
        page: requestedPage,
        size: 10,
        status: status || undefined,
      });
      setItems(response.content);
      setPage(response.page);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load leave requests."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(0);
  }, [status]);

  const act = async (action: "approve" | "reject") => {
    if (!selectedRequest) {
      return;
    }
    if (!comment.trim()) {
      toast.error("A comment is required for this action.");
      return;
    }
    try {
      if (action === "approve") {
        await leaveRequestsApi.adminApprove(selectedRequest.id, comment);
        toast.success("Request approved.");
      } else {
        await leaveRequestsApi.adminReject(selectedRequest.id, comment);
        toast.success("Request rejected.");
      }
      setSelectedRequest(null);
      setComment("");
      await load(page);
    } catch (error) {
      toast.error(getErrorMessage(error, `Unable to ${action} request.`));
    }
  };

  const columns = useMemo<ColumnDef<LeaveRequest>[]>(
    () => [
      {
        header: "Employee",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.original.employee.fullName} src={row.original.employee.profilePicture ?? undefined} size="sm" />
            <div>
              <p className="font-medium">{row.original.employee.fullName}</p>
              <p className="text-xs text-muted-foreground">{row.original.leaveType.name}</p>
            </div>
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
      {
        header: "Actions",
        cell: ({ row }) => (
          <button type="button" onClick={() => {
            setSelectedRequest(row.original);
            setComment(row.original.adminComment ?? "");
          }} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
            Review
          </button>
        ),
      },
    ],
    [],
  );

  if (loading && items.length === 0) {
    return <PageLoader message="Loading company leave requests..." />;
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="All Requests"
        description="Review company-wide leave requests and take final admin action when required."
        action={
          <select value={status} onChange={(event) => setStatus(event.target.value as "" | LeaveRequestStatus)} className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm">
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED_BY_MANAGER">Approved by manager</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        }
      />

      <DataTable data={items} columns={columns} emptyMessage="No requests found for the selected status." />
      <PaginationControls page={page} totalPages={totalPages} onPrevious={() => void load(Math.max(0, page - 1))} onNext={() => void load(page + 1)} />

      <ModalShell
        open={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        title="Review leave request"
        description={selectedRequest ? `${selectedRequest.employee.fullName} • ${selectedRequest.leaveType.name}` : undefined}
      >
        {selectedRequest ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Dates</p>
                <p className="mt-1 text-sm font-medium">{selectedRequest.startDate} → {selectedRequest.endDate}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                <div className="mt-2"><StatusBadge status={selectedRequest.status} /></div>
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Reason</p>
              <p className="mt-2 text-sm">{selectedRequest.reason || "No reason provided."}</p>
            </div>
            <label className="space-y-2">
              <span className="text-sm font-medium">Admin comment</span>
              <textarea value={comment} onChange={(event) => setComment(event.target.value)} className="min-h-28 w-full rounded-xl border border-input bg-background px-3 py-2.5" />
            </label>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => void act("reject")} className="rounded-xl bg-danger px-4 py-2 text-sm font-medium text-white">
                Reject
              </button>
              <button type="button" onClick={() => void act("approve")} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                Approve
              </button>
            </div>
          </div>
        ) : null}
      </ModalShell>
    </section>
  );
}
