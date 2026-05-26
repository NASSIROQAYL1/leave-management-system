package com.company.leave.dto.request;

import com.company.leave.entity.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record UpdateUserRequest(
    @NotBlank String firstName,
    @NotBlank String lastName,
    @NotBlank @Email String email,
    String phone,
    LocalDate hireDate,
    Role role,
    Long departmentId,
    Long managerId,
    Boolean active
) {
}
