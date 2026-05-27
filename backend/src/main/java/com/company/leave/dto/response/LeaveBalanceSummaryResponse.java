package com.company.leave.dto.response;

import java.math.BigDecimal;

public record LeaveBalanceSummaryResponse(
    Long leaveTypeId,
    String leaveTypeName,
    String colorHex,
    Integer totalDays,
    BigDecimal usedDays,
    BigDecimal remainingDays
) {
}
