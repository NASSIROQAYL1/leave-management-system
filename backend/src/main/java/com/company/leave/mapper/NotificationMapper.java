package com.company.leave.mapper;

import com.company.leave.dto.response.NotificationResponse;
import com.company.leave.entity.Notification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationMapper {

    private final UserMapper userMapper;

    public NotificationResponse toResponse(Notification notification) {
        if (notification == null) {
            return null;
        }
        return new NotificationResponse(
            notification.getId(),
            userMapper.toSummary(notification.getUser()),
            notification.getTitle(),
            notification.getMessage(),
            notification.getType(),
            notification.getRead(),
            notification.getRelatedRequest() != null ? notification.getRelatedRequest().getId() : null,
            notification.getCreatedAt()
        );
    }
}
