package com.company.leave.dto.request;

import com.company.leave.entity.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateUserRequest(
    @NotBlank String firstName,
    @NotBlank String lastName,
    @NotBlank @Email String email,
    @NotBlank String password,
    String phone,
    LocalDate hireDate,
    @NotNull Role role,
    Long departmentId,
    Long managerId
) {
}
