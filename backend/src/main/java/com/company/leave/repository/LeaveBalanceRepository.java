package com.company.leave.repository;

import com.company.leave.entity.LeaveBalance;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {
    List<LeaveBalance> findAllByUserIdAndYearOrderByLeaveType_NameAsc(Long userId, Integer year);
    List<LeaveBalance> findAllByYearOrderByUser_LastNameAscUser_FirstNameAsc(Integer year);
    Optional<LeaveBalance> findByUserIdAndLeaveTypeIdAndYear(Long userId, Long leaveTypeId, Integer year);
    boolean existsByUserIdAndLeaveTypeIdAndYear(Long userId, Long leaveTypeId, Integer year);
}
