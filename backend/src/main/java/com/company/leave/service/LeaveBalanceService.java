package com.company.leave.service;

import com.company.leave.dto.request.AdjustBalanceDto;
import com.company.leave.dto.request.InitializeBalancesRequest;
import com.company.leave.dto.response.LeaveBalanceInitializationResponse;
import com.company.leave.dto.response.LeaveBalanceResponse;
import com.company.leave.entity.LeaveBalance;
import com.company.leave.entity.LeaveType;
import com.company.leave.entity.User;
import com.company.leave.exception.InsufficientLeaveBalanceException;
import com.company.leave.exception.ResourceNotFoundException;
import com.company.leave.mapper.LeaveBalanceMapper;
import com.company.leave.repository.LeaveBalanceRepository;
import com.company.leave.repository.LeaveTypeRepository;
import com.company.leave.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LeaveBalanceService {

    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final UserRepository userRepository;
    private final LeaveBalanceMapper leaveBalanceMapper;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<LeaveBalanceResponse> getMyBalances(String email, Integer year) {
        User currentUser = userService.getActiveUserByEmail(email);
        return leaveBalanceRepository.findAllByUserIdAndYearOrderByLeaveType_NameAsc(currentUser.getId(), resolveYear(year)).stream()
            .map(leaveBalanceMapper::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<LeaveBalanceResponse> listByYear(Integer year) {
        return leaveBalanceRepository.findAllByYearOrderByUser_LastNameAscUser_FirstNameAsc(resolveYear(year)).stream()
            .map(leaveBalanceMapper::toResponse)
            .toList();
    }

    @Transactional
    public LeaveBalanceInitializationResponse initializeYear(InitializeBalancesRequest request) {
        int year = resolveYear(request.year());
        List<User> users = userRepository.findAll().stream().filter(user -> Boolean.TRUE.equals(user.getActive())).toList();
        List<LeaveType> leaveTypes = leaveTypeRepository.findAllByActiveTrueOrderByNameAsc();
        List<LeaveBalance> toCreate = new ArrayList<>();

        for (User user : users) {
            for (LeaveType leaveType : leaveTypes) {
                if (!leaveBalanceRepository.existsByUserIdAndLeaveTypeIdAndYear(user.getId(), leaveType.getId(), year)) {
                    LeaveBalance balance = new LeaveBalance();
                    balance.setUser(user);
                    balance.setLeaveType(leaveType);
                    balance.setYear(year);
                    balance.setTotalDays(leaveType.getMaxDaysPerYear() != null ? leaveType.getMaxDaysPerYear() : 0);
                    balance.setUsedDays(BigDecimal.ZERO.setScale(1, RoundingMode.HALF_UP));
                    toCreate.add(balance);
                }
            }
        }

        leaveBalanceRepository.saveAll(toCreate);
        return new LeaveBalanceInitializationResponse(year, toCreate.size());
    }

    @Transactional
    public LeaveBalanceResponse adjust(Long id, AdjustBalanceDto request) {
        LeaveBalance leaveBalance = leaveBalanceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Leave balance not found."));
        leaveBalance.setTotalDays(request.totalDays());
        leaveBalance.setUsedDays(request.usedDays().setScale(1, RoundingMode.HALF_UP));
        validateBalanceValues(leaveBalance);
        return leaveBalanceMapper.toResponse(leaveBalance);
    }

    @Transactional(readOnly = true)
    public LeaveBalance getBalanceForRequest(User user, LeaveType leaveType, LocalDate startDate) {
        int year = startDate.getYear();
        return leaveBalanceRepository.findByUserIdAndLeaveTypeIdAndYear(user.getId(), leaveType.getId(), year)
            .orElseThrow(() -> new ResourceNotFoundException("Leave balance not configured for this user and year."));
    }

    @Transactional(readOnly = true)
    public void validateAvailableBalance(User user, LeaveType leaveType, LocalDate startDate, BigDecimal requestedDays) {
        LeaveBalance balance = getBalanceForRequest(user, leaveType, startDate);
        BigDecimal remaining = BigDecimal.valueOf(balance.getTotalDays()).subtract(balance.getUsedDays());
        if (remaining.compareTo(requestedDays) < 0) {
            throw new InsufficientLeaveBalanceException("Insufficient remaining leave balance.");
        }
    }

    @Transactional
    public void consumeApprovedDays(User user, LeaveType leaveType, LocalDate startDate, BigDecimal approvedDays) {
        LeaveBalance balance = getBalanceForRequest(user, leaveType, startDate);
        validateAvailableBalance(user, leaveType, startDate, approvedDays);
        balance.setUsedDays(balance.getUsedDays().add(approvedDays).setScale(1, RoundingMode.HALF_UP));
        validateBalanceValues(balance);
    }

    private int resolveYear(Integer year) {
        return year != null ? year : LocalDate.now().getYear();
    }

    private void validateBalanceValues(LeaveBalance leaveBalance) {
        if (leaveBalance.getUsedDays().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Used days cannot be negative.");
        }
        if (leaveBalance.getUsedDays().compareTo(BigDecimal.valueOf(leaveBalance.getTotalDays())) > 0) {
            throw new IllegalArgumentException("Used days cannot exceed total days.");
        }
    }
}
