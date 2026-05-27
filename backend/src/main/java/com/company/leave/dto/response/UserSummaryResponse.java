package com.company.leave.dto.response;

import com.company.leave.entity.enums.Role;

public record UserSummaryResponse(
    Long id,
    String firstName,
    String lastName,
    String fullName,
    String email,
    Role role
) {
}
