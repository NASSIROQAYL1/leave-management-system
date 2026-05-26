package com.company.leave.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateLeaveRequestDto(
    @NotNull Long leaveTypeId,
    @NotNull @FutureOrPresent LocalDate startDate,
    @NotNull @FutureOrPresent LocalDate endDate,
    String reason,
    String attachmentUrl
) {
}
