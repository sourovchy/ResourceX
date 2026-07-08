package com.resourcex.resourcex.scheduler;

import com.resourcex.resourcex.service.BookingService;
import com.resourcex.resourcex.service.NotificationService;
import com.resourcex.resourcex.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class AutomationScheduler {

    private final BookingService bookingService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    // Run hourly
    @Scheduled(cron = "0 0 * * * *")
    public void scheduleHourlyTasks() {
        log.info("Running hourly automated tasks...");
        try {
            LocalDateTime pendingBookingThreshold = LocalDateTime.now().minusHours(72);
            bookingService.cancelExpiredPendingBookings(pendingBookingThreshold);
        } catch (Exception e) {
            log.error("Error running hourly automated tasks", e);
        }
    }

    // Run daily at midnight
    @Scheduled(cron = "0 0 0 * * *")
    public void scheduleDailyTasks() {
        log.info("Running daily automated tasks...");
        try {
            // Process overdue bookings (endDate < today and returnedDate is null)
            LocalDate currentDate = LocalDate.now();
            bookingService.processOverdueBookings(currentDate);

            // Cleanup stale notifications older than 15 days
            LocalDateTime staleNotificationThreshold = LocalDateTime.now().minusDays(15);
            notificationService.cleanupStaleNotifications(staleNotificationThreshold);

            // Cleanup audit logs older than 15 days
            LocalDateTime staleAuditLogsThreshold = LocalDateTime.now().minusDays(15);
            auditLogService.cleanupOldLogs(staleAuditLogsThreshold);
        } catch (Exception e) {
            log.error("Error running daily automated tasks", e);
        }
    }
}
