package com.company.leave.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PublicHolidayResponse(
    Long id,
    String name,
    LocalDate date,
    Integer year,
    Boolean recurring,
    LocalDateTime createdAt
) {
}
