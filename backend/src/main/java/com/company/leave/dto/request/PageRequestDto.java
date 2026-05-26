package com.company.leave.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record PageRequestDto(
    @Min(0) Integer page,
    @Min(1) @Max(200) Integer size,
    String sortBy,
    String sortDirection
) {
}
