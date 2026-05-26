package com.company.leave.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CreateLeaveTypeDto(
    @NotBlank String name,
    String description,
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$") String colorHex,
    Integer maxDaysPerYear,
    Boolean requiresDocument,
    Boolean paid,
    Boolean active
) {
}
