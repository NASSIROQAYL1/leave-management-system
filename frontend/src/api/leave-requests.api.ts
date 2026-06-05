import { apiClient } from "@/api/axios";
import type { PageResponse } from "@/types/api";
import type { LeaveRequest, OverlapCheckResponse } from "@/types/domain";
import type { LeaveRequestStatus } from "@/types/enums";

export const leaveRequestsApi = {
  create: async (payload: Record<string, unknown>) => {
    const { data } = await apiClient.post<LeaveRequest>("/api/leave-requests", payload);
    return data;
  },
  my: async (params?: { status?: LeaveRequestStatus; year?: number; type?: number }) => {
    const { data } = await apiClient.get<LeaveRequest[]>("/api/leave-requests/my", { params });
    return data;
  },
  cancel: async (id: number) => {
    const { data } = await apiClient.put<LeaveRequest>(`/api/leave-requests/${id}/cancel`);
    return data;
  },
  checkOverlap: async (start: string, end: string) => {
    const { data } = await apiClient.get<OverlapCheckResponse>("/api/leave-requests/check-overlap", {
      params: { start, end },
    });
    return data;
  },
  managerList: async (params?: { status?: LeaveRequestStatus; page?: number; size?: number }) => {
    const { data } = await apiClient.get<PageResponse<LeaveRequest>>("/api/manager/leave-requests", { params });
    return data;
  },
  managerApprove: async (id: number, comment: string) => {
    const { data } = await apiClient.put<LeaveRequest>(`/api/manager/leave-requests/${id}/approve`, { comment });
    return data;
  },
  managerReject: async (id: number, comment: string) => {
    const { data } = await apiClient.put<LeaveRequest>(`/api/manager/leave-requests/${id}/reject`, { comment });
    return data;
  },
  adminList: async (params?: Record<string, unknown>) => {
    const { data } = await apiClient.get<PageResponse<LeaveRequest>>("/api/admin/leave-requests", { params });
    return data;
  },
  adminApprove: async (id: number, comment: string) => {
    const { data } = await apiClient.put<LeaveRequest>(`/api/admin/leave-requests/${id}/approve`, { comment });
    return data;
  },
  adminReject: async (id: number, comment: string) => {
    const { data } = await apiClient.put<LeaveRequest>(`/api/admin/leave-requests/${id}/reject`, { comment });
    return data;
  },
};
