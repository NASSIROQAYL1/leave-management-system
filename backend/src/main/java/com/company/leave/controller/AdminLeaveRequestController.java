//ADMIN KAYXOF TALAB D CONGEE O KAYRFD WLA YWAFAQ

package com.company.leave.controller;

import com.company.leave.dto.request.ApproveRejectDto;
import com.company.leave.dto.response.LeaveRequestResponse;
import com.company.leave.dto.response.PageResponse;
import com.company.leave.entity.enums.LeaveRequestStatus;
import com.company.leave.service.LeaveRequestService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/leave-requests")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminLeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    @GetMapping
    public PageResponse<LeaveRequestResponse> list(
        @RequestParam(required = false) LeaveRequestStatus status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return leaveRequestService.getAdminRequestsPage(page, size, status);
    }

    @PutMapping("/{id}/approve")
    public LeaveRequestResponse approve(
        @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal,
        @PathVariable Long id,
        @Valid @RequestBody ApproveRejectDto request,
        HttpServletRequest httpRequest
    ) {
        return leaveRequestService.adminApprove(principal.getUsername(), id, request, httpRequest);
    }

    @PutMapping("/{id}/reject")
    public LeaveRequestResponse reject(
        @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal,
        @PathVariable Long id,
        @Valid @RequestBody ApproveRejectDto request,
        HttpServletRequest httpRequest
    ) {
        return leaveRequestService.adminReject(principal.getUsername(), id, request, httpRequest);
    }
}
