package com.company.leave.dto.response;

import com.company.leave.entity.enums.Role;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record UserResponse(
    Long id,
    String firstName,
    String lastName,
    String fullName,
    String email,
    String phone,
    String profilePicture,
    LocalDate hireDate,
    Role role,
    DepartmentSummaryResponse department,
    UserSummaryResponse manager,
    Boolean active,
    Integer failedLoginAttempts,
    LocalDateTime accountLockedUntil,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
