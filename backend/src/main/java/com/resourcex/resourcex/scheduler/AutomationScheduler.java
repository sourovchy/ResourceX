package com.resourcex.resourcex.scheduler;

import com.resourcex.resourcex.service.BookingService;
import com.resourcex.resourcex.service.DisputeService;
import com.resourcex.resourcex.service.NotificationService;
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
    private final DisputeService disputeService;
    private final NotificationService notificationService;

    // Run hourly
    @Scheduled(cron = "0 0 * * * *")
    public void scheduleHourlyTasks() {
        log.info("Running hourly automated tasks...");
        try {
            LocalDateTime pendingBookingThreshold = LocalDateTime.now().minusHours(24);
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

            // Follow up on stale disputes untouched for 7 days
            LocalDateTime staleDisputeThreshold = LocalDateTime.now().minusDays(7);
            disputeService.followUpStaleDisputes(staleDisputeThreshold);

            // Cleanup stale notifications older than 30 days
            LocalDateTime staleNotificationThreshold = LocalDateTime.now().minusDays(30);
            notificationService.cleanupStaleNotifications(staleNotificationThreshold);
        } catch (Exception e) {
            log.error("Error running daily automated tasks", e);
        }
    }
}
