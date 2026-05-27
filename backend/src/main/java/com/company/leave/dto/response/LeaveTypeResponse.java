package com.company.leave.dto.response;

import java.time.LocalDateTime;

public record LeaveTypeResponse(
    Long id,
    String name,
    String description,
    String colorHex,
    Integer maxDaysPerYear,
    Boolean requiresDocument,
    Boolean paid,
    Boolean active,
    LocalDateTime createdAt
) {
}
