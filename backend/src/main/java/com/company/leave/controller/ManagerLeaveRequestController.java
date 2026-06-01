//MANAGER KAYSYR CONGEE D TEAM DYALO YRFD WLA YQBL

package com.company.leave.controller;

import com.company.leave.dto.request.ApproveRejectDto;
import com.company.leave.dto.response.LeaveRequestResponse;
import com.company.leave.dto.response.PageResponse;
import com.company.leave.entity.enums.LeaveRequestStatus;
import com.company.leave.service.LeaveRequestService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
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
@RequestMapping("/api/manager/leave-requests")
@PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
@RequiredArgsConstructor
public class ManagerLeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    @GetMapping
    public PageResponse<LeaveRequestResponse> list(
        @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal,
        @RequestParam(required = false) LeaveRequestStatus status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        List<LeaveRequestResponse> requests = leaveRequestService.getManagerRequests(principal.getUsername(), status);
        int fromIndex = Math.min(page * size, requests.size());
        int toIndex = Math.min(fromIndex + size, requests.size());
        return new PageResponse<>(
            requests.subList(fromIndex, toIndex),
            page,
            size,
            requests.size(),
            size == 0 ? 0 : (int) Math.ceil((double) requests.size() / size),
            page == 0,
            toIndex >= requests.size(),
            "createdAt",
            "desc"
        );
    }

    @PutMapping("/{id}/approve")
    public LeaveRequestResponse approve(
        @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal,
        @PathVariable Long id,
        @Valid @RequestBody ApproveRejectDto request,
        HttpServletRequest httpRequest
    ) {
        return leaveRequestService.managerApprove(principal.getUsername(), id, request, httpRequest);
    }

    @PutMapping("/{id}/reject")
    public LeaveRequestResponse reject(
        @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal,
        @PathVariable Long id,
        @Valid @RequestBody ApproveRejectDto request,
        HttpServletRequest httpRequest
    ) {
        return leaveRequestService.managerReject(principal.getUsername(), id, request, httpRequest);
    }
}
