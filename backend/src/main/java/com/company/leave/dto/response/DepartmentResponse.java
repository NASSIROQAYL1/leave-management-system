package com.company.leave.dto.response;

import java.time.LocalDateTime;

public record DepartmentResponse(
    Long id,
    String name,
    String description,
    UserSummaryResponse manager,
    long employeeCount,
    LocalDateTime createdAt
) {
}
