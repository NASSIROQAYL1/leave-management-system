package com.company.leave.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InitializeBalancesRequest(
    @NotNull @Min(2000) @Max(3000) Integer year
) {
}
