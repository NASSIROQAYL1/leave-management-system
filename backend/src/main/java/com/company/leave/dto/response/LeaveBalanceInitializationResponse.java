package com.company.leave.dto.response;

public record LeaveBalanceInitializationResponse(
    Integer year,
    int createdRecords
) {
}
