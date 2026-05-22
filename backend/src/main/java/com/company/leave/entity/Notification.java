package com.company.leave.entity;

import com.company.leave.entity.enums.NotificationType;
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
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
    name = "notifications",
    indexes = {
        @Index(name = "idx_notifications_user_is_read", columnList = "user_id,is_read")
    }
)
public class Notification extends CreatedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Size(max = 255)
    @Column(length = 255)
    private String title;

    @Size(max = 4000)
    @Column(columnDefinition = "TEXT")
    private String message;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationType type;

    @Column(name = "is_read", nullable = false)
    private Boolean read;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_request_id")
    private LeaveRequest relatedRequest;
}
