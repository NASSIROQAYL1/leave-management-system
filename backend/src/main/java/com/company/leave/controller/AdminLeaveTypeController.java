//ADMIN KAYTHAKM F FANWA3 CONGEE WAX YZID YMSAH YBDL

package com.company.leave.controller;

import com.company.leave.dto.request.CreateLeaveTypeDto;
import com.company.leave.dto.response.LeaveTypeResponse;
import com.company.leave.service.LeaveTypeService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class AdminLeaveTypeController {

    private final LeaveTypeService leaveTypeService;

    @GetMapping("/api/leave-types")
    @PreAuthorize("isAuthenticated()")
    public List<LeaveTypeResponse> listActive() {
        return leaveTypeService.listActive();
    }

    @PostMapping("/api/admin/leave-types")
    @PreAuthorize("hasRole('ADMIN')")
    public LeaveTypeResponse create(@Valid @RequestBody CreateLeaveTypeDto request) {
        return leaveTypeService.create(request);
    }

    @PutMapping("/api/admin/leave-types/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public LeaveTypeResponse update(@PathVariable Long id, @Valid @RequestBody CreateLeaveTypeDto request) {
        return leaveTypeService.update(id, request);
    }

    @DeleteMapping("/api/admin/leave-types/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        leaveTypeService.deactivate(id);
    }
}
