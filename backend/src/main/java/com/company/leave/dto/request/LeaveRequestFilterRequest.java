package com.company.leave.dto.request;

import com.company.leave.entity.enums.LeaveRequestStatus;
import java.time.LocalDate;

public record LeaveRequestFilterRequest(
    LeaveRequestStatus status,
    Integer year,
    Long leaveTypeId,
    Long departmentId,
    LocalDate fromDate,
    LocalDate toDate,
    String search
) {
}
