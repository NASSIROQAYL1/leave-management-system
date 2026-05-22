package com.company.leave.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public abstract class AuditableEntity extends CreatedEntity {

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Override
    @PrePersist
    protected void onCreate() {
        super.onCreate();
        this.updatedAt = getCreatedAt();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
