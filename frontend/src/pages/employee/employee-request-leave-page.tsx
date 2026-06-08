import { RequestWizard } from "@/components/leave/request-wizard";
import { PageHeader } from "@/components/ui/page-header";

export function EmployeeRequestLeavePage() {
  return (
    <section className="space-y-6">
      <PageHeader
        title="Request Leave"
        description="Create a leave request with working-day calculation, overlap checks, attachment support, and a clear review path."
      />
      <RequestWizard />
    </section>
  );
}
