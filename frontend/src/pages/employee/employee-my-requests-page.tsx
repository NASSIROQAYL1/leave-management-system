import { useEffect, useState } from "react";
import { leaveRequestsApi } from "@/api/leave-requests.api";
import { LeaveRequestList } from "@/components/leave/leave-request-list";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoader } from "@/components/ui/page-loader";
import { getErrorMessage } from "@/lib/http-error";
import type { LeaveRequest } from "@/types/domain";
import type { LeaveRequestStatus } from "@/types/enums";
import { toast } from "sonner";

const currentYear = new Date().getFullYear();

function canCancel(status: LeaveRequestStatus) {
  return status === "PENDING" || status === "APPROVED_BY_MANAGER";
}

export function EmployeeMyRequestsPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"" | LeaveRequestStatus>("");
  const [year, setYear] = useState(currentYear);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async (nextStatus = status, nextYear = year) => {
    try {
      setLoading(true);
      const response = await leaveRequestsApi.my({
        status: nextStatus || undefined,
        year: nextYear,
      });
      setRequests(response);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load your requests."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(status, year);
  }, [status, year]);

  const cancelRequest = async () => {
    if (!selectedRequest) {
      return;
    }

    try {
      setSubmitting(true);
      await leaveRequestsApi.cancel(selectedRequest.id);
      toast.success("Request cancelled.");
      setSelectedRequest(null);
      await load(status, year);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to cancel this request."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && requests.length === 0) {
    return <PageLoader message="Loading your requests..." />;
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="My Requests"
        description="Review your leave history, see status changes, and cancel requests that are still open for cancellation."
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as "" | LeaveRequestStatus)}
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED_BY_MANAGER">Approved by manager</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="REJECTED_BY_MANAGER">Rejected by manager</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <input
              type="number"
              min={2020}
              max={2100}
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="w-28 rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
            />
          </div>
        }
      />

      <LeaveRequestList
        requests={requests}
        emptyTitle="No requests found"
        emptyDescription="No leave requests match the current filters."
        renderAction={(request) =>
          canCancel(request.status) ? (
            <button
              type="button"
              onClick={() => setSelectedRequest(request)}
              className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-medium text-danger transition hover:bg-danger/15"
            >
              Cancel request
            </button>
          ) : null
        }
      />

      <ConfirmDialog
        open={Boolean(selectedRequest)}
        title="Cancel leave request"
        description={
          selectedRequest
            ? `Cancel ${selectedRequest.leaveType.name} from ${selectedRequest.startDate} to ${selectedRequest.endDate}?`
            : ""
        }
        confirmLabel={submitting ? "Cancelling..." : "Cancel request"}
        onCancel={() => setSelectedRequest(null)}
        onConfirm={() => void cancelRequest()}
      />
    </section>
  );
}
