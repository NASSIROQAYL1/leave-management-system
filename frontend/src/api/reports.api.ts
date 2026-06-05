import { apiClient } from "@/api/axios";
import type { EmployeeLeaveReport, ReportSummary } from "@/types/domain";

export const reportsApi = {
  summary: async (params?: { year?: number; deptId?: number }) => {
    const { data } = await apiClient.get<ReportSummary>("/api/admin/reports/summary", { params });
    return data;
  },
  byEmployee: async (params?: { year?: number; deptId?: number }) => {
    const { data } = await apiClient.get<EmployeeLeaveReport[]>("/api/admin/reports/by-employee", { params });
    return data;
  },
  exportPdf: async (params?: { year?: number; deptId?: number }) => {
    const { data } = await apiClient.get<Blob>("/api/admin/reports/export/pdf", { params, responseType: "blob" });
    return data;
  },
  exportExcel: async (params?: { year?: number; deptId?: number }) => {
    const { data } = await apiClient.get<Blob>("/api/admin/reports/export/excel", {
      params,
      responseType: "blob",
    });
    return data;
  },
};
