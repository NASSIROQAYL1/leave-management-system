import { useEffect, useState } from "react";
import { leaveRequestsApi } from "@/api/leave-requests.api";
import { LeaveRequestList } from "@/components/leave/leave-request-list";
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

export function ManagerMyRequestsPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"" | LeaveRequestStatus>("");
  const [year, setYear] = useState(currentYear);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

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

  const cancelRequest = async (requestId: number) => {
    try {
      setCancellingId(requestId);
      await leaveRequestsApi.cancel(requestId);
      toast.success("Request cancelled.");
      await load(status, year);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to cancel request."));
    } finally {
      setCancellingId(null);
    }
  };

  if (loading && requests.length === 0) {
    return <PageLoader message="Loading your leave requests..." />;
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="My Requests"
        description="Track your own leave requests as a manager. These are your personal requests, not your team approvals."
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
              <option value="CANCELLED">Cancelled</option>
            </select>
            <input
              type="number"
              value={year}
              min={2020}
              max={2100}
              onChange={(event) => setYear(Number(event.target.value))}
              className="w-28 rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
            />
          </div>
        }
      />

      <LeaveRequestList
        requests={requests}
        emptyTitle="No requests found"
        emptyDescription="You do not have personal leave requests for the selected filters."
        renderAction={(request) =>
          canCancel(request.status) ? (
            <button
              type="button"
              onClick={() => void cancelRequest(request.id)}
              disabled={cancellingId === request.id}
              className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-medium text-danger transition hover:bg-danger/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancellingId === request.id ? "Cancelling..." : "Cancel request"}
            </button>
          ) : null
        }
      />
    </section>
  );
}
