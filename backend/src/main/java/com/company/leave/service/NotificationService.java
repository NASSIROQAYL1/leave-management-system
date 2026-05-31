package com.company.leave.service;

import com.company.leave.dto.response.NotificationCountResponse;
import com.company.leave.dto.response.NotificationResponse;
import com.company.leave.dto.response.PageResponse;
import com.company.leave.entity.LeaveRequest;
import com.company.leave.entity.Notification;
import com.company.leave.entity.User;
import com.company.leave.entity.enums.NotificationType;
import com.company.leave.exception.ResourceNotFoundException;
import com.company.leave.mapper.NotificationMapper;
import com.company.leave.repository.NotificationRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final UserService userService;

    @Transactional
    public NotificationResponse create(User user, String title, String message, NotificationType type, LeaveRequest relatedRequest) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        notification.setRelatedRequest(relatedRequest);
        return notificationMapper.toResponse(notificationRepository.save(notification));
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(String email, Boolean unreadOnly) {
        User currentUser = userService.getActiveUserByEmail(email);
        List<Notification> notifications = Boolean.TRUE.equals(unreadOnly)
            ? notificationRepository.findAllByUserIdAndReadOrderByCreatedAtDesc(currentUser.getId(), false)
            : notificationRepository.findAllByUserIdOrderByCreatedAtDesc(currentUser.getId());
        return notifications.stream().map(notificationMapper::toResponse).toList();
    }

    @Transactional
    public NotificationResponse markRead(String email, Long notificationId) {
        User currentUser = userService.getActiveUserByEmail(email);
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, currentUser.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));
        notification.setRead(true);
        return notificationMapper.toResponse(notification);
    }

    @Transactional
    public void markAllRead(String email) {
        User currentUser = userService.getActiveUserByEmail(email);
        notificationRepository.findAllByUserIdAndReadOrderByCreatedAtDesc(currentUser.getId(), false)
            .forEach(notification -> notification.setRead(true));
    }

    @Transactional(readOnly = true)
    public NotificationCountResponse countUnread(String email) {
        User currentUser = userService.getActiveUserByEmail(email);
        return new NotificationCountResponse(notificationRepository.countByUserIdAndReadFalse(currentUser.getId()));
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getMyNotificationsPage(String email, Boolean unreadOnly, int page, int size) {
        List<NotificationResponse> notifications = getMyNotifications(email, unreadOnly);
        int fromIndex = Math.min(page * size, notifications.size());
        int toIndex = Math.min(fromIndex + size, notifications.size());
        return PageResponse.from(
            new PageImpl<>(notifications.subList(fromIndex, toIndex), PageRequest.of(page, size), notifications.size()),
            "createdAt",
            "desc"
        );
    }
}
