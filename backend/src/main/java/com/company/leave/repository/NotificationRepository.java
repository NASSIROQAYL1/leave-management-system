package com.company.leave.repository;

import com.company.leave.entity.Notification;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    long countByUserIdAndReadFalse(Long userId);
    List<Notification> findAllByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findAllByUserIdAndReadOrderByCreatedAtDesc(Long userId, Boolean read);
    Optional<Notification> findByIdAndUserId(Long id, Long userId);
}
