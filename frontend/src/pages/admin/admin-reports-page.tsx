import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { departmentsApi } from "@/api/departments.api";
import { reportsApi } from "@/api/reports.api";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoader } from "@/components/ui/page-loader";
import { StatCard } from "@/components/ui/stat-card";
import { downloadBlob } from "@/lib/download";
import { getErrorMessage } from "@/lib/http-error";
import type { Department, DepartmentLeaveSummary, EmployeeLeaveReport, ReportSummary } from "@/types/domain";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

const employeeColumns: ColumnDef<EmployeeLeaveReport>[] = [
  {
    header: "Employee",
    cell: ({ row }) => row.original.employeeName,
  },
  {
    header: "Department",
    cell: ({ row }) => row.original.departmentName ?? "—",
  },
  {
    header: "Requests",
    cell: ({ row }) => row.original.requestCount,
  },
  {
    header: "Approved",
    cell: ({ row }) => row.original.totalDaysApproved,
  },
  {
    header: "Pending",
    cell: ({ row }) => row.original.totalDaysPending,
  },
  {
    header: "Rejected",
    cell: ({ row }) => row.original.totalDaysRejected,
  },
];

export function AdminReportsPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [employeeRows, setEmployeeRows] = useState<EmployeeLeaveReport[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [deptId, setDeptId] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const params = {
        year: Number(year),
        deptId: deptId ? Number(deptId) : undefined,
      };
      const [summaryResponse, employeesResponse, departmentsResponse] = await Promise.all([
        reportsApi.summary(params),
        reportsApi.byEmployee(params),
        departmentsApi.list(),
      ]);
      setSummary(summaryResponse);
      setEmployeeRows(employeesResponse);
      setDepartments(departmentsResponse);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load reports."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [year, deptId]);

  const exportReport = async (type: "pdf" | "excel") => {
    try {
      const params = {
        year: Number(year),
        deptId: deptId ? Number(deptId) : undefined,
      };
      const blob = type === "pdf" ? await reportsApi.exportPdf(params) : await reportsApi.exportExcel(params);
      downloadBlob(blob, `leave-report-${year}.${type === "pdf" ? "pdf" : "xlsx"}`);
      toast.success(`Exported ${type.toUpperCase()} report.`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to export report."));
    }
  };

  const departmentSummaryRows = useMemo(() => summary?.departments ?? [], [summary]);

  if (loading && !summary) {
    return <PageLoader message="Loading reports..." />;
  }

  return (
    <section className="space-y-8">
      <PageHeader
        title="Reports"
        description="Review leave activity by department and employee, then export for stakeholders."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <input type="number" value={year} onChange={(event) => setYear(event.target.value)} className="w-28 rounded-xl border border-input bg-background px-3 py-2.5 text-sm" />
            <select value={deptId} onChange={(event) => setDeptId(event.target.value)} className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm">
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => void exportReport("pdf")} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground">
              <Download className="h-4 w-4" />
              PDF
            </button>
            <button type="button" onClick={() => void exportReport("excel")} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
              <Download className="h-4 w-4" />
              Excel
            </button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Requests" value={summary?.metrics.requests ?? 0} />
        <StatCard label="Approved" value={summary?.metrics.approved ?? 0} />
        <StatCard label="Departments in Report" value={departmentSummaryRows.length} />
        <StatCard label="Employees in Report" value={employeeRows.length} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-card p-5">
          <h2 className="font-heading text-xl font-semibold">Department Summary</h2>
          <p className="mt-1 text-sm text-muted-foreground">Aggregated request volume and total leave days by department.</p>
          <div className="mt-5 space-y-3">
            {departmentSummaryRows.length === 0 ? (
              <EmptyState title="No department data" description="No matching leave requests were found for the selected filters." compact />
            ) : (
              departmentSummaryRows.map((department) => (
                <div key={department.departmentId} className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{department.departmentName}</p>
                      <p className="text-xs text-muted-foreground">{department.requestCount} requests</p>
                    </div>
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {department.totalDays} days
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="font-heading text-xl font-semibold">By Employee</h2>
          <p className="mt-1 text-sm text-muted-foreground">Detailed breakdown of approved, pending, and rejected days.</p>
          <div className="mt-5">
            <DataTable data={employeeRows} columns={employeeColumns} emptyMessage="No employee report rows available." />
          </div>
        </div>
      </div>
    </section>
  );
}
