package com.company.leave.repository;

import com.company.leave.entity.LeaveType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeaveTypeRepository extends JpaRepository<LeaveType, Long> {
    List<LeaveType> findAllByActiveTrueOrderByNameAsc();
    Optional<LeaveType> findByNameIgnoreCase(String name);
}
