package com.company.leave.dto.response;

import com.company.leave.entity.enums.Role;

public record AuthUserResponse(
    Long id,
    String firstName,
    String lastName,
    String fullName,
    String email,
    Role role,
    DepartmentSummaryResponse department,
    UserSummaryResponse manager,
    Boolean active
) {
}
