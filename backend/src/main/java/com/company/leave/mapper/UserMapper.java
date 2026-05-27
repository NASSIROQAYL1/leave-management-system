package com.company.leave.mapper;

import com.company.leave.dto.response.AuthUserResponse;
import com.company.leave.dto.response.DepartmentSummaryResponse;
import com.company.leave.dto.response.UserResponse;
import com.company.leave.dto.response.UserSummaryResponse;
import com.company.leave.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }
        return new UserResponse(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            fullName(user),
            user.getEmail(),
            user.getPhone(),
            user.getProfilePicture(),
            user.getHireDate(),
            user.getRole(),
            toDepartmentReference(user),
            toSummary(user.getManager()),
            user.getActive(),
            user.getFailedLoginAttempts(),
            user.getAccountLockedUntil(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }

    public AuthUserResponse toAuthResponse(User user) {
        if (user == null) {
            return null;
        }
        return new AuthUserResponse(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            fullName(user),
            user.getEmail(),
            user.getRole(),
            toDepartmentReference(user),
            toSummary(user.getManager()),
            user.getActive()
        );
    }

    public UserSummaryResponse toSummary(User user) {
        if (user == null) {
            return null;
        }
        return new UserSummaryResponse(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            fullName(user),
            user.getEmail(),
            user.getRole()
        );
    }

    private DepartmentSummaryResponse toDepartmentReference(User user) {
        if (user == null || user.getDepartment() == null) {
            return null;
        }
        return new DepartmentSummaryResponse(
            user.getDepartment().getId(),
            user.getDepartment().getName()
        );
    }

    private String fullName(User user) {
        return user.getFirstName() + " " + user.getLastName();
    }
}
