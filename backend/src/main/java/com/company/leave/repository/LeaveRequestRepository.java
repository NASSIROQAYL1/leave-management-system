package com.company.leave.repository;

import com.company.leave.entity.LeaveRequest;
import com.company.leave.entity.enums.LeaveRequestStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long>, JpaSpecificationExecutor<LeaveRequest> {
    List<LeaveRequest> findAllByUserIdOrderByCreatedAtDesc(Long userId);
    List<LeaveRequest> findAllByUserIdAndStatusOrderByCreatedAtDesc(Long userId, LeaveRequestStatus status);
    List<LeaveRequest> findAllByManagerIdOrderByCreatedAtDesc(Long managerId);
    List<LeaveRequest> findAllByManagerIdAndStatusOrderByCreatedAtDesc(Long managerId, LeaveRequestStatus status);
    List<LeaveRequest> findAllByOrderByCreatedAtDesc();
    List<LeaveRequest> findAllByStatusOrderByCreatedAtDesc(LeaveRequestStatus status);
    Page<LeaveRequest> findAllByStatus(LeaveRequestStatus status, Pageable pageable);
    Page<LeaveRequest> findAll(Pageable pageable);
    Optional<LeaveRequest> findByIdAndUserId(Long id, Long userId);
    Optional<LeaveRequest> findByIdAndManagerId(Long id, Long managerId);
    List<LeaveRequest> findAllByManagerIdAndStatusInOrderByCreatedAtDesc(Long managerId, List<LeaveRequestStatus> statuses);
    List<LeaveRequest> findAllByUserIdAndStatusInOrderByCreatedAtDesc(Long userId, List<LeaveRequestStatus> statuses);
    List<LeaveRequest> findAllByStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByStartDateAsc(
        List<LeaveRequestStatus> statuses,
        LocalDate endDate,
        LocalDate startDate
    );
    long countByStatus(LeaveRequestStatus status);
    boolean existsByUserIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
        Long userId,
        List<LeaveRequestStatus> statuses,
        LocalDate endDate,
        LocalDate startDate
    );
    boolean existsByUserIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqualAndIdNot(
        Long userId,
        List<LeaveRequestStatus> statuses,
        LocalDate endDate,
        LocalDate startDate,
        Long id
    );
}
