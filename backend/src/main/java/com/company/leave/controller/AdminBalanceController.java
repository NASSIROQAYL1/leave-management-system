//KANDM BALANCES NZID WLA NHAYD WLA NMODIFIE

package com.company.leave.controller;

import com.company.leave.dto.request.AdjustBalanceDto;
import com.company.leave.dto.request.InitializeBalancesRequest;
import com.company.leave.dto.response.LeaveBalanceInitializationResponse;
import com.company.leave.dto.response.LeaveBalanceResponse;
import com.company.leave.service.LeaveBalanceService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/balances")
@RequiredArgsConstructor  //كينشئ constructor أوتوماتيكياً
public class AdminBalanceController {

    private final LeaveBalanceService leaveBalanceService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")//غير Admin يقدر يدخل
    public List<LeaveBalanceResponse> list(@RequestParam(required = false) Integer year) {
        return leaveBalanceService.listByYear(year);
    }

    @PostMapping("/initialize-year")
    @PreAuthorize("hasRole('ADMIN')")
    public LeaveBalanceInitializationResponse initializeYear(@Valid @RequestBody InitializeBalancesRequest request) {
        return leaveBalanceService.initializeYear(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public LeaveBalanceResponse adjust(@PathVariable Long id, @Valid @RequestBody AdjustBalanceDto request) {
        return leaveBalanceService.adjust(id, request);
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public List<LeaveBalanceResponse> myBalances(
        @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal,
        @RequestParam(required = false) Integer year
    ) {
        return leaveBalanceService.getMyBalances(principal.getUsername(), year);
    }
}
