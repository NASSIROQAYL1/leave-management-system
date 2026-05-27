package com.company.leave.dto.response;

import java.util.List;
import java.util.Map;

public record ReportSummaryResponse(
    Map<String, Number> metrics,
    List<DepartmentLeaveSummaryResponse> departments
) {
}
