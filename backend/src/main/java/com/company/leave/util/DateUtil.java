package com.company.leave.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public final class DateUtil {

    private DateUtil() {
    }

    public static LocalDateTime atStartOfDay(LocalDate date) {
        return date == null ? null : date.atStartOfDay();
    }

    public static LocalDateTime atEndOfDay(LocalDate date) {
        return date == null ? null : date.atTime(LocalTime.MAX);
    }
}
