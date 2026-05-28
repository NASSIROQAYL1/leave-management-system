package com.company.leave.mapper;

import com.company.leave.dto.response.PublicHolidayResponse;
import com.company.leave.entity.PublicHoliday;
import org.springframework.stereotype.Component;

@Component
public class PublicHolidayMapper {

    public PublicHolidayResponse toResponse(PublicHoliday publicHoliday) {
        if (publicHoliday == null) {
            return null;
        }
        return new PublicHolidayResponse(
            publicHoliday.getId(),
            publicHoliday.getName(),
            publicHoliday.getDate(),
            publicHoliday.getYear(),
            publicHoliday.getRecurring(),
            publicHoliday.getCreatedAt()
        );
    }
}
