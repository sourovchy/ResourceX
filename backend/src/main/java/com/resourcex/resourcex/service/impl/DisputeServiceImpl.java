package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.CreateDisputeRequest;
import com.resourcex.resourcex.dto.request.ResolutionRequest;
import com.resourcex.resourcex.dto.response.DisputeResponse;
import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.Dispute;
import com.resourcex.resourcex.entity.Staff;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.Dispute.DisputeStatus;
import com.resourcex.resourcex.exception.ForbiddenException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.exception.custom.DuplicateResourceException;
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

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DisputeServiceImpl implements DisputeService {

    private final DisputeRepository disputeRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Override
    public DisputeResponse createDispute(CreateDisputeRequest request) {
        User user = resolveCurrentUser();

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!isAdmin() && !isBookingParticipant(booking, user)) {
            throw new ForbiddenException("You cannot raise a dispute for this booking");
        }

        if (disputeRepository.existsByBookingAndRaisedBy(booking, user)) {
            throw new DuplicateResourceException("You have already raised a dispute for this booking");
        }

        Dispute dispute = Dispute.builder()
                .booking(booking)
                .raisedBy(user)
                .reason(request.getReason())
                .build();

        // If you add description to the entity, map it here too.
        return DisputeMapper.toResponse(disputeRepository.save(dispute));
    }

    @Override
    @Transactional(readOnly = true)
    public DisputeResponse getDisputeById(Long disputeId) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found"));

        User user = resolveCurrentUser();
        if (!isAdmin() && !isBookingParticipant(dispute.getBooking(), user) && !dispute.getRaisedBy().getUserId().equals(user.getUserId())) {
            throw new ForbiddenException("You do not have permission to view this dispute");
        }

        return DisputeMapper.toResponse(dispute);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DisputeResponse> getAllDisputes() {
        User user = resolveCurrentUser();

        if (isAdmin()) {
            return disputeRepository.findAll()
                    .stream()
                    .map(DisputeMapper::toResponse)
                    .toList();
        }

        return disputeRepository.findAll()
                .stream()
                .filter(dispute ->
                        isBookingParticipant(dispute.getBooking(), user)
                                || dispute.getRaisedBy().getUserId().equals(user.getUserId()))
                .map(DisputeMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DisputeResponse> getDisputesByUser(Long userId) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User currentUser = resolveCurrentUser();
        if (!isAdmin() && !currentUser.getUserId().equals(targetUser.getUserId())) {
            throw new ForbiddenException("You do not have permission to view these disputes");
        }

        return disputeRepository.findByRaisedBy(targetUser)
                .stream()
                .map(DisputeMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DisputeResponse> getDisputesByStatus(DisputeStatus status) {
        if (!isAdmin()) {
            throw new ForbiddenException("Only admins can view disputes by status");
        }

        return disputeRepository.findByStatus(status)
                .stream()
                .map(DisputeMapper::toResponse)
                .toList();
    }

    @Override
    public DisputeResponse resolveDispute(Long disputeId, ResolutionRequest request) {
        if (!isAdmin()) {
            throw new ForbiddenException("Only admins can resolve disputes");
        }

        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found"));

        DisputeStatus status = parseStatus(request.getStatus());

        dispute.setStatus(status);
        dispute.setResolution(request.getResolution());

        if (status == DisputeStatus.RESOLVED || status == DisputeStatus.REJECTED || status == DisputeStatus.CLOSED) {
            dispute.setResolvedAt(LocalDateTime.now());
        }

        return DisputeMapper.toResponse(disputeRepository.save(dispute));
    }

    @Override
    public DisputeResponse closeDispute(Long disputeId) {
        if (!isAdmin()) {
            throw new ForbiddenException("Only admins can close disputes");
        }

        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found"));

        dispute.setStatus(DisputeStatus.CLOSED);
        dispute.setResolvedAt(LocalDateTime.now());

        return DisputeMapper.toResponse(disputeRepository.save(dispute));
    }

    @Override
    public void deleteDispute(Long disputeId) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found"));

        User currentUser = resolveCurrentUser();
        boolean owner = dispute.getRaisedBy().getUserId().equals(currentUser.getUserId());

        if (!isAdmin() && !owner) {
            throw new ForbiddenException("You do not have permission to delete this dispute");
        }

        disputeRepository.delete(dispute);
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

    private DisputeStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Dispute status cannot be blank");
        }

        try {
            return DisputeStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid dispute status: " + status);
        }
    }
}