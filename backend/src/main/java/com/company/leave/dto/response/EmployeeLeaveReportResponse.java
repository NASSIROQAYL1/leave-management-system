package com.company.leave.dto.response;

import java.math.BigDecimal;

public record EmployeeLeaveReportResponse(
    Long userId,
    String employeeName,
    String departmentName,
    long requestCount,
    BigDecimal totalDaysApproved,
    BigDecimal totalDaysPending,
    BigDecimal totalDaysRejected
) {
}
