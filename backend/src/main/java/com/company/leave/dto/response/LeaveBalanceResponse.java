package com.company.leave.dto.response;

import java.math.BigDecimal;

public record LeaveBalanceResponse(
    Long id,
    UserSummaryResponse user,
    LeaveTypeResponse leaveType,
    Integer year,
    Integer totalDays,
    BigDecimal usedDays,
    BigDecimal remainingDays
) {
}
