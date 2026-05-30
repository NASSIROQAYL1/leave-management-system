package com.company.leave.service;

import com.company.leave.dto.request.ApproveRejectDto;
import com.company.leave.dto.request.CreateLeaveRequestDto;
import com.company.leave.dto.response.LeaveRequestResponse;
import com.company.leave.dto.response.OverlapCheckResponse;
import com.company.leave.dto.response.PageResponse;
import com.company.leave.dto.response.CalendarEventResponse;
import com.company.leave.entity.LeaveRequest;
import com.company.leave.entity.LeaveType;
import com.company.leave.entity.User;
import com.company.leave.entity.enums.LeaveRequestStatus;
import com.company.leave.entity.enums.NotificationType;
import com.company.leave.entity.enums.Role;
import com.company.leave.exception.LeaveOverlapException;
import com.company.leave.exception.ResourceNotFoundException;
import com.company.leave.exception.UnauthorizedActionException;
import com.company.leave.mapper.LeaveRequestMapper;
import com.company.leave.repository.LeaveRequestRepository;
import com.company.leave.util.WorkingDaysCalculator;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LeaveRequestService {

    private static final List<LeaveRequestStatus> ACTIVE_REQUEST_STATUSES = List.of(
        LeaveRequestStatus.PENDING,
        LeaveRequestStatus.APPROVED_BY_MANAGER,
        LeaveRequestStatus.APPROVED
    );

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveRequestMapper leaveRequestMapper;
    private final UserService userService;
    private final LeaveTypeService leaveTypeService;
    private final LeaveBalanceService leaveBalanceService;
    private final PublicHolidayService publicHolidayService;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final AuditLogService auditLogService;
    private final WorkingDaysCalculator workingDaysCalculator;

    @Transactional
    public LeaveRequestResponse create(String email, CreateLeaveRequestDto request, HttpServletRequest httpRequest) {
        User currentUser = userService.getActiveUserByEmail(email);
        LeaveType leaveType = leaveTypeService.getActiveEntity(request.leaveTypeId());
        BigDecimal workingDays = calculateWorkingDays(request.startDate(), request.endDate());

        ensureNoOverlap(currentUser.getId(), request.startDate(), request.endDate(), null);
        leaveBalanceService.validateAvailableBalance(currentUser, leaveType, request.startDate(), workingDays);

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setUser(currentUser);
        leaveRequest.setLeaveType(leaveType);
        leaveRequest.setStartDate(request.startDate());
        leaveRequest.setEndDate(request.endDate());
        leaveRequest.setTotalDays(workingDays);
        leaveRequest.setReason(request.reason());
        leaveRequest.setAttachmentUrl(request.attachmentUrl());
        leaveRequest.setStatus(LeaveRequestStatus.PENDING);
        leaveRequest.setManager(currentUser.getRole() == Role.EMPLOYEE ? currentUser.getManager() : null);

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        auditLogService.log(currentUser, "SUBMIT_REQUEST", "LEAVE_REQUEST", saved.getId(), null, LeaveRequestStatus.PENDING.name(), clientIp(httpRequest));

        if (saved.getManager() != null) {
            notificationService.create(
                saved.getManager(),
                "New leave request",
                currentUser.getFirstName() + " " + currentUser.getLastName() + " submitted a leave request for review.",
                NotificationType.INFO,
                saved
            );
            emailService.sendLeaveSubmittedEmail(
                saved.getManager(),
                saved,
                currentUser.getFirstName() + " " + currentUser.getLastName() + " submitted a leave request for your review."
            );
        } else {
            userService.getUsersByRoles(List.of(Role.ADMIN)).forEach(admin -> notificationService.create(
                admin,
                "Leave request awaiting review",
                currentUser.getFirstName() + " " + currentUser.getLastName() + " submitted a leave request needing approval.",
                NotificationType.INFO,
                saved
            ));
            userService.getUsersByRoles(List.of(Role.ADMIN)).forEach(admin ->
                emailService.sendLeaveSubmittedEmail(
                    admin,
                    saved,
                    currentUser.getFirstName() + " " + currentUser.getLastName() + " submitted a leave request requiring admin review."
                )
            );
        }

        return leaveRequestMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestResponse> getMyRequests(String email, LeaveRequestStatus status, Integer year, Long leaveTypeId) {
        User currentUser = userService.getActiveUserByEmail(email);
        return leaveRequestRepository.findAllByUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
            .filter(request -> status == null || request.getStatus() == status)
            .filter(request -> year == null || request.getStartDate().getYear() == year)
            .filter(request -> leaveTypeId == null || request.getLeaveType().getId().equals(leaveTypeId))
            .map(leaveRequestMapper::toResponse)
            .toList();
    }

    @Transactional
    public LeaveRequestResponse cancel(String email, Long id, HttpServletRequest httpRequest) {
        User currentUser = userService.getActiveUserByEmail(email);
        LeaveRequest leaveRequest = leaveRequestRepository.findByIdAndUserId(id, currentUser.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Leave request not found."));

        if (!(leaveRequest.getStatus() == LeaveRequestStatus.PENDING || leaveRequest.getStatus() == LeaveRequestStatus.APPROVED_BY_MANAGER)) {
            throw new UnauthorizedActionException("Only pending requests can be cancelled.");
        }

        LeaveRequestStatus previousStatus = leaveRequest.getStatus();
        leaveRequest.setStatus(LeaveRequestStatus.CANCELLED);
        leaveRequest.setUpdatedAt(LocalDateTime.now());
        auditLogService.log(currentUser, "CANCEL_REQUEST", "LEAVE_REQUEST", leaveRequest.getId(), previousStatus.name(), LeaveRequestStatus.CANCELLED.name(), clientIp(httpRequest));

        if (leaveRequest.getManager() != null) {
            notificationService.create(
                leaveRequest.getManager(),
                "Leave request cancelled",
                currentUser.getFirstName() + " " + currentUser.getLastName() + " cancelled a pending leave request.",
                NotificationType.WARNING,
                leaveRequest
            );
        }

        return leaveRequestMapper.toResponse(leaveRequest);
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestResponse> getManagerRequests(String email, LeaveRequestStatus status) {
        User manager = userService.getActiveUserByEmail(email);
        List<LeaveRequest> requests = status == null
            ? leaveRequestRepository.findAllByManagerIdOrderByCreatedAtDesc(manager.getId())
            : leaveRequestRepository.findAllByManagerIdAndStatusOrderByCreatedAtDesc(manager.getId(), status);

        return requests.stream()
            .filter(request -> request.getUser().getRole() == Role.EMPLOYEE)
            .map(leaveRequestMapper::toResponse)
            .toList();
    }

    @Transactional
    public LeaveRequestResponse managerApprove(String email, Long id, ApproveRejectDto request, HttpServletRequest httpRequest) {
        User manager = userService.getActiveUserByEmail(email);
        LeaveRequest leaveRequest = leaveRequestRepository.findByIdAndManagerId(id, manager.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Leave request not found."));

        if (leaveRequest.getStatus() != LeaveRequestStatus.PENDING) {
            throw new UnauthorizedActionException("Only pending requests can be manager-approved.");
        }

        userService.ensureManages(manager, leaveRequest.getUser());
        LeaveRequestStatus previousStatus = leaveRequest.getStatus();

        leaveRequest.setManager(manager);
        leaveRequest.setManagerComment(request.comment());
        leaveRequest.setManagerActionDate(LocalDateTime.now());

        if (requiresAdminFinalApproval(leaveRequest)) {
            leaveRequest.setStatus(LeaveRequestStatus.APPROVED_BY_MANAGER);
            userService.getUsersByRoles(List.of(Role.ADMIN)).stream()
                .forEach(admin -> notificationService.create(
                    admin,
                    "Leave request awaiting final approval",
                    leaveRequest.getUser().getFirstName() + " " + leaveRequest.getUser().getLastName() + " has a request awaiting admin approval.",
                    NotificationType.WARNING,
                    leaveRequest
                ));
        } else {
            leaveRequest.setStatus(LeaveRequestStatus.APPROVED);
            leaveBalanceService.consumeApprovedDays(leaveRequest.getUser(), leaveRequest.getLeaveType(), leaveRequest.getStartDate(), leaveRequest.getTotalDays());
            notificationService.create(
                leaveRequest.getUser(),
                "Leave request approved",
                "Your leave request has been approved by your manager.",
                NotificationType.SUCCESS,
                leaveRequest
            );
            emailService.sendLeaveApprovedEmail(leaveRequest.getUser(), leaveRequest, request.comment());
        }

        auditLogService.log(manager, "MANAGER_APPROVE", "LEAVE_REQUEST", leaveRequest.getId(), previousStatus.name(), leaveRequest.getStatus().name(), clientIp(httpRequest));
        return leaveRequestMapper.toResponse(leaveRequest);
    }

    @Transactional
    public LeaveRequestResponse managerReject(String email, Long id, ApproveRejectDto request, HttpServletRequest httpRequest) {
        User manager = userService.getActiveUserByEmail(email);
        LeaveRequest leaveRequest = leaveRequestRepository.findByIdAndManagerId(id, manager.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Leave request not found."));

        if (leaveRequest.getStatus() != LeaveRequestStatus.PENDING) {
            throw new UnauthorizedActionException("Only pending requests can be manager-rejected.");
        }

        userService.ensureManages(manager, leaveRequest.getUser());
        LeaveRequestStatus previousStatus = leaveRequest.getStatus();
        leaveRequest.setStatus(LeaveRequestStatus.REJECTED_BY_MANAGER);
        leaveRequest.setManager(manager);
        leaveRequest.setManagerComment(request.comment());
        leaveRequest.setManagerActionDate(LocalDateTime.now());
        auditLogService.log(manager, "MANAGER_REJECT", "LEAVE_REQUEST", leaveRequest.getId(), previousStatus.name(), LeaveRequestStatus.REJECTED_BY_MANAGER.name(), clientIp(httpRequest));

        notificationService.create(
            leaveRequest.getUser(),
            "Leave request rejected",
            "Your leave request has been rejected by your manager.",
            NotificationType.ERROR,
            leaveRequest
        );
        emailService.sendLeaveRejectedEmail(leaveRequest.getUser(), leaveRequest, request.comment());

        return leaveRequestMapper.toResponse(leaveRequest);
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestResponse> getAdminRequests(LeaveRequestStatus status) {
        List<LeaveRequest> requests = status == null
            ? leaveRequestRepository.findAllByOrderByCreatedAtDesc()
            : leaveRequestRepository.findAllByStatusOrderByCreatedAtDesc(status);
        return requests.stream().map(leaveRequestMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<LeaveRequestResponse> getAdminRequestsPage(int page, int size, LeaveRequestStatus status) {
        var pageable = PageRequest.of(page, size);
        var result = status == null ? leaveRequestRepository.findAll(pageable) : leaveRequestRepository.findAllByStatus(status, pageable);
        return PageResponse.from(result.map(leaveRequestMapper::toResponse), "createdAt", "desc");
    }

    @Transactional(readOnly = true)
    public List<CalendarEventResponse> getTeamCalendar(String email, LocalDate from, LocalDate to) {
        User manager = userService.getActiveUserByEmail(email);
        return leaveRequestRepository.findAllByStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByStartDateAsc(
                List.of(LeaveRequestStatus.APPROVED, LeaveRequestStatus.APPROVED_BY_MANAGER),
                to,
                from
            ).stream()
            .filter(request -> request.getUser().getManager() != null && request.getUser().getManager().getId().equals(manager.getId()))
            .map(this::toCalendarEvent)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<CalendarEventResponse> getMyCalendar(String email, Integer year) {
        User currentUser = userService.getActiveUserByEmail(email);
        return leaveRequestRepository.findAllByUserIdAndStatusInOrderByCreatedAtDesc(
                currentUser.getId(),
                List.of(LeaveRequestStatus.APPROVED, LeaveRequestStatus.APPROVED_BY_MANAGER, LeaveRequestStatus.PENDING, LeaveRequestStatus.REJECTED, LeaveRequestStatus.CANCELLED)
            ).stream()
            .filter(request -> year == null || request.getStartDate().getYear() == year || request.getEndDate().getYear() == year)
            .map(this::toCalendarEvent)
            .toList();
    }

    @Transactional
    public LeaveRequestResponse adminApprove(String email, Long id, ApproveRejectDto request, HttpServletRequest httpRequest) {
        User admin = userService.getActiveUserByEmail(email);
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Leave request not found."));

        if (!(leaveRequest.getStatus() == LeaveRequestStatus.PENDING || leaveRequest.getStatus() == LeaveRequestStatus.APPROVED_BY_MANAGER)) {
            throw new UnauthorizedActionException("This request is not awaiting admin approval.");
        }

        LeaveRequestStatus previousStatus = leaveRequest.getStatus();
        leaveRequest.setStatus(LeaveRequestStatus.APPROVED);
        leaveRequest.setAdmin(admin);
        leaveRequest.setAdminComment(request.comment());
        leaveRequest.setAdminActionDate(LocalDateTime.now());
        leaveBalanceService.consumeApprovedDays(leaveRequest.getUser(), leaveRequest.getLeaveType(), leaveRequest.getStartDate(), leaveRequest.getTotalDays());
        auditLogService.log(admin, "ADMIN_APPROVE", "LEAVE_REQUEST", leaveRequest.getId(), previousStatus.name(), LeaveRequestStatus.APPROVED.name(), clientIp(httpRequest));

        notificationService.create(
            leaveRequest.getUser(),
            "Leave request approved",
            "Your leave request has been approved.",
            NotificationType.SUCCESS,
            leaveRequest
        );
        emailService.sendLeaveApprovedEmail(leaveRequest.getUser(), leaveRequest, request.comment());

        return leaveRequestMapper.toResponse(leaveRequest);
    }

    @Transactional
    public LeaveRequestResponse adminReject(String email, Long id, ApproveRejectDto request, HttpServletRequest httpRequest) {
        User admin = userService.getActiveUserByEmail(email);
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Leave request not found."));

        if (!(leaveRequest.getStatus() == LeaveRequestStatus.PENDING || leaveRequest.getStatus() == LeaveRequestStatus.APPROVED_BY_MANAGER)) {
            throw new UnauthorizedActionException("This request is not awaiting admin action.");
        }

        LeaveRequestStatus previousStatus = leaveRequest.getStatus();
        leaveRequest.setStatus(LeaveRequestStatus.REJECTED);
        leaveRequest.setAdmin(admin);
        leaveRequest.setAdminComment(request.comment());
        leaveRequest.setAdminActionDate(LocalDateTime.now());
        auditLogService.log(admin, "ADMIN_REJECT", "LEAVE_REQUEST", leaveRequest.getId(), previousStatus.name(), LeaveRequestStatus.REJECTED.name(), clientIp(httpRequest));

        notificationService.create(
            leaveRequest.getUser(),
            "Leave request rejected",
            "Your leave request has been rejected by an administrator.",
            NotificationType.ERROR,
            leaveRequest
        );
        emailService.sendLeaveRejectedEmail(leaveRequest.getUser(), leaveRequest, request.comment());

        return leaveRequestMapper.toResponse(leaveRequest);
    }

    @Transactional(readOnly = true)
    public OverlapCheckResponse checkOverlap(String email, LocalDate startDate, LocalDate endDate) {
        User currentUser = userService.getActiveUserByEmail(email);
        ensureDateRange(startDate, endDate);
        BigDecimal workingDays = calculateWorkingDays(startDate, endDate);
        boolean overlap = leaveRequestRepository.existsByUserIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            currentUser.getId(),
            ACTIVE_REQUEST_STATUSES,
            endDate,
            startDate
        );
        return new OverlapCheckResponse(overlap, workingDays);
    }

    private void ensureNoOverlap(Long userId, LocalDate startDate, LocalDate endDate, Long requestIdToIgnore) {
        ensureDateRange(startDate, endDate);
        boolean overlap = requestIdToIgnore == null
            ? leaveRequestRepository.existsByUserIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                userId,
                ACTIVE_REQUEST_STATUSES,
                endDate,
                startDate
            )
            : leaveRequestRepository.existsByUserIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqualAndIdNot(
                userId,
                ACTIVE_REQUEST_STATUSES,
                endDate,
                startDate,
                requestIdToIgnore
            );
        if (overlap) {
            throw new LeaveOverlapException("Leave request overlaps an existing active request.");
        }
    }

    private void ensureDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null || endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("Invalid leave request date range.");
        }
    }

    private BigDecimal calculateWorkingDays(LocalDate startDate, LocalDate endDate) {
        Set<LocalDate> publicHolidays = publicHolidayService.getHolidayDatesBetween(startDate, endDate);
        long workingDays = workingDaysCalculator.calculate(startDate, endDate, publicHolidays);
        if (workingDays <= 0) {
            throw new IllegalArgumentException("Selected date range does not contain any working days.");
        }
        return BigDecimal.valueOf(workingDays).setScale(1, RoundingMode.HALF_UP);
    }

    private boolean requiresAdminFinalApproval(LeaveRequest leaveRequest) {
        return leaveRequest.getUser().getRole() == Role.MANAGER
            || leaveRequest.getUser().getManager() == null
            || leaveRequest.getTotalDays().compareTo(BigDecimal.valueOf(5)) > 0;
    }

    private String clientIp(HttpServletRequest request) {
        return request != null ? request.getRemoteAddr() : null;
    }

    private CalendarEventResponse toCalendarEvent(LeaveRequest request) {
        LeaveRequestResponse response = leaveRequestMapper.toResponse(request);
        return new CalendarEventResponse(
            request.getId(),
            response.employee(),
            response.leaveType(),
            request.getStartDate(),
            request.getEndDate(),
            request.getStatus(),
            request.getLeaveType().getName()
        );
    }
}
