package com.company.leave.mapper;

import com.company.leave.dto.response.DepartmentResponse;
import com.company.leave.entity.Department;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DepartmentMapper {

    private final UserMapper userMapper;

    public DepartmentResponse toResponse(Department department) {
        if (department == null) {
            return null;
        }
        return new DepartmentResponse(
            department.getId(),
            department.getName(),
            department.getDescription(),
            userMapper.toSummary(department.getManager()),
            department.getEmployees() != null ? department.getEmployees().size() : 0,
            department.getCreatedAt()
        );
    }
}
