package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.CreateDisputeRequest;
import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.Dispute;
import com.resourcex.resourcex.entity.Item;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.exception.ForbiddenException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.exception.custom.DuplicateResourceException;
import com.resourcex.resourcex.repository.BookingRepository;
import com.resourcex.resourcex.repository.DisputeRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.impl.DisputeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class DisputeServiceTest {

    @Mock DisputeRepository disputeRepository;
    @Mock BookingRepository bookingRepository;
    @Mock UserRepository userRepository;
    @Mock AuditLogService auditLogService;
    @InjectMocks DisputeServiceImpl disputeService;

    private User renter;
    private User owner;
    private Item item;
    private Booking booking;

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

        booking = Booking.builder()
                .bookingId(50L)
                .item(item)
                .renter(renter)
                .status(Booking.BookingStatus.COMPLETED)
                .build();

        mockSecurityContext(renter.getEmail());
    }

    // ─── createDispute ────────────────────────────────────────────────────────

    @Test
    void createDispute_throwsWhenBookingNotFound() {
        given(bookingRepository.findById(999L)).willReturn(Optional.empty());
        given(userRepository.findByEmailIgnoreCase(renter.getEmail())).willReturn(Optional.of(renter));

        CreateDisputeRequest req = new CreateDisputeRequest();
        req.setBookingId(999L);
        req.setReason("item damaged");

        assertThatThrownBy(() -> disputeService.createDispute(req))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void createDispute_throwsWhenUserIsNotParticipant() {
        User stranger = new User();
        stranger.setUserId(99L);
        stranger.setEmail("stranger@campus.edu");

        mockSecurityContext(stranger.getEmail());
        given(userRepository.findByEmailIgnoreCase(stranger.getEmail())).willReturn(Optional.of(stranger));
        given(bookingRepository.findById(50L)).willReturn(Optional.of(booking));

        CreateDisputeRequest req = new CreateDisputeRequest();
        req.setBookingId(50L);
        req.setReason("testing");

        assertThatThrownBy(() -> disputeService.createDispute(req))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("cannot raise a dispute");
    }

    @Test
    void createDispute_throwsWhenDuplicateForSameBooking() {
        given(userRepository.findByEmailIgnoreCase(renter.getEmail())).willReturn(Optional.of(renter));
        given(bookingRepository.findById(50L)).willReturn(Optional.of(booking));
        given(disputeRepository.existsByBookingAndRaisedBy(booking, renter)).willReturn(true);

        CreateDisputeRequest req = new CreateDisputeRequest();
        req.setBookingId(50L);
        req.setReason("duplicate dispute attempt");

        assertThatThrownBy(() -> disputeService.createDispute(req))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already raised");
    }

    // ─── getDisputeById ───────────────────────────────────────────────────────

    @Test
    void getDisputeById_throwsWhenNotFound() {
        given(disputeRepository.findById(999L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> disputeService.getDisputeById(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getDisputeById_throwsForUnrelatedUser() {
        User stranger = new User();
        stranger.setUserId(99L);
        stranger.setEmail("stranger@campus.edu");

        mockSecurityContext(stranger.getEmail());
        given(userRepository.findByEmailIgnoreCase(stranger.getEmail())).willReturn(Optional.of(stranger));

        Dispute dispute = Dispute.builder()
                .disputeId(1L)
                .booking(booking)
                .raisedBy(renter)
                .status(Dispute.DisputeStatus.OPEN)
                .build();

        given(disputeRepository.findById(1L)).willReturn(Optional.of(dispute));

        assertThatThrownBy(() -> disputeService.getDisputeById(1L))
                .isInstanceOf(ForbiddenException.class);
    }

    // ─── helpers ──────────────────────────────────────────────────────────────

    private void mockSecurityContext(String email) {
        Authentication auth = mock(Authentication.class);
        given(auth.getName()).willReturn(email);
        SecurityContext ctx = mock(SecurityContext.class);
        given(ctx.getAuthentication()).willReturn(auth);
        SecurityContextHolder.setContext(ctx);
    }
}
