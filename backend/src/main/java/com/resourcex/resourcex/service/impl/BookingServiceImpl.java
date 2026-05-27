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
import com.resourcex.resourcex.entity.AuditLog;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
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

    @Override
    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {
        validateDates(request.getStartDate(), request.getEndDate());

        Item item = itemRepository.findByIdWithLock(request.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        // Prevent owners from booking their own items
        User renter = resolveCurrentUser();
        if (item.getOwner() != null
                && item.getOwner().getUserId().equals(renter.getUserId())) {
            throw new BadRequestException("You cannot book your own item");
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

        // Overlap check: exclude CANCELLED, REJECTED, COMPLETED bookings
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

        return BookingMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        assertCanViewBooking(booking);
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
        return bookingRepository.findByRenter(resolveCurrentUser()).stream()
                .map(BookingMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getRequestsForMyListings() {
        return bookingRepository.findByItem_Owner(resolveCurrentUser()).stream()
                .map(BookingMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getDepositTracker() {
        return bookingRepository.findByItem_Owner(resolveCurrentUser()).stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.APPROVED)
                .map(BookingMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public BookingResponse approveBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        assertCanManageOwnerSide(booking);

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new ConflictException("Only pending bookings can be approved");
        }

        booking.setStatus(Booking.BookingStatus.APPROVED);
        booking.setApprovedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);
        // Sync availability after any approval (status changed)
        syncItemAvailability(saved.getItem());

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                resolveCurrentUser().getUserId(),
                "BOOKING_APPROVED",
                "BOOKING",
                saved.getBookingId(),
                AuditLog.AuditOutcome.SUCCESS,
                "Booking approved by owner"
        );

        return BookingMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponse rejectBooking(Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        assertCanManageOwnerSide(booking);

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new ConflictException("Only pending bookings can be rejected");
        }

        booking.setStatus(Booking.BookingStatus.REJECTED);
        if (reason != null && !reason.isBlank()) {
            booking.setRejectionReason(reason);
        }

        Booking saved = bookingRepository.save(booking);
        syncItemAvailability(saved.getItem());

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                resolveCurrentUser().getUserId(),
                "BOOKING_REJECTED",
                "BOOKING",
                saved.getBookingId(),
                AuditLog.AuditOutcome.SUCCESS,
                "Booking rejected by owner"
        );

        return BookingMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        assertCanCancelBooking(booking);

        if (booking.getStatus() == Booking.BookingStatus.COMPLETED
                || booking.getStatus() == Booking.BookingStatus.CANCELLED
                || booking.getStatus() == Booking.BookingStatus.REJECTED) {
            throw new ConflictException("This booking can no longer be cancelled");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);

        Booking saved = bookingRepository.save(booking);
        syncItemAvailability(saved.getItem());

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                resolveCurrentUser().getUserId(),
                "BOOKING_CANCELLED",
                "BOOKING",
                saved.getBookingId(),
                AuditLog.AuditOutcome.SUCCESS,
                "Booking cancelled"
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
        syncItemAvailability(saved.getItem());

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                resolveCurrentUser().getUserId(),
                "BOOKING_MODERATED_CANCEL",
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

        assertCanManageOwnerSide(booking);

        if (booking.getStatus() != Booking.BookingStatus.APPROVED) {
            throw new ConflictException("Only approved bookings can be completed");
        }

        booking.setStatus(Booking.BookingStatus.COMPLETED);
        booking.setReturnedDate(LocalDate.now());

        Booking saved = bookingRepository.save(booking);
        syncItemAvailability(saved.getItem());

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                resolveCurrentUser().getUserId(),
                "BOOKING_COMPLETED",
                "BOOKING",
                saved.getBookingId(),
                AuditLog.AuditOutcome.SUCCESS,
                "Booking marked as completed"
        );

        return BookingMapper.toResponse(saved);
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void autoTransitionBookings() {
        LocalDate today = LocalDate.now();
        boolean itemSyncNeeded = false;

        // TODO: replace with a query that fetches only approved bookings
        List<Booking> bookings = bookingRepository.findAll();

        for (Booking booking : bookings) {
            boolean changed = false;

            if (booking.getStatus() == Booking.BookingStatus.APPROVED
                    && today.isAfter(booking.getEndDate())) {
                booking.setStatus(Booking.BookingStatus.COMPLETED);
                booking.setReturnedDate(booking.getEndDate());
                changed = true;
                itemSyncNeeded = true;
            }

            if (changed) {
                bookingRepository.save(booking);
            }
        }

        if (itemSyncNeeded) {
            syncAllItemAvailability();
        }
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

    private void assertCanViewBooking(Booking booking) {
        if (isStaff() || isRenter(booking) || isOwner(booking)) {
            return;
        }
        throw new ForbiddenException("You cannot access this booking");
    }

    private void assertCanManageOwnerSide(Booking booking) {
        if (isStaff() || isOwner(booking)) {
            return;
        }
        throw new ForbiddenException("Only the listing owner can manage this booking");
    }

    private void assertCanCancelBooking(Booking booking) {
        if (isStaff() || isRenter(booking) || isOwner(booking)) {
            return;
        }
        throw new ForbiddenException("You cannot cancel this booking");
    }

    private boolean isRenter(Booking booking) {
        User currentUser = resolveCurrentUser();
        return booking.getRenter() != null
                && booking.getRenter().getUserId().equals(currentUser.getUserId());
    }

    private boolean isOwner(Booking booking) {
        User currentUser = resolveCurrentUser();
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

    private void syncAllItemAvailability() {
        List<Item> items = bookingRepository.findAll().stream()
                .map(Booking::getItem)
                .distinct()
                .toList();

        for (Item item : items) {
            syncItemAvailability(item);
        }
    }

    private void syncItemAvailability(Item item) {
        if (item == null) {
            return;
        }

        LocalDate today = LocalDate.now();

        // TODO: replace with a dedicated existsActiveBookingForItem query to avoid full scan
        boolean hasActiveBooking = bookingRepository.findAll().stream()
                .filter(b -> b.getItem() != null
                        && b.getItem().getItemId().equals(item.getItemId()))
                .anyMatch(b -> b.getStatus() == Booking.BookingStatus.APPROVED
                        && !today.isBefore(b.getStartDate())
                        && !today.isAfter(b.getEndDate()));

        if (item.getStatus() == Item.ItemStatus.BLOCKED) {
            return;
        }

        item.setStatus(hasActiveBooking
                ? Item.ItemStatus.UNAVAILABLE
                : Item.ItemStatus.AVAILABLE);
        itemRepository.save(item);
    }

    @Override
    @Transactional
    public void cancelExpiredPendingBookings(java.time.LocalDateTime threshold) {
        List<Booking> expiredBookings = bookingRepository.findByStatusAndCreatedAtBefore(Booking.BookingStatus.PENDING, threshold);
        for (Booking booking : expiredBookings) {
            booking.setStatus(Booking.BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            // Logging can be added here
        }
    }

    @Override
    @Transactional
    public void processOverdueBookings(java.time.LocalDate currentDate) {
        List<Booking> overdueBookings = bookingRepository.findByStatusAndEndDateBeforeAndReturnedDateIsNull(Booking.BookingStatus.APPROVED, currentDate);
        for (Booking booking : overdueBookings) {
            // Business logic for overdue bookings (e.g., penalty, notifications)
            // Just logging for now
        }
    }
}
