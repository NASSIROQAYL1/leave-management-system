package com.company.leave.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminResetPasswordRequest(
    @NotBlank @Size(min = 8, max = 128) String newPassword
) {
}
