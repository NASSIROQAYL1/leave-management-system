package com.company.leave.dto.response;

import com.company.leave.entity.enums.NotificationType;
import java.time.LocalDateTime;

public record NotificationResponse(
    Long id,
    UserSummaryResponse user,
    String title,
    String message,
    NotificationType type,
    Boolean read,
    Long relatedRequestId,
    LocalDateTime createdAt
) {
}
