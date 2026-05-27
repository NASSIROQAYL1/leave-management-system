package com.company.leave.dto.response;

import java.math.BigDecimal;

public record DepartmentLeaveSummaryResponse(
    Long departmentId,
    String departmentName,
    long requestCount,
    BigDecimal totalDays
) {
}
