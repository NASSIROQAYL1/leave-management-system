// ADMIN KAYXOF CALENDAR D TEAM DYALO XKON F CONGEE OFOQAX 3NDOM CONGEE

package com.company.leave.controller;

import com.company.leave.dto.response.CalendarEventResponse;
import com.company.leave.service.LeaveRequestService;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/calendar/team")
@PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
@RequiredArgsConstructor
public class ManagerCalendarController {

    private final LeaveRequestService leaveRequestService;

    @GetMapping
    public List<CalendarEventResponse> teamCalendar(
        @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal,
        @RequestParam LocalDate from,
        @RequestParam LocalDate to
    ) {
        return leaveRequestService.getTeamCalendar(principal.getUsername(), from, to);
    }
}
