package com.company.leave.util;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class WorkingDaysCalculator {

    public long calculate(LocalDate startDate, LocalDate endDate, Set<LocalDate> publicHolidays) {
        if (startDate == null || endDate == null || endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("Invalid date range for working days calculation.");
        }

        long workingDays = 0;
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            boolean weekend = current.getDayOfWeek() == DayOfWeek.SATURDAY || current.getDayOfWeek() == DayOfWeek.SUNDAY;
            boolean holiday = publicHolidays != null && publicHolidays.contains(current);
            if (!weekend && !holiday) {
                workingDays++;
            }
            current = current.plusDays(1);
        }
        return workingDays;
    }
}
