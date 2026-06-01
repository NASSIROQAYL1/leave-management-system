//HNA EMPLOYEE KAYXOF MA3LOMAT DYALO D CONGEE XHAL BAQILO XHAL TQBLO DCONGEE XHAL TRFDLO

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
@RequestMapping("/api/employee/dashboard")
@PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','ADMIN')")
@RequiredArgsConstructor
public class EmployeeDashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public DashboardStatsResponse stats(@AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {
        return dashboardService.employeeStats(principal.getUsername());
    }
}
