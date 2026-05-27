package com.company.leave.mapper;

import com.company.leave.dto.response.LeaveRequestResponse;
import com.company.leave.entity.LeaveRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LeaveRequestMapper {

    private final UserMapper userMapper;
    private final LeaveTypeMapper leaveTypeMapper;

    public LeaveRequestResponse toResponse(LeaveRequest leaveRequest) {
        if (leaveRequest == null) {
            return null;
        }
        return new LeaveRequestResponse(
            leaveRequest.getId(),
            userMapper.toSummary(leaveRequest.getUser()),
            leaveTypeMapper.toResponse(leaveRequest.getLeaveType()),
            leaveRequest.getStartDate(),
            leaveRequest.getEndDate(),
            leaveRequest.getTotalDays(),
            leaveRequest.getStatus(),
            leaveRequest.getReason(),
            leaveRequest.getAttachmentUrl(),
            userMapper.toSummary(leaveRequest.getManager()),
            leaveRequest.getManagerComment(),
            leaveRequest.getManagerActionDate(),
            userMapper.toSummary(leaveRequest.getAdmin()),
            leaveRequest.getAdminComment(),
            leaveRequest.getAdminActionDate(),
            leaveRequest.getCreatedAt(),
            leaveRequest.getUpdatedAt()
        );
    }
}
