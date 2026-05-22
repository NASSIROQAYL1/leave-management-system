package com.company.leave.entity;

import com.company.leave.entity.enums.LeaveRequestStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.hibernate.annotations.Check;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
    name = "leave_requests",
    indexes = {
        @Index(name = "idx_leave_requests_user_id", columnList = "user_id"),
        @Index(name = "idx_leave_requests_status", columnList = "status"),
        @Index(name = "idx_leave_requests_dates", columnList = "start_date,end_date")
    }
)
@Check(constraints = "end_date >= start_date")
public class LeaveRequest extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @NotNull
    @DecimalMin("0.5")
    @Column(name = "total_days", nullable = false, precision = 5, scale = 1)
    private BigDecimal totalDays;

    @Size(max = 4000)
    @Column(columnDefinition = "TEXT")
    private String reason;

    @Size(max = 500)
    @Column(name = "attachment_url", length = 500)
    private String attachmentUrl;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private LeaveRequestStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;

    @Column(name = "manager_comment", columnDefinition = "TEXT")
    private String managerComment;

    @Column(name = "manager_action_date")
    private LocalDateTime managerActionDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private User admin;

    @Column(name = "admin_comment", columnDefinition = "TEXT")
    private String adminComment;

    @Column(name = "admin_action_date")
    private LocalDateTime adminActionDate;

    public boolean isPending() {
        return status == LeaveRequestStatus.PENDING || status == LeaveRequestStatus.APPROVED_BY_MANAGER;
    }
}
