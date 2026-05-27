package com.company.leave.mapper;

import com.company.leave.dto.response.LeaveBalanceResponse;
import com.company.leave.dto.response.LeaveBalanceSummaryResponse;
import com.company.leave.entity.LeaveBalance;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LeaveBalanceMapper {

    private final UserMapper userMapper;
    private final LeaveTypeMapper leaveTypeMapper;

    public LeaveBalanceResponse toResponse(LeaveBalance leaveBalance) {
        if (leaveBalance == null) {
            return null;
        }
        return new LeaveBalanceResponse(
            leaveBalance.getId(),
            userMapper.toSummary(leaveBalance.getUser()),
            leaveTypeMapper.toResponse(leaveBalance.getLeaveType()),
            leaveBalance.getYear(),
            leaveBalance.getTotalDays(),
            leaveBalance.getUsedDays(),
            remainingDays(leaveBalance)
        );
    }

    public LeaveBalanceSummaryResponse toSummary(LeaveBalance leaveBalance) {
        if (leaveBalance == null) {
            return null;
        }
        return new LeaveBalanceSummaryResponse(
            leaveBalance.getLeaveType().getId(),
            leaveBalance.getLeaveType().getName(),
            leaveBalance.getLeaveType().getColorHex(),
            leaveBalance.getTotalDays(),
            leaveBalance.getUsedDays(),
            remainingDays(leaveBalance)
        );
    }

    private BigDecimal remainingDays(LeaveBalance leaveBalance) {
        return BigDecimal.valueOf(leaveBalance.getTotalDays()).subtract(leaveBalance.getUsedDays());
    }
}
