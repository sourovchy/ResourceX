package com.resourcex.resourcex.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.resourcex.resourcex.dto.request.CreateBookingRequest;
import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.Item;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.exception.BadRequestException;
import com.resourcex.resourcex.exception.ConflictException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.repository.BookingRepository;
import com.resourcex.resourcex.repository.ItemRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.impl.BookingServiceImpl;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock BookingRepository bookingRepository;
    @Mock ItemRepository itemRepository;
    @Mock UserRepository userRepository;
    @Mock AuditLogService auditLogService;
    @Mock NotificationService notificationService;
    @Mock com.resourcex.resourcex.service.impl.BookingTrustHandler bookingTrustHandler;
    @Mock com.resourcex.resourcex.service.impl.ItemAvailabilityService itemAvailabilityService;
    @Mock com.resourcex.resourcex.service.impl.BookingMaintenanceService bookingMaintenanceService;
    @Mock com.resourcex.resourcex.security.AccountAccessGuard accountAccessGuard;
    @Mock StudentRestrictionManager restrictionManager;
    @Mock jakarta.persistence.EntityManager entityManager;
    @InjectMocks BookingServiceImpl bookingService;

    private User owner;
    private User renter;
    private Item item;
    private Booking pendingBooking;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setUserId(1L);
        owner.setEmail("owner@campus.edu");

        renter = new User();
        renter.setUserId(2L);
        renter.setEmail("renter@campus.edu");

        item = new Item();
        item.setItemId(10L);
        item.setOwner(owner);
        item.setDailyRate(new BigDecimal("100.00"));
        item.setStatus(Item.ItemStatus.AVAILABLE);

        pendingBooking = Booking.builder()
                .bookingId(100L)
                .item(item)
                .renter(renter)
                .startDate(LocalDate.now().plusDays(1))
                .endDate(LocalDate.now().plusDays(3))
                .totalPrice(new BigDecimal("300.00"))
                .status(Booking.BookingStatus.PENDING)
                .build();
    }

    // ─── createBooking ────────────────────────────────────────────────────────

    @Test
    void createBooking_ownerCannotBookOwnItem() {
        mockSecurityContext(owner.getEmail());
        given(itemRepository.findByIdWithLock(item.getItemId())).willReturn(Optional.of(item));
        given(userRepository.findByEmailIgnoreCase(owner.getEmail())).willReturn(Optional.of(owner));

        CreateBookingRequest req = createRequest(LocalDate.now().plusDays(1), LocalDate.now().plusDays(3));

        assertThatThrownBy(() -> bookingService.createBooking(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("cannot book your own item");
    }

    @Test
    void createBooking_deletedItemIsRejected() {
        mockSecurityContext(renter.getEmail());
        item.setStatus(Item.ItemStatus.DELETED);
        given(itemRepository.findByIdWithLock(item.getItemId())).willReturn(Optional.of(item));
        given(userRepository.findByEmailIgnoreCase(renter.getEmail())).willReturn(Optional.of(renter));

        CreateBookingRequest req = createRequest(LocalDate.now().plusDays(1), LocalDate.now().plusDays(3));

        assertThatThrownBy(() -> bookingService.createBooking(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("no longer available");
    }

    @Test
    void createBooking_overlappingDatesAreRejected() {
        mockSecurityContext(renter.getEmail());
        given(itemRepository.findByIdWithLock(item.getItemId())).willReturn(Optional.of(item));
        given(userRepository.findByEmailIgnoreCase(renter.getEmail())).willReturn(Optional.of(renter));
        given(bookingRepository.findOverlappingBookings(any(), any(), any()))
                .willReturn(List.of(pendingBooking));

        CreateBookingRequest req = createRequest(LocalDate.now().plusDays(1), LocalDate.now().plusDays(3));

        assertThatThrownBy(() -> bookingService.createBooking(req))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already booked");
    }

    @Test
    void createBooking_pastStartDateIsRejected() {
        CreateBookingRequest req = createRequest(LocalDate.now().minusDays(1), LocalDate.now().plusDays(1));

        assertThatThrownBy(() -> bookingService.createBooking(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("cannot be in the past");
    }

    // ─── approveBooking ───────────────────────────────────────────────────────

    @Test
    void approveBooking_rejectsNonPendingBooking() {
        mockSecurityContext(owner.getEmail());
        pendingBooking.setStatus(Booking.BookingStatus.APPROVED);
        given(bookingRepository.findById(100L)).willReturn(Optional.of(pendingBooking));
        given(itemRepository.findByIdWithLock(item.getItemId())).willReturn(Optional.of(item));
        given(userRepository.findByEmailIgnoreCase(owner.getEmail())).willReturn(Optional.of(owner));

        assertThatThrownBy(() -> bookingService.approveBooking(100L))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Only pending bookings can be approved");
    }

    @Test
    void approveBooking_throwsWhenNotFound() {
        given(bookingRepository.findById(999L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.approveBooking(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ─── rejectBooking ────────────────────────────────────────────────────────

    @Test
    void rejectBooking_rejectsNonPendingBooking() {
        mockSecurityContext(owner.getEmail());
        pendingBooking.setStatus(Booking.BookingStatus.CANCELLED);
        given(bookingRepository.findById(100L)).willReturn(Optional.of(pendingBooking));
        given(itemRepository.findByIdWithLock(item.getItemId())).willReturn(Optional.of(item));
        given(userRepository.findByEmailIgnoreCase(owner.getEmail())).willReturn(Optional.of(owner));

        assertThatThrownBy(() -> bookingService.rejectBooking(100L, "test"))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Only pending bookings can be declined");
    }

    // ─── cancelBooking ────────────────────────────────────────────────────────

    @Test
    void cancelBooking_completedBookingCannotBeCancelled() {
        mockSecurityContext(renter.getEmail());
        pendingBooking.setStatus(Booking.BookingStatus.COMPLETED);
        given(bookingRepository.findById(100L)).willReturn(Optional.of(pendingBooking));
        given(itemRepository.findByIdWithLock(item.getItemId())).willReturn(Optional.of(item));
        given(userRepository.findByEmailIgnoreCase(renter.getEmail())).willReturn(Optional.of(renter));

        assertThatThrownBy(() -> bookingService.cancelBooking(100L))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("can no longer be cancelled");
    }

    // ─── helpers ──────────────────────────────────────────────────────────────

    private CreateBookingRequest createRequest(LocalDate start, LocalDate end) {
        CreateBookingRequest req = new CreateBookingRequest();
        req.setItemId(item.getItemId());
        req.setStartDate(start);
        req.setEndDate(end);
        return req;
    }

    private void mockSecurityContext(String email) {
        Authentication auth = mock(Authentication.class);
        given(auth.getName()).willReturn(email);
        SecurityContext ctx = mock(SecurityContext.class);
        given(ctx.getAuthentication()).willReturn(auth);
        SecurityContextHolder.setContext(ctx);
    }
}
