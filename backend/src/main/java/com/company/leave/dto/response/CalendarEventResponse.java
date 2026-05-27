package com.company.leave.dto.response;

import com.company.leave.entity.enums.LeaveRequestStatus;
import java.time.LocalDate;

public record CalendarEventResponse(
    Long id,
    UserSummaryResponse employee,
    LeaveTypeResponse leaveType,
    LocalDate startDate,
    LocalDate endDate,
    LeaveRequestStatus status,
    String label
) {
}
