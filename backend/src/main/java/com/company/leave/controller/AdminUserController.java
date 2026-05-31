//ADMIN KAYSYR USERS YZID WLA YMSAH

package com.company.leave.controller;

import com.company.leave.dto.request.AdminResetPasswordRequest;
import com.company.leave.dto.request.ChangeRoleRequest;
import com.company.leave.dto.request.CreateUserRequest;
import com.company.leave.dto.request.UpdateUserRequest;
import com.company.leave.dto.response.ActionResponse;
import com.company.leave.dto.response.LeaveRequestResponse;
import com.company.leave.dto.response.PageResponse;
import com.company.leave.dto.response.UserResponse;
import com.company.leave.entity.enums.Role;
import com.company.leave.service.LeaveRequestService;
import com.company.leave.service.UserService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;
    private final LeaveRequestService leaveRequestService;

    @GetMapping
    public PageResponse<UserResponse> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) String search,
        @RequestParam(required = false, name = "dept") Long departmentId,
        @RequestParam(required = false) Role role
    ) {
        return userService.getUsers(page, size, search, departmentId, role);
    }

    @PostMapping
    public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
        return userService.create(request);
    }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable Long id) {
        return userService.getUserDetails(id);
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        return userService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ActionResponse delete(@PathVariable Long id) {
        return userService.softDelete(id);
    }

    @PutMapping("/{id}/role")
    public UserResponse changeRole(@PathVariable Long id, @Valid @RequestBody ChangeRoleRequest request) {
        return userService.changeRole(id, request);
    }

    @PutMapping("/{id}/reset-password")
    public ActionResponse resetPassword(@PathVariable Long id, @Valid @RequestBody AdminResetPasswordRequest request) {
        return userService.resetPassword(id, request);
    }

    @GetMapping("/{id}/leave-history")
    public List<LeaveRequestResponse> leaveHistory(@PathVariable Long id) {
        return leaveRequestService.getMyRequests(userService.getActiveUserById(id).getEmail(), null, null, null);
    }
}
