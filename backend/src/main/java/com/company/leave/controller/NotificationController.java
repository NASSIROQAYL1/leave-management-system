//HNA USER KAYXOF NOTIFICATION DYALO WAX TQBLO DOMOND WLA TRFD

package com.company.leave.controller;

import com.company.leave.dto.response.NotificationCountResponse;
import com.company.leave.dto.response.NotificationResponse;
import com.company.leave.dto.response.PageResponse;
import com.company.leave.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public PageResponse<NotificationResponse> list(
        @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal,
        @RequestParam(required = false, name = "unread") Boolean unreadOnly,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return notificationService.getMyNotificationsPage(principal.getUsername(), unreadOnly, page, size);
    }

    @PutMapping("/{id}/read")
    public NotificationResponse read(
        @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal,
        @PathVariable Long id
    ) {
        return notificationService.markRead(principal.getUsername(), id);
    }

    @PutMapping("/read-all")
    public void readAll(@AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {
        notificationService.markAllRead(principal.getUsername());
    }

    @GetMapping("/count-unread")
    public NotificationCountResponse countUnread(@AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {
        return notificationService.countUnread(principal.getUsername());
    }
}
