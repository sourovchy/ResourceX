package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.CreateDisputeRequest;
import com.resourcex.resourcex.dto.response.DisputeResponse;
import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.Dispute;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.exception.ForbiddenException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.mapper.DisputeMapper;
import com.resourcex.resourcex.repository.BookingRepository;
import com.resourcex.resourcex.repository.DisputeRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.DisputeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DisputeServiceImpl implements DisputeService {

    private final DisputeRepository disputeRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public DisputeResponse createDispute(CreateDisputeRequest request) {
        User user = resolveCurrentUser();
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!isAdmin() && !isBookingParticipant(booking, user)) {
            throw new ForbiddenException("You cannot raise a dispute for this booking");
        }

        Dispute dispute = Dispute.builder()
                .booking(booking)
                .raisedBy(user)
                .reason(request.getReason())
                .build();

        return DisputeMapper.toResponse(disputeRepository.save(dispute));
    }

    @Override
    public List<DisputeResponse> getAllDisputes() {
        User user = resolveCurrentUser();
        return disputeRepository.findAll().stream()
                .filter(dispute -> isAdmin() || isBookingParticipant(dispute.getBooking(), user))
                .map(DisputeMapper::toResponse)
                .toList();
    }

    private User resolveCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ForbiddenException("Authenticated user not found");
        }
        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private boolean isBookingParticipant(Booking booking, User user) {
        return booking.getRenter().getUserId().equals(user.getUserId())
                || booking.getItem().getOwner().getUserId().equals(user.getUserId());
    }

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null
                && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }
}
