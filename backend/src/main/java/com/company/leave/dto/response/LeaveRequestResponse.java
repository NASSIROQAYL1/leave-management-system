package com.company.leave.dto.response;

import com.company.leave.entity.enums.LeaveRequestStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record LeaveRequestResponse(
    Long id,
    UserSummaryResponse employee,
    LeaveTypeResponse leaveType,
    LocalDate startDate,
    LocalDate endDate,
    BigDecimal totalDays,
    LeaveRequestStatus status,
    String reason,
    String attachmentUrl,
    UserSummaryResponse manager,
    String managerComment,
    LocalDateTime managerActionDate,
    UserSummaryResponse admin,
    String adminComment,
    LocalDateTime adminActionDate,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
