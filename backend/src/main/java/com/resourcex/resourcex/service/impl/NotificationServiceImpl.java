package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.NotificationRequest;
import com.resourcex.resourcex.dto.response.NotificationResponse;
import com.resourcex.resourcex.entity.Notification;

import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.mapper.NotificationMapper;
import com.resourcex.resourcex.repository.NotificationRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.NotificationService;
import com.resourcex.resourcex.validator.NotificationValidator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;
    private final NotificationValidator notificationValidator;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public NotificationResponse createNotification(NotificationRequest request) {
        log.info("Creating notification for user: {}", request.getUserId());

        // Validate request
        notificationValidator.validateCreateRequest(request);

        // Fetch user
        User user = requireUser(request.getUserId());

        // Fetch user if createdByUserId is provided
        User createdBy = null;
        if (request.getCreatedByUserId() != null) {
            createdBy = userRepository.findById(request.getCreatedByUserId())
                    .orElseThrow(() -> {
                        log.error("Admin/User not found: {}", request.getCreatedByUserId());
                        return new ResourceNotFoundException("Admin/User not found");
                    });
        }

        // Build and save notification
        Notification notification = Notification.builder()
                .user(user)
                .notificationType(request.getNotificationType())
                .message(request.getMessage())
                .relatedEntityType(request.getRelatedEntityType())
                .relatedEntityId(request.getRelatedEntityId())
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("Notification created with ID: {}", saved.getNotificationId());
        
        NotificationResponse response = notificationMapper.toResponse(saved);
        messagingTemplate.convertAndSend("/topic/notifications/" + request.getUserId(), response);

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationResponse getNotificationById(Long notificationId) {
        log.info("Fetching notification: {}", notificationId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> {
                    log.error("Notification not found: {}", notificationId);
                    return new ResourceNotFoundException("Notification not found");
                });

        return notificationMapper.toResponse(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsByUserId(Long userId) {
        log.info("Fetching all notifications for user: {}", userId);

        requireUser(userId);

        List<Notification> notifications = notificationRepository.findByUserUserIdOrderByCreatedAtDesc(userId);
        return notifications.stream()
                .map(notificationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotificationsByUserId(Long userId, Pageable pageable) {
        requireUser(userId);

        return notificationRepository
                .findByUserUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(notificationMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotificationsByUserId(Long userId) {
        log.info("Fetching unread notifications for user: {}", userId);

        requireUser(userId);

        List<Notification> notifications = notificationRepository
                .findByUserUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        return notifications.stream()
                .map(notificationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getReadNotificationsByUserId(Long userId) {
        log.info("Fetching read notifications for user: {}", userId);

        requireUser(userId);

        List<Notification> notifications = notificationRepository
                .findByUserUserIdAndIsReadTrueOrderByCreatedAtDesc(userId);
        return notifications.stream()
                .map(notificationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsByUserIdAndType(Long userId, Notification.NotificationType type) {
        log.info("Fetching notifications for user: {} with type: {}", userId, type);

        requireUser(userId);

        List<Notification> notifications = notificationRepository
                .findByUserUserIdAndNotificationTypeOrderByCreatedAtDesc(userId, type);
        return notifications.stream()
                .map(notificationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsByEntity(
            Notification.RelatedEntityType entityType,
            Long entityId) {
        log.info("Fetching notifications for entity type: {} with ID: {}", entityType, entityId);

        List<Notification> notifications = notificationRepository
                .findByRelatedEntityTypeAndRelatedEntityIdOrderByCreatedAtDesc(entityType, entityId);
        return notifications.stream()
                .map(notificationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Long getUnreadCountByUserId(Long userId) {
        log.debug("Getting unread count for user: {}", userId);

        // Verify user exists
        requireUser(userId);

        return notificationRepository.countByUserUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Long getTotalCountByUserId(Long userId) {
        log.debug("Getting total count for user: {}", userId);

        // Verify user exists
        requireUser(userId);

        return notificationRepository.countByUserUserId(userId);
    }

    @Override
    public NotificationResponse markAsRead(Long notificationId) {
        log.info("Marking notification as read: {}", notificationId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> {
                    log.error("Notification not found: {}", notificationId);
                    return new ResourceNotFoundException("Notification not found");
                });

        if (!notification.getIsRead()) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            Notification updated = notificationRepository.save(notification);
            log.info("Notification marked as read: {}", notificationId);
            return notificationMapper.toResponse(updated);
        }

        return notificationMapper.toResponse(notification);
    }

    @Override
    public void markAllAsRead(Long userId) {
        log.info("Marking all notifications as read for user: {}", userId);

        requireUser(userId);

        List<Notification> unreadNotifications = notificationRepository
                .findByUserUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);

        LocalDateTime now = LocalDateTime.now();
        unreadNotifications.forEach(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(now);
        });

        notificationRepository.saveAll(unreadNotifications);
        log.info("Marked {} notifications as read for user: {}", unreadNotifications.size(), userId);
    }

    @Override
    public NotificationResponse markAsUnread(Long notificationId) {
        log.info("Marking notification as unread: {}", notificationId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> {
                    log.error("Notification not found: {}", notificationId);
                    return new ResourceNotFoundException("Notification not found");
                });

        if (notification.getIsRead()) {
            notification.setIsRead(false);
            notification.setReadAt(null);
            Notification updated = notificationRepository.save(notification);
            log.info("Notification marked as unread: {}", notificationId);
            return notificationMapper.toResponse(updated);
        }

        return notificationMapper.toResponse(notification);
    }

    @Override
    public void deleteNotification(Long notificationId) {
        log.info("Deleting notification: {}", notificationId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> {
                    log.error("Notification not found: {}", notificationId);
                    return new ResourceNotFoundException("Notification not found");
                });

        notificationRepository.delete(notification);
        log.info("Notification deleted: {}", notificationId);
    }

    @Override
    public void deleteReadNotifications(Long userId) {
        log.info("Deleting all read notifications for user: {}", userId);

        requireUser(userId);

        notificationRepository.deleteReadNotificationsByUserId(userId);
        log.info("Read notifications deleted for user: {}", userId);
    }

    @Override
    public NotificationResponse createBookingNotification(
            Long userId, Long bookingId, String message, Long createdByUserId) {
        return createTyped(userId, Notification.NotificationType.BOOKING,
                Notification.RelatedEntityType.BOOKING, bookingId, message, createdByUserId);
    }

    @Override
    public NotificationResponse createTrustNotification(
            Long userId, Long trustEventId, String message, Long createdByUserId) {
        return createTyped(userId, Notification.NotificationType.TRUST,
                Notification.RelatedEntityType.TRUST, trustEventId, message, createdByUserId);
    }

    @Override
    public NotificationResponse createMessageNotification(
            Long userId, Long conversationId, String message, Long createdByUserId) {
        return createTyped(userId, Notification.NotificationType.MESSAGE,
                Notification.RelatedEntityType.MESSAGE, conversationId, message, createdByUserId);
    }

    @Override
    public NotificationResponse createReviewNotification(
            Long userId, Long reviewId, String message, Long createdByUserId) {
        return createTyped(userId, Notification.NotificationType.REVIEW,
                Notification.RelatedEntityType.REVIEW, reviewId, message, createdByUserId);
    }

    @Override
    public NotificationResponse createAdminNotification(
            Long userId, String message, Long createdByUserId) {
        return createTyped(userId, Notification.NotificationType.ADMIN,
                Notification.RelatedEntityType.ADMIN, null, message, createdByUserId);
    }

    /** Shared builder for the typed convenience factories above. */
    private NotificationResponse createTyped(
            Long userId,
            Notification.NotificationType type,
            Notification.RelatedEntityType entityType,
            Long entityId,
            String message,
            Long createdByUserId) {
        return createNotification(NotificationRequest.builder()
                .userId(userId)
                .notificationType(type)
                .message(message)
                .relatedEntityType(entityType)
                .relatedEntityId(entityId)
                .createdByUserId(createdByUserId)
                .build());
    }

    /** Fetch a user or throw a 404 — the verify-user guard repeated across reads/mutations. */
    private User requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User not found: {}", userId);
                    return new ResourceNotFoundException("User not found");
                });
    }

    @Override
    public void broadcastNotification(
            List<Long> userIds,
            Notification.NotificationType type,
            String message,
            Notification.RelatedEntityType entityType,
            Long entityId,
            Long createdByUserId) {
        log.info("Broadcasting notification to {} users", userIds.size());

        // Fetch user once and make it final for lambda use
        final User createdBy;
        if (createdByUserId != null) {
            createdBy = userRepository.findById(createdByUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("Admin/User not found"));
        } else {
            createdBy = null;
        }

        final LocalDateTime now = LocalDateTime.now();

        List<Notification> notifications = userIds.stream()
                .map(userId -> {
                    User user = userRepository.findById(userId)
                            .orElse(null);

                    if (user == null) {
                        log.warn("User not found for broadcast: {}", userId);
                        return null;
                    }

                    return Notification.builder()
                            .user(user)
                            .notificationType(type)
                            .message(message)
                            .relatedEntityType(entityType)
                            .relatedEntityId(entityId)
                            .isRead(false)
                            .createdAt(now)
                            .build();
                })
                .filter(n -> n != null)
                .collect(Collectors.toList());

        notificationRepository.saveAll(notifications);
        log.info("Broadcast notification sent to {} valid users", notifications.size());
    }

    @Override
    @Transactional
    public void cleanupStaleNotifications(LocalDateTime threshold) {
        notificationRepository.deleteByCreatedAtBefore(threshold);
        log.info("Cleaned up stale notifications older than {}", threshold);
    }
}
