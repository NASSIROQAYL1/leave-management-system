package com.company.leave.repository;

import com.company.leave.entity.PublicHoliday;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PublicHolidayRepository extends JpaRepository<PublicHoliday, Long> {
    List<PublicHoliday> findAllByDateBetween(LocalDate startDate, LocalDate endDate);
    List<PublicHoliday> findAllByYearOrderByDateAsc(Integer year);
    List<PublicHoliday> findAllByRecurringTrueOrderByDateAsc();
}
