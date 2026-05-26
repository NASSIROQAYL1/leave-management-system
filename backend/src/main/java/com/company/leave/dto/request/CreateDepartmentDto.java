package com.company.leave.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateDepartmentDto(
    @NotBlank String name,
    String description,
    Long managerId
) {
}
