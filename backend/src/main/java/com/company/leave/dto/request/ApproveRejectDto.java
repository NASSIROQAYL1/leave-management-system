package com.company.leave.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ApproveRejectDto(@NotBlank String comment) {
}
