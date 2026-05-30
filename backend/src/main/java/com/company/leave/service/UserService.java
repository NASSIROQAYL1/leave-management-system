package com.company.leave.service;

import com.company.leave.dto.request.AdminResetPasswordRequest;
import com.company.leave.dto.request.ChangeRoleRequest;
import com.company.leave.dto.request.CreateUserRequest;
import com.company.leave.dto.request.UpdateUserRequest;
import com.company.leave.dto.response.ActionResponse;
import com.company.leave.dto.response.PageResponse;
import com.company.leave.dto.response.UserResponse;
import com.company.leave.entity.User;
import com.company.leave.entity.enums.Role;
import com.company.leave.exception.ResourceNotFoundException;
import com.company.leave.exception.UnauthorizedActionException;
import com.company.leave.mapper.UserMapper;
import com.company.leave.repository.DepartmentRepository;
import com.company.leave.repository.UserRepository;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public User getActiveUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
            .filter(user -> Boolean.TRUE.equals(user.getActive()))
            .orElseThrow(() -> new ResourceNotFoundException("Active user not found."));
    }

    @Transactional(readOnly = true)
    public User getActiveUserById(Long id) {
        return userRepository.findByIdAndActiveTrue(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    @Transactional(readOnly = true)
    public List<User> getDepartmentEmployees(Long departmentId) {
        return userRepository.findAllByDepartmentId(departmentId);
    }

    @Transactional(readOnly = true)
    public List<User> getManagers() {
        return userRepository.findAllByRoleIn(List.of(Role.ADMIN, Role.MANAGER));
    }

    @Transactional(readOnly = true)
    public List<User> getUsersByRoles(List<Role> roles) {
        return userRepository.findAllByRoleIn(roles);
    }

    public void ensureManages(User manager, User employee) {
        if (employee.getManager() == null || !employee.getManager().getId().equals(manager.getId())) {
            throw new UnauthorizedActionException("You are not allowed to manage this employee request.");
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getUsers(int page, int size, String search, Long departmentId, Role role) {
        List<UserResponse> filtered = userRepository.findAll().stream()
            .filter(user -> Boolean.TRUE.equals(user.getActive()))
            .map(userMapper::toResponse)
            .filter(user -> search == null || user.fullName().toLowerCase().contains(search.toLowerCase()) || user.email().toLowerCase().contains(search.toLowerCase()))
            .filter(user -> departmentId == null || (user.department() != null && departmentId.equals(user.department().id())))
            .filter(user -> role == null || user.role() == role)
            .toList();

        int fromIndex = Math.min(page * size, filtered.size());
        int toIndex = Math.min(fromIndex + size, filtered.size());
        return new PageResponse<>(
            filtered.subList(fromIndex, toIndex),
            page,
            size,
            filtered.size(),
            size == 0 ? 0 : (int) Math.ceil((double) filtered.size() / size),
            page == 0,
            toIndex >= filtered.size(),
            "createdAt",
            "desc"
        );
    }

    @Transactional(readOnly = true)
    public UserResponse getUserDetails(Long id) {
        return userMapper.toResponse(getActiveUserById(id));
    }

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        User user = new User();
        apply(user, request.firstName(), request.lastName(), request.email(), request.phone(), request.hireDate(), request.role(), request.departmentId(), request.managerId());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setActive(true);
        user.setFailedLoginAttempts(0);
        User saved = userRepository.save(user);
        emailService.sendWelcomeEmail(saved);
        return userMapper.toResponse(saved);
    }

    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = getActiveUserById(id);
        apply(user, request.firstName(), request.lastName(), request.email(), request.phone(), request.hireDate(), request.role(), request.departmentId(), request.managerId());
        if (request.active() != null) {
            user.setActive(request.active());
        }
        return userMapper.toResponse(user);
    }

    @Transactional
    public ActionResponse softDelete(Long id) {
        User user = getActiveUserById(id);
        user.setActive(false);
        return new ActionResponse("User deactivated successfully.");
    }

    @Transactional
    public UserResponse changeRole(Long id, ChangeRoleRequest request) {
        User user = getActiveUserById(id);
        user.setRole(request.role());
        return userMapper.toResponse(user);
    }

    @Transactional
    public ActionResponse resetPassword(Long id, AdminResetPasswordRequest request) {
        User user = getActiveUserById(id);
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setFailedLoginAttempts(0);
        user.setAccountLockedUntil(null);
        return new ActionResponse("Password reset successfully.");
    }

    private void apply(User user, String firstName, String lastName, String email, String phone, LocalDate hireDate, Role role, Long departmentId, Long managerId) {
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPhone(phone);
        user.setHireDate(hireDate);
        user.setRole(role);
        user.setDepartment(departmentId != null
            ? departmentRepository.findById(departmentId).orElseThrow(() -> new ResourceNotFoundException("Department not found."))
            : null);
        user.setManager(managerId != null ? getActiveUserById(managerId) : null);
    }
}
