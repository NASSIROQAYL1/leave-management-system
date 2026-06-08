import { useEffect, useMemo, useState } from "react";
import { leaveRequestsApi } from "@/api/leave-requests.api";
import { RequestReviewModal } from "@/components/leave/request-review-modal";
import { Avatar } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoader } from "@/components/ui/page-loader";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { StatusBadge } from "@/components/ui/status-badge";
import { getErrorMessage } from "@/lib/http-error";
import type { LeaveRequest } from "@/types/domain";
import type { LeaveRequestStatus } from "@/types/enums";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

export function ManagerRequestsPage() {
  const [items, setItems] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState<"" | LeaveRequestStatus>("PENDING");
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  const load = async (requestedPage = page) => {
    try {
      setLoading(true);
      const response = await leaveRequestsApi.managerList({
        page: requestedPage,
        size: 10,
        status: status || undefined,
      });
      setItems(response.content);
      setPage(response.page);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load team requests."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(0);
  }, [status]);

  const submitAction = async (action: "approve" | "reject", comment: string) => {
    if (!selectedRequest) {
      return;
    }
    if (!comment.trim()) {
      toast.error("A manager comment is required.");
      return;
    }

    try {
      setSubmitting(true);
      if (action === "approve") {
        await leaveRequestsApi.managerApprove(selectedRequest.id, comment.trim());
        toast.success("Request approved.");
      } else {
        await leaveRequestsApi.managerReject(selectedRequest.id, comment.trim());
        toast.success("Request rejected.");
      }
      setSelectedRequest(null);
      await load(page);
    } catch (error) {
      toast.error(getErrorMessage(error, `Unable to ${action} request.`));
    } finally {
      setSubmitting(false);
    }
  };

  const columns = useMemo<ColumnDef<LeaveRequest>[]>(
    () => [
      {
        header: "Employee",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar
              name={row.original.employee.fullName}
              src={row.original.employee.profilePicture ?? undefined}
              size="sm"
            />
            <div>
              <p className="font-medium">{row.original.employee.fullName}</p>
              <p className="text-xs text-muted-foreground">{row.original.leaveType.name}</p>
            </div>
          </div>
        ),
      },
      {
        header: "Dates",
        cell: ({ row }) => `${row.original.startDate} to ${row.original.endDate}`,
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
        header: "Manager note",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.managerComment || "No comment yet"}
          </span>
        ),
      },
      {
        header: "Action",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => setSelectedRequest(row.original)}
            disabled={row.original.status !== "PENDING"}
            className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {row.original.status === "PENDING" ? "Review" : "Read"}
          </button>
        ),
      },
    ],
    [],
  );

  if (loading && items.length === 0) {
    return <PageLoader message="Loading team requests..." />;
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Team Requests"
        description="Review leave requests from your direct reports only. Final status is still visible after you act."
        action={
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as "" | LeaveRequestStatus)}
            className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED_BY_MANAGER">Approved by manager</option>
            <option value="REJECTED_BY_MANAGER">Rejected by manager</option>
            <option value="APPROVED">Approved</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        }
      />

      <DataTable
        data={items}
        columns={columns}
        emptyMessage="No requests found for your team in the selected status."
      />
      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPrevious={() => void load(Math.max(0, page - 1))}
        onNext={() => void load(page + 1)}
      />

      <RequestReviewModal
        request={selectedRequest}
        open={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        onApprove={(comment) => submitAction("approve", comment)}
        onReject={(comment) => submitAction("reject", comment)}
        submitting={submitting}
      />
    </section>
  );
}
