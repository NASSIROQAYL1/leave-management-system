package com.company.leave.dto.request;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record AdjustBalanceDto(
    @NotNull Integer totalDays,
    @NotNull BigDecimal usedDays
) {
}
