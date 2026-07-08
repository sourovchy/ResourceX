package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.entity.AuditLog;
import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.Item;
import com.resourcex.resourcex.repository.BookingRepository;
import com.resourcex.resourcex.service.AuditLogService;
import com.resourcex.resourcex.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Scheduled / batch booking maintenance, extracted from {@code BookingServiceImpl}
 * so the service body holds only the interactive (request-driven) lifecycle.
 * The interface methods {@code cancelExpiredPendingBookings} and
 * {@code processOverdueBookings} stay on {@code BookingServiceImpl} as thin
 * delegators to these (the interface is unchanged); {@code autoTransitionBookings}
 * is scheduler-only and lives here outright.
 */
@Component
@RequiredArgsConstructor
public class BookingMaintenanceService {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final BookingTrustHandler bookingTrustHandler;
    private final ItemAvailabilityService itemAvailabilityService;

    /** Nightly: auto-complete ACTIVE bookings whose due date has passed without a return. */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void autoTransitionBookings() {
        LocalDate today = LocalDate.now();

        List<Booking> overdue = bookingRepository
                .findByStatusAndEndDateBeforeAndReturnedDateIsNull(Booking.BookingStatus.ACTIVE, today);

        Set<Long> syncedItemIds = new HashSet<>();
        for (Booking booking : overdue) {
            booking.setStatus(Booking.BookingStatus.COMPLETED);
            booking.setReturnedDate(booking.getEndDate());
            Booking saved = bookingRepository.save(booking);
            bookingTrustHandler.awardCompletionTrust(saved);

            Item item = saved.getItem();
            if (item != null && syncedItemIds.add(item.getItemId())) {
                itemAvailabilityService.sync(item);
            }
        }
    }

    /** Expire PENDING bookings that were never acted on before {@code threshold}. */
    @Transactional
    public void cancelExpiredPendingBookings(LocalDateTime threshold) {
        List<Booking> expiredBookings =
                bookingRepository.findByStatusAndCreatedAtBefore(Booking.BookingStatus.PENDING, threshold);
        for (Booking booking : expiredBookings) {
            booking.setStatus(Booking.BookingStatus.REJECTED);
            booking.setRejectionReason("Your booking request was automatically declined — the owner did not respond within 3 days.");
            Booking saved = bookingRepository.save(booking);

            // Notify the renter so they know why the request disappeared
            notificationService.createBookingNotification(
                    saved.getRenter().getUserId(),
                    saved.getBookingId(),
                    "Your booking request for \"" + saved.getItem().getTitle() + "\" was automatically declined because the owner did not respond within 3 days.",
                    null
            );
        }
    }


    /** Notify both parties (and audit) for ACTIVE bookings past their due date. */
    @Transactional
    public void processOverdueBookings(LocalDate currentDate) {
        List<Booking> overdueBookings = bookingRepository
                .findByStatusAndEndDateBeforeAndReturnedDateIsNull(Booking.BookingStatus.ACTIVE, currentDate);

        for (Booking booking : overdueBookings) {
            Long bookingId = booking.getBookingId();
            Long renterId = booking.getRenter().getUserId();
            Long ownerId = booking.getItem().getOwner().getUserId();
            String itemTitle = booking.getItem().getTitle();
            long daysOverdue = ChronoUnit.DAYS.between(booking.getEndDate(), currentDate);

            notificationService.createBookingNotification(
                    renterId,
                    bookingId,
                    "Your rental of \"" + itemTitle + "\" is " + daysOverdue + " day(s) overdue. Please return it immediately.",
                    null
            );

            notificationService.createBookingNotification(
                    ownerId,
                    bookingId,
                    "\"" + itemTitle + "\" has not been returned yet. It is " + daysOverdue + " day(s) overdue.",
                    null
            );

            auditLogService.logAction(
                    AuditLog.ActorType.SYSTEM,
                    null,
                    "BOOKING_OVERDUE",
                    "BOOKING",
                    bookingId,
                    AuditLog.AuditOutcome.SUCCESS,
                    "Booking #" + bookingId + " is " + daysOverdue + " day(s) overdue. Renter and owner notified."
            );
        }
    }
}
