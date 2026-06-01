//HNA KAYXOF DASHBOARD D TEAM DYALO

package com.company.leave.controller;

import com.company.leave.dto.response.DashboardStatsResponse;
import com.company.leave.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/manager/dashboard")
@PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
@RequiredArgsConstructor
public class ManagerDashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public DashboardStatsResponse stats(@AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {
        return dashboardService.managerStats(principal.getUsername());
    }
}
