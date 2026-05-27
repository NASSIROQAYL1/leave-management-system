package com.company.leave.mapper;

import com.company.leave.dto.response.LeaveTypeResponse;
import com.company.leave.entity.LeaveType;
import org.springframework.stereotype.Component;

@Component
public class LeaveTypeMapper {

    public LeaveTypeResponse toResponse(LeaveType leaveType) {
        if (leaveType == null) {
            return null;
        }
        return new LeaveTypeResponse(
            leaveType.getId(),
            leaveType.getName(),
            leaveType.getDescription(),
            leaveType.getColorHex(),
            leaveType.getMaxDaysPerYear(),
            leaveType.getRequiresDocument(),
            leaveType.getPaid(),
            leaveType.getActive(),
            leaveType.getCreatedAt()
        );
    }
}
