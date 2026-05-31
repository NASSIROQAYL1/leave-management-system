package com.company.leave.service;

import com.company.leave.dto.response.DashboardStatsResponse;
import com.company.leave.dto.response.LeaveBalanceSummaryResponse;
import com.company.leave.dto.response.LeaveRequestResponse;
import com.company.leave.dto.response.UserSummaryResponse;
import com.company.leave.entity.enums.LeaveRequestStatus;
import com.company.leave.mapper.LeaveRequestMapper;
import com.company.leave.mapper.UserMapper;
import com.company.leave.repository.DepartmentRepository;
import com.company.leave.repository.LeaveRequestRepository;
import com.company.leave.repository.UserRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveRequestMapper leaveRequestMapper;
    private final UserMapper userMapper;
    private final LeaveBalanceService leaveBalanceService;
    private final UserService userService;

    @Transactional(readOnly = true)
    public DashboardStatsResponse adminStats() {
        List<LeaveRequestResponse> recent = leaveRequestRepository.findAllByOrderByCreatedAtDesc().stream().limit(5).map(leaveRequestMapper::toResponse).toList();
        return new DashboardStatsResponse(
            Map.of(
                "pending", leaveRequestRepository.countByStatus(LeaveRequestStatus.PENDING),
                "approved", leaveRequestRepository.countByStatus(LeaveRequestStatus.APPROVED),
                "employees", userRepository.countByActiveTrue(),
                "departments", departmentRepository.count()
            ),
            recent,
            approvedUsersOn(LocalDate.now()),
            List.of()
        );
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse managerStats(String email) {
        var manager = userService.getActiveUserByEmail(email);
        List<LeaveRequestResponse> recent = leaveRequestRepository.findAllByManagerIdAndStatusInOrderByCreatedAtDesc(
            manager.getId(), List.of(LeaveRequestStatus.PENDING, LeaveRequestStatus.APPROVED_BY_MANAGER)
        ).stream().limit(5).map(leaveRequestMapper::toResponse).toList();
        List<LeaveBalanceSummaryResponse> balances = leaveBalanceService.getMyBalances(email, LocalDate.now().getYear()).stream()
            .map(item -> new LeaveBalanceSummaryResponse(
                item.leaveType().id(),
                item.leaveType().name(),
                item.leaveType().colorHex(),
                item.totalDays(),
                item.usedDays(),
                item.remainingDays()
            )).toList();
        return new DashboardStatsResponse(
            Map.of(
                "pendingApprovals", recent.size(),
                "teamMembers", userService.getDepartmentEmployees(manager.getDepartment() != null ? manager.getDepartment().getId() : -1L).size()
            ),
            recent,
            approvedUsersOn(LocalDate.now()).stream()
                .filter(user -> userRepository.findById(user.id()).orElseThrow().getManager() != null
                    && userRepository.findById(user.id()).orElseThrow().getManager().getId().equals(manager.getId()))
                .toList(),
            balances
        );
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse employeeStats(String email) {
        var employee = userService.getActiveUserByEmail(email);
        List<LeaveRequestResponse> recent = leaveRequestRepository.findAllByUserIdOrderByCreatedAtDesc(employee.getId()).stream().limit(5).map(leaveRequestMapper::toResponse).toList();
        List<LeaveBalanceSummaryResponse> balances = leaveBalanceService.getMyBalances(email, LocalDate.now().getYear()).stream()
            .map(item -> new LeaveBalanceSummaryResponse(
                item.leaveType().id(),
                item.leaveType().name(),
                item.leaveType().colorHex(),
                item.totalDays(),
                item.usedDays(),
                item.remainingDays()
            )).toList();
        return new DashboardStatsResponse(
            Map.of(
                "pending", recent.stream().filter(item -> item.status() == LeaveRequestStatus.PENDING).count(),
                "approved", recent.stream().filter(item -> item.status() == LeaveRequestStatus.APPROVED).count()
            ),
            recent,
            List.of(userMapper.toSummary(employee)),
            balances
        );
    }

    private List<UserSummaryResponse> approvedUsersOn(LocalDate date) {
        return leaveRequestRepository.findAllByStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByStartDateAsc(
                List.of(LeaveRequestStatus.APPROVED),
                date,
                date
            ).stream()
            .map(request -> userMapper.toSummary(request.getUser()))
            .toList();
    }
}
