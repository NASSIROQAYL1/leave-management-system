package com.company.leave.dto.request;

import com.company.leave.entity.enums.Role;
import jakarta.validation.constraints.NotNull;

public record ChangeRoleRequest(@NotNull Role role) {
}
