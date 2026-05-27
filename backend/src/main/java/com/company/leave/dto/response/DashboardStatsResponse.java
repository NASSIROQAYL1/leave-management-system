package com.company.leave.dto.response;

import java.util.List;
import java.util.Map;

public record DashboardStatsResponse(
    Map<String, Number> metrics,
    List<LeaveRequestResponse> recentRequests,
    List<UserSummaryResponse> usersOnLeaveToday,
    List<LeaveBalanceSummaryResponse> leaveBalances
) {
}
