//USER KAYXOF CONGEE DYALO F CALANDAR FOQAX BDA FOQAX AYSALI

package com.company.leave.controller;

import com.company.leave.dto.response.CalendarEventResponse;
import com.company.leave.service.LeaveRequestService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/calendar/my")
@PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','ADMIN')")
@RequiredArgsConstructor
public class EmployeeCalendarController {

    private final LeaveRequestService leaveRequestService;

    @GetMapping
    public List<CalendarEventResponse> myCalendar(
        @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal,
        @RequestParam(required = false) Integer year
    ) {
        return leaveRequestService.getMyCalendar(principal.getUsername(), year);
    }
}
