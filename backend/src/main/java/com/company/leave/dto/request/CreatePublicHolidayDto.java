package com.company.leave.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreatePublicHolidayDto(
    @NotBlank String name,
    @NotNull LocalDate date,
    Integer year,
    Boolean recurring
) {
}
