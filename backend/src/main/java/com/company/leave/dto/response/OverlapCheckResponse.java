package com.company.leave.dto.response;

import java.math.BigDecimal;

public record OverlapCheckResponse(
    boolean overlap,
    BigDecimal workingDays
) {
}
