//EMOLOYEE KAYTLB CONGEE WLA YLGIH WYXOF WAX TQBL

package com.company.leave.controller;

import com.company.leave.dto.request.CreateLeaveRequestDto;
import com.company.leave.dto.response.LeaveRequestResponse;
import com.company.leave.dto.response.OverlapCheckResponse;
import com.company.leave.entity.enums.LeaveRequestStatus;
import com.company.leave.service.LeaveRequestService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/leave-requests")
@PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','ADMIN')")
@RequiredArgsConstructor
public class EmployeeLeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    @PostMapping
    public LeaveRequestResponse create(
        @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal,
        @Valid @RequestBody CreateLeaveRequestDto request,
        HttpServletRequest httpRequest
    ) {
        return leaveRequestService.create(principal.getUsername(), request, httpRequest);
    }

    @GetMapping("/my")
    public List<LeaveRequestResponse> myRequests(
        @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal,
        @RequestParam(required = false) LeaveRequestStatus status,
        @RequestParam(required = false) Integer year,
        @RequestParam(required = false, name = "type") Long leaveTypeId
    ) {
        return leaveRequestService.getMyRequests(principal.getUsername(), status, year, leaveTypeId);
    }

    @PutMapping("/{id}/cancel")
    public LeaveRequestResponse cancel(
        @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal,
        @PathVariable Long id,
        HttpServletRequest httpRequest
    ) {
        return leaveRequestService.cancel(principal.getUsername(), id, httpRequest);
    }

    @GetMapping("/check-overlap")
    public OverlapCheckResponse checkOverlap(
        @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal,
        @RequestParam LocalDate start,
        @RequestParam LocalDate end
    ) {
        return leaveRequestService.checkOverlap(principal.getUsername(), start, end);
    }
}
