package com.company.leave.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
    name = "leave_balances",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_leave_balances_user_type_year", columnNames = {"user_id", "leave_type_id", "year"})
    },
    indexes = {
        @Index(name = "idx_leave_balances_user_id", columnList = "user_id"),
        @Index(name = "idx_leave_balances_year", columnList = "year")
    }
)
public class LeaveBalance {

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
    @Min(2000)
    @Column(name = "year", nullable = false)
    private Integer year;

    @NotNull
    @Min(0)
    @Column(name = "total_days", nullable = false)
    private Integer totalDays;

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "used_days", nullable = false, precision = 5, scale = 1)
    private BigDecimal usedDays;
}
