package com.company.leave.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.LinkedHashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
    name = "leave_types",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_leave_types_name", columnNames = "name")
    }
)
public class LeaveType extends CreatedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @Size(max = 4000)
    @Column(columnDefinition = "TEXT")
    private String description;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$")
    @Column(name = "color_hex", length = 7)
    private String colorHex;

    @Column(name = "max_days_per_year")
    private Integer maxDaysPerYear;

    @Column(name = "requires_document", nullable = false)
    private Boolean requiresDocument;

    @Column(name = "is_paid", nullable = false)
    private Boolean paid;

    @Column(name = "is_active", nullable = false)
    private Boolean active;

    @OneToMany(mappedBy = "leaveType")
    private Set<LeaveBalance> leaveBalances = new LinkedHashSet<>();

    @OneToMany(mappedBy = "leaveType")
    private Set<LeaveRequest> leaveRequests = new LinkedHashSet<>();
}
