package com.company.leave.entity;

import com.company.leave.entity.enums.Role;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
    name = "users",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_users_email", columnNames = "email")
    },
    indexes = {
        @Index(name = "idx_users_department_id", columnList = "department_id"),
        @Index(name = "idx_users_manager_id", columnList = "manager_id"),
        @Index(name = "idx_users_role", columnList = "role")
    }
)
public class User extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @NotBlank
    @Size(max = 100)
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @NotBlank
    @Email
    @Size(max = 255)
    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false, length = 255)
    private String password;

    @Size(max = 20)
    @Column(length = 20)
    private String phone;

    @Size(max = 500)
    @Column(name = "profile_picture", length = 500)
    private String profilePicture;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;

    @OneToMany(mappedBy = "manager", cascade = CascadeType.PERSIST)
    private Set<User> directReports = new LinkedHashSet<>();

    @OneToMany(mappedBy = "user")
    private Set<LeaveBalance> leaveBalances = new LinkedHashSet<>();

    @OneToMany(mappedBy = "user")
    private Set<LeaveRequest> leaveRequests = new LinkedHashSet<>();

    @OneToMany(mappedBy = "manager")
    private Set<LeaveRequest> managedLeaveRequests = new LinkedHashSet<>();

    @OneToMany(mappedBy = "admin")
    private Set<LeaveRequest> administeredLeaveRequests = new LinkedHashSet<>();

    @OneToMany(mappedBy = "user")
    private Set<Notification> notifications = new LinkedHashSet<>();

    @OneToMany(mappedBy = "user")
    private Set<RefreshToken> refreshTokens = new LinkedHashSet<>();

    @OneToMany(mappedBy = "user")
    private Set<AuditLog> auditLogs = new LinkedHashSet<>();

    @Column(name = "is_active", nullable = false)
    private Boolean active;

    @Column(name = "failed_login_attempts", nullable = false)
    private Integer failedLoginAttempts;

    @Column(name = "account_locked_until")
    private java.time.LocalDateTime accountLockedUntil;
}
