package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.CreateBookingRequest;
import com.resourcex.resourcex.dto.response.BookingResponse;
import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.Item;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.exception.BadRequestException;
import com.resourcex.resourcex.exception.ConflictException;
import com.resourcex.resourcex.exception.ForbiddenException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.mapper.BookingMapper;
import com.resourcex.resourcex.repository.BookingRepository;
import com.resourcex.resourcex.repository.ItemRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.AuditLogService;
import com.resourcex.resourcex.service.BookingService;
import com.resourcex.resourcex.service.NotificationService;
import com.resourcex.resourcex.entity.AuditLog;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final BookingTrustHandler bookingTrustHandler;
    private final ItemAvailabilityService itemAvailabilityService;
    private final BookingMaintenanceService bookingMaintenanceService;
    private final com.resourcex.resourcex.security.AccountAccessGuard accountAccessGuard;
    private final com.resourcex.resourcex.service.StudentRestrictionManager restrictionManager;
    private final com.resourcex.resourcex.service.AvatarUrlResolver avatarUrlResolver;

    @Override
    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {
        validateDates(request.getStartDate(), request.getEndDate());

        Item item = itemRepository.findByIdWithLock(request.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        // Prevent owners from booking their own items
        User renter = resolveCurrentUser();

        // Only approved (ACTIVE) accounts may book items.
        accountAccessGuard.requireActive(renter);

        if (item.getOwner() != null
                && item.getOwner().getUserId().equals(renter.getUserId())) {
            throw new BadRequestException("You cannot book your own item");
        }

        // Trust restriction (<50): restricted users cannot create new bookings.
        if (restrictionManager.isAutomaticallyRestricted(renter.getUserId())) {
            throw new ForbiddenException(
                    "Your account is restricted due to a low Trust Score and cannot create new bookings.");
        }

        // Block deleted/unavailable items
        if (item.getStatus() == Item.ItemStatus.DELETED) {
            throw new BadRequestException("This item is no longer available");
        }
        if (item.getStatus() == Item.ItemStatus.BLOCKED) {
            throw new ConflictException("This item is blocked and cannot be booked");
        }
        if (item.getStatus() == Item.ItemStatus.UNAVAILABLE) {
            throw new ConflictException("This item is currently unavailable");
        }

        // Overlap check: exclude CANCELLED bookings (see findOverlappingBookings)
        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                item,
                request.getStartDate(),
                request.getEndDate()
        );

        if (!overlappingBookings.isEmpty()) {
            throw new ConflictException("This item is already booked for the selected dates");
        }

        long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        if (days <= 0) {
            throw new BadRequestException("End date must be on or after start date");
        }

        BigDecimal totalPrice = item.getDailyRate().multiply(BigDecimal.valueOf(days));

        Booking booking = Booking.builder()
                .item(item)
                .renter(renter)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalPrice(totalPrice)
                .status(Booking.BookingStatus.PENDING)
                .bookingMessage(request.getBookingMessage())
                .build();

        Booking saved = bookingRepository.save(booking);

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                renter.getUserId(),
                "BOOKING_CREATED",
                "BOOKING",
                saved.getBookingId(),
                AuditLog.AuditOutcome.SUCCESS,
                "Booking created for item " + item.getItemId()
        );

        // Notify the item owner of the new request
        notificationService.createBookingNotification(
                item.getOwner().getUserId(),
                saved.getBookingId(),
                renter.getName() + " requested to rent \"" + item.getTitle() + "\".",
                renter.getUserId()
        );

        return BookingMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        assertCanViewBooking(booking, resolveCurrentUser());
        return BookingMapper.toResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponse> getAllBookings(Pageable pageable) {
        if (isStaff()) {
            return bookingRepository.findAll(pageable)
                    .map(BookingMapper::toResponse);
        }
        // Fallback (though mostly unreachable due to controller security)
        // Note: findByRenter is not paginated in repo yet, so returning null/empty or adding method is needed.
        // But since this is admin-only, we just return empty page if somehow accessed.
        return org.springframework.data.domain.Page.empty();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(2);
        return bookingRepository.findByRenter(resolveCurrentUser()).stream()
                .filter(b -> b.getStatus() != Booking.BookingStatus.CANCELLED)
                .filter(b -> b.getStatus() != Booking.BookingStatus.REJECTED
                        || (b.getUpdatedAt() != null ? b.getUpdatedAt() : b.getCreatedAt()).isAfter(threshold))
                .map(b -> resolveAvatars(BookingMapper.toResponse(b)))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getRequestsForMyListings() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(2);
        return bookingRepository.findByItem_Owner(resolveCurrentUser()).stream()
                .filter(b -> b.getStatus() != Booking.BookingStatus.CANCELLED)
                .filter(b -> b.getStatus() != Booking.BookingStatus.REJECTED
                        || (b.getUpdatedAt() != null ? b.getUpdatedAt() : b.getCreatedAt()).isAfter(threshold))
                .map(b -> resolveAvatars(BookingMapper.toResponse(b)))
                .toList();
    }

    /** Resolves avatarUrl on the renter (and owner via item) using AvatarUrlResolver. */
    private BookingResponse resolveAvatars(BookingResponse r) {
        if (r == null) return null;
        if (r.getRenter() != null && r.getRenter().getAvatarFileId() != null) {
            r.getRenter().setAvatarUrl(avatarUrlResolver.resolve(r.getRenter().getAvatarFileId()));
        }
        return r;
    }

    @Override
    @Transactional
    public BookingResponse approveBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        User currentUser = resolveCurrentUser();
        assertCanManageOwnerSide(booking, currentUser);

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new ConflictException("Only pending bookings can be approved");
        }

        booking.setStatus(Booking.BookingStatus.APPROVED);

        Booking saved = bookingRepository.save(booking);
        // Sync availability after any approval (status changed)
        itemAvailabilityService.sync(saved.getItem());

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                currentUser.getUserId(),
                "BOOKING_APPROVED",
                "BOOKING",
                saved.getBookingId(),
                AuditLog.AuditOutcome.SUCCESS,
                "Booking approved by owner"
        );

        // Notify the renter that their request was approved
        notificationService.createBookingNotification(
                saved.getRenter().getUserId(),
                saved.getBookingId(),
                "Your booking for \"" + saved.getItem().getTitle() + "\" was approved. Coordinate pickup with the owner.",
                saved.getItem().getOwner().getUserId()
        );

        // Auto-reject all other PENDING bookings for this item whose dates overlap
        final String overlapReason =
                "Another booking was approved for dates that overlap with your requested rental period.";

        List<Booking> overlappingPending = bookingRepository
                .findOverlappingBookings(saved.getItem(), saved.getStartDate(), saved.getEndDate())
                .stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.PENDING)
                .filter(b -> !b.getBookingId().equals(saved.getBookingId()))
                .toList();

        for (Booking conflict : overlappingPending) {
            conflict.setStatus(Booking.BookingStatus.REJECTED);
            conflict.setRejectionReason(overlapReason);
            Booking rejectedSaved = bookingRepository.save(conflict);

            notificationService.createBookingNotification(
                    rejectedSaved.getRenter().getUserId(),
                    rejectedSaved.getBookingId(),
                    "Your booking request for \"" + rejectedSaved.getItem().getTitle()
                            + "\" was declined. " + overlapReason,
                    saved.getItem().getOwner().getUserId()
            );

            auditLogService.logAction(
                    AuditLog.ActorType.SYSTEM,
                    null,
                    "BOOKING_AUTO_REJECTED",
                    "BOOKING",
                    rejectedSaved.getBookingId(),
                    AuditLog.AuditOutcome.SUCCESS,
                    "Auto-rejected due to overlap with approved booking #" + saved.getBookingId()
            );
        }

        return BookingMapper.toResponse(saved);

    }

    @Override
    @Transactional
    public BookingResponse activateBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        User currentUser = resolveCurrentUser();
        assertCanManageOwnerSide(booking, currentUser);

        if (booking.getStatus() != Booking.BookingStatus.APPROVED) {
            throw new ConflictException("Only approved bookings can be marked as handed over");
        }

        booking.setStatus(Booking.BookingStatus.ACTIVE);

        Booking saved = bookingRepository.save(booking);
        itemAvailabilityService.sync(saved.getItem());

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                currentUser.getUserId(),
                "BOOKING_ACTIVATED",
                "BOOKING",
                saved.getBookingId(),
                AuditLog.AuditOutcome.SUCCESS,
                "Item handed over; rental active"
        );

        notificationService.createBookingNotification(
                saved.getRenter().getUserId(),
                saved.getBookingId(),
                "Your rental of \"" + saved.getItem().getTitle() + "\" is now active. Please return it by "
                        + saved.getEndDate() + ".",
                saved.getItem().getOwner().getUserId()
        );

        return BookingMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponse rejectBooking(Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        User currentUser = resolveCurrentUser();
        assertCanManageOwnerSide(booking, currentUser);

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new ConflictException("Only pending bookings can be declined");
        }

        booking.setStatus(Booking.BookingStatus.REJECTED);
        if (reason != null && !reason.isBlank()) {
            booking.setRejectionReason(reason);
        }

        Booking saved = bookingRepository.save(booking);
        itemAvailabilityService.sync(saved.getItem());

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                currentUser.getUserId(),
                "BOOKING_REJECTED",
                "BOOKING",
                saved.getBookingId(),
                AuditLog.AuditOutcome.SUCCESS,
                "Booking rejected by owner"
        );

        // Notify the renter that their request was rejected
        notificationService.createBookingNotification(
                saved.getRenter().getUserId(),
                saved.getBookingId(),
                "Your booking for \"" + saved.getItem().getTitle() + "\" was rejected."
                        + (reason != null && !reason.isBlank() ? " Reason: " + reason : ""),
                saved.getItem().getOwner().getUserId()
        );

        return BookingMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        User canceller = resolveCurrentUser();
        assertCanCancelBooking(booking, canceller);

        if (booking.getStatus() == Booking.BookingStatus.COMPLETED
                || booking.getStatus() == Booking.BookingStatus.CANCELLED
                || booking.getStatus() == Booking.BookingStatus.REJECTED) {
            throw new ConflictException("This booking can no longer be cancelled");
        }

        boolean wasApproved = booking.getStatus() == Booking.BookingStatus.APPROVED
                || booking.getStatus() == Booking.BookingStatus.ACTIVE;

        booking.setStatus(Booking.BookingStatus.CANCELLED);

        Booking saved = bookingRepository.save(booking);
        itemAvailabilityService.sync(saved.getItem());

        // Trust: cancelling an already-approved booking penalises the canceller (-5).
        if (wasApproved) {
            bookingTrustHandler.penalizeCancellationAfterApproval(canceller);
        }

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                canceller.getUserId(),
                "BOOKING_CANCELLED",
                "BOOKING",
                saved.getBookingId(),
                AuditLog.AuditOutcome.SUCCESS,
                "Booking cancelled"
        );

        // Notify the counterparty (whoever did not cancel)
        Long ownerId = saved.getItem().getOwner().getUserId();
        Long renterId = saved.getRenter().getUserId();
        Long recipientId = canceller.getUserId().equals(renterId) ? ownerId : renterId;
        notificationService.createBookingNotification(
                recipientId,
                saved.getBookingId(),
                "The booking for \"" + saved.getItem().getTitle() + "\" was cancelled.",
                canceller.getUserId()
        );

        return BookingMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponse moderateCancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!isStaff()) {
            throw new ForbiddenException("Only staff members can moderate bookings");
        }

        if (booking.getStatus() == Booking.BookingStatus.COMPLETED
                || booking.getStatus() == Booking.BookingStatus.CANCELLED
                || booking.getStatus() == Booking.BookingStatus.REJECTED) {
            throw new ConflictException("This booking can no longer be moderated");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);

        Booking saved = bookingRepository.save(booking);
        itemAvailabilityService.sync(saved.getItem());

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                resolveCurrentUser().getUserId(),
                "BOOKING_CANCELLED_BY_ADMIN",
                "BOOKING",
                saved.getBookingId(),
                AuditLog.AuditOutcome.SUCCESS,
                "Booking cancelled by moderator/admin"
        );

        return BookingMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponse completeBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        User currentUser = resolveCurrentUser();
        assertCanManageOwnerSide(booking, currentUser);

        if (booking.getStatus() != Booking.BookingStatus.ACTIVE) {
            throw new ConflictException("Only active (handed-over) bookings can be marked as returned");
        }

        booking.setStatus(Booking.BookingStatus.COMPLETED);
        booking.setReturnedDate(LocalDate.now());

        Booking saved = bookingRepository.save(booking);
        itemAvailabilityService.sync(saved.getItem());

        bookingTrustHandler.awardCompletionTrust(saved);

        boolean forceCompleted = isStaff() && !isOwner(booking, currentUser);
        String actionType = forceCompleted ? "BOOKING_FORCE_COMPLETED" : "BOOKING_COMPLETED";

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                currentUser.getUserId(),
                actionType,
                "BOOKING",
                saved.getBookingId(),
                AuditLog.AuditOutcome.SUCCESS,
                forceCompleted ? "Booking force completed by admin" : "Booking marked as completed"
        );

        // Notify the renter that the rental is complete and a review can be left
        notificationService.createBookingNotification(
                saved.getRenter().getUserId(),
                saved.getBookingId(),
                "Your rental of \"" + saved.getItem().getTitle() + "\" is complete. You can now leave a review.",
                saved.getItem().getOwner().getUserId()
        );

        return BookingMapper.toResponse(saved);
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new BadRequestException("Start date and end date are required");
        }
        if (startDate.isBefore(LocalDate.now())) {
            throw new BadRequestException("Start date cannot be in the past");
        }
        if (endDate.isBefore(startDate)) {
            throw new BadRequestException("End date cannot be before start date");
        }
        // Optional: add max/min rental duration rules here
    }

    private User resolveCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null
                || authentication.getName().isBlank()) {
            throw new BadRequestException("Authenticated user not found");
        }

        String email = authentication.getName();

        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void assertCanViewBooking(Booking booking, User currentUser) {
        if (isStaff() || isRenter(booking, currentUser) || isOwner(booking, currentUser)) {
            return;
        }
        throw new ForbiddenException("You cannot access this booking");
    }

    private void assertCanManageOwnerSide(Booking booking, User currentUser) {
        if (isStaff() || isOwner(booking, currentUser)) {
            return;
        }
        throw new ForbiddenException("Only the listing owner can manage this booking");
    }

    private void assertCanCancelBooking(Booking booking, User currentUser) {
        if (isStaff() || isRenter(booking, currentUser) || isOwner(booking, currentUser)) {
            return;
        }
        throw new ForbiddenException("You cannot cancel this booking");
    }

    private boolean isRenter(Booking booking, User currentUser) {
        return booking.getRenter() != null
                && booking.getRenter().getUserId().equals(currentUser.getUserId());
    }

    private boolean isOwner(Booking booking, User currentUser) {
        return booking.getItem() != null
                && booking.getItem().getOwner() != null
                && booking.getItem().getOwner().getUserId().equals(currentUser.getUserId());
    }

    private boolean isStaff() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .anyMatch(role -> role.equals("ROLE_ADMIN")
                        || role.equals("ROLE_MODERATOR")
                        || role.equals("ROLE_SUPER_ADMIN"));
    }

    // Scheduler-invoked maintenance — delegated to BookingMaintenanceService so this
    // service keeps only the interactive lifecycle. Interface contract is unchanged.
    @Override
    public void cancelExpiredPendingBookings(java.time.LocalDateTime threshold) {
        bookingMaintenanceService.cancelExpiredPendingBookings(threshold);
    }

    @Override
    public void processOverdueBookings(java.time.LocalDate currentDate) {
        bookingMaintenanceService.processOverdueBookings(currentDate);
    }
}
