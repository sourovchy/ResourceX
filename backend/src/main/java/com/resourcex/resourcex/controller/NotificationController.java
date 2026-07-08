package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.NotificationRequest;
import com.resourcex.resourcex.dto.response.NotificationResponse;
import com.resourcex.resourcex.entity.Notification;
import com.resourcex.resourcex.service.AuthService;
import com.resourcex.resourcex.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    /**
     * Create a new notification (admin/moderator only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<NotificationResponse> createNotification(@Valid @RequestBody NotificationRequest request) {
        NotificationResponse response = notificationService.createNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get notification by ID
     */
    @GetMapping("/{notificationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationResponse> getNotificationById(@PathVariable Long notificationId) {
        NotificationResponse response = notificationService.getNotificationById(notificationId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get the current user's notifications, paginated and newest-first.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<NotificationResponse>> getMyNotificationsPaged(
            @PageableDefault(size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Long userId = authService.getCurrentUser().getUser().getUserId();
        return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId, pageable));
    }

    /**
     * Get all notifications for the current user
     */
    @GetMapping("/user/all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications() {
        // Note: In production, extract userId from SecurityContext
        // For now, this is a placeholder that should be implemented with proper
        // security
        List<NotificationResponse> response = notificationService.getNotificationsByUserId(authService.getCurrentUser().getUser().getUserId());
        return ResponseEntity.ok(response);
    }

    /**
     * Get all unread notifications for the current user
     */
    @GetMapping("/user/unread")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationResponse>> getMyUnreadNotifications() {
        // Note: In production, extract userId from SecurityContext
        List<NotificationResponse> response = notificationService.getUnreadNotificationsByUserId(authService.getCurrentUser().getUser().getUserId());
        return ResponseEntity.ok(response);
    }

    /**
     * Get unread count for the current user
     */
    @GetMapping("/user/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getUnreadCount() {
        // Note: In production, extract userId from SecurityContext
        Long userId = authService.getCurrentUser().getUser().getUserId();
        Long unreadCount = notificationService.getUnreadCountByUserId(userId);
        Long totalCount = notificationService.getTotalCountByUserId(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("unreadCount", unreadCount);
        response.put("totalCount", totalCount);

        return ResponseEntity.ok(response);
    }

    /**
     * Get notifications by type for the current user
     */
    @GetMapping("/user/type/{type}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationResponse>> getNotificationsByType(
            @PathVariable Notification.NotificationType type) {
        // Note: In production, extract userId from SecurityContext
        List<NotificationResponse> response = notificationService.getNotificationsByUserIdAndType(authService.getCurrentUser().getUser().getUserId(), type);
        return ResponseEntity.ok(response);
    }

    /**
     * Get notifications by entity
     */
    @GetMapping("/entity")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<List<NotificationResponse>> getNotificationsByEntity(
            @RequestParam Notification.RelatedEntityType entityType,
            @RequestParam Long entityId) {
        List<NotificationResponse> response = notificationService.getNotificationsByEntity(entityType, entityId);
        return ResponseEntity.ok(response);
    }

    /**
     * Mark notification as read
     */
    @PatchMapping("/{notificationId}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long notificationId) {
        NotificationResponse response = notificationService.markAsRead(notificationId);
        return ResponseEntity.ok(response);
    }

    /**
     * Mark all notifications as read for the current user
     */
    @PatchMapping("/user/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead(authService.getCurrentUser().getUser().getUserId());
        return ResponseEntity.noContent().build();
    }

    /**
     * Mark notification as unread
     */
    @PatchMapping("/{notificationId}/unread")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationResponse> markAsUnread(@PathVariable Long notificationId) {
        NotificationResponse response = notificationService.markAsUnread(notificationId);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete notification
     */
    @DeleteMapping("/{notificationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Delete all read notifications for the current user
     */
    @DeleteMapping("/user/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteReadNotifications() {
        notificationService.deleteReadNotifications(authService.getCurrentUser().getUser().getUserId());
        return ResponseEntity.noContent().build();
    }

    /**
     * Create booking notification (admin/moderator only)
     */
    @PostMapping("/booking")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<NotificationResponse> createBookingNotification(
            @RequestParam Long userId,
            @RequestParam Long bookingId,
            @RequestParam String message,
            @RequestParam(required = false) Long userIdParam) {
        NotificationResponse response = notificationService.createBookingNotification(
                userId, bookingId, message, userIdParam);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Create trust notification (admin/moderator only)
     */
    @PostMapping("/trust")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<NotificationResponse> createTrustNotification(
            @RequestParam Long userId,
            @RequestParam Long trustEventId,
            @RequestParam String message,
            @RequestParam(required = false) Long userIdParam) {
        NotificationResponse response = notificationService.createTrustNotification(
                userId, trustEventId, message, userIdParam);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Create admin notification (admin/moderator only)
     */
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<NotificationResponse> createAdminNotification(
            @RequestParam Long userId,
            @RequestParam String message,
            @RequestParam(required = false) Long userIdParam) {
        NotificationResponse response = notificationService.createAdminNotification(
                userId, message, userIdParam);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Broadcast notification to multiple users (admin/moderator only)
     */
    @PostMapping("/broadcast")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> broadcastNotification(
            @RequestParam List<Long> userIds,
            @RequestParam Notification.NotificationType type,
            @RequestParam String message,
            @RequestParam Notification.RelatedEntityType entityType,
            @RequestParam(required = false) Long entityId,
            @RequestParam(required = false) Long userIdParam) {
        notificationService.broadcastNotification(userIds, type, message, entityType, entityId, userIdParam);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
