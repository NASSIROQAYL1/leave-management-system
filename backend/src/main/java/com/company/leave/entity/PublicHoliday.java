package com.company.leave.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
    name = "public_holidays",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_public_holidays_date_name", columnNames = {"date", "name"})
    },
    indexes = {
        @Index(name = "idx_public_holidays_year", columnList = "year")
    }
)
public class PublicHoliday extends CreatedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String name;

    @NotNull
    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "year")
    private Integer year;

    @Column(name = "is_recurring", nullable = false)
    private Boolean recurring;
}
