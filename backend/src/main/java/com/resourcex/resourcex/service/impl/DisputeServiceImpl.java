package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.CreateDisputeRequest;
import com.resourcex.resourcex.dto.request.ResolutionRequest;
import com.resourcex.resourcex.dto.response.DisputeResponse;
import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.Dispute;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.Dispute.DisputeStatus;
import com.resourcex.resourcex.exception.ForbiddenException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.exception.custom.DuplicateResourceException;
import com.resourcex.resourcex.mapper.DisputeMapper;
import com.resourcex.resourcex.repository.BookingRepository;
import com.resourcex.resourcex.repository.DisputeRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.AuditLogService;
import com.resourcex.resourcex.service.DisputeService;
import com.resourcex.resourcex.service.NotificationService;
import com.resourcex.resourcex.entity.AuditLog;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
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
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Override
    public DisputeResponse createDispute(CreateDisputeRequest request) {
        User user = resolveCurrentUser();

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!isAdmin() && !booking.getItem().getOwner().getUserId().equals(user.getUserId())) {
            throw new ForbiddenException("Only the item owner can raise a dispute for this booking");
        }

        if (disputeRepository.existsByBookingAndRaisedBy(booking, user)) {
            throw new DuplicateResourceException("You have already raised a dispute for this booking");
        }

        Dispute dispute = Dispute.builder()
                .booking(booking)
                .raisedBy(user)
                .reason(request.getReason())
                .build();

        Dispute saved = disputeRepository.save(dispute);

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                user.getUserId(),
                "DISPUTE_CREATED",
                "DISPUTE",
                saved.getDisputeId(),
                AuditLog.AuditOutcome.SUCCESS,
                "Dispute created for booking " + booking.getBookingId()
        );

        // Notify the other booking party that a dispute was raised against this booking
        Long renterId = booking.getRenter().getUserId();
        Long ownerId = booking.getItem().getOwner().getUserId();
        Long counterpartyId = user.getUserId().equals(renterId) ? ownerId : renterId;
        notificationService.createDisputeNotification(
                counterpartyId,
                saved.getDisputeId(),
                "Dispute Raised",
                user.getName() + " raised a dispute on booking #" + booking.getBookingId() + ".",
                user.getUserId()
        );

        // If you add description to the entity, map it here too.
        return DisputeMapper.toResponse(saved);
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
    public Page<DisputeResponse> getAllDisputes(Pageable pageable) {
        User user = resolveCurrentUser();

        if (isAdmin()) {
            return disputeRepository.findAll(pageable).map(DisputeMapper::toResponse);
        }

        List<DisputeResponse> userDisputes = disputeRepository.findAll()
                .stream()
                .filter(dispute ->
                        isBookingParticipant(dispute.getBooking(), user)
                                || dispute.getRaisedBy().getUserId().equals(user.getUserId()))
                .map(DisputeMapper::toResponse)
                .toList();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), userDisputes.size());
        List<DisputeResponse> pageSlice = start >= userDisputes.size() ? List.of() : userDisputes.subList(start, end);
        return new PageImpl<>(pageSlice, pageable, userDisputes.size());
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

        if (status == DisputeStatus.RESOLVED || status == DisputeStatus.CLOSED) {
            dispute.setResolvedAt(LocalDateTime.now());
        }

        Dispute saved = disputeRepository.save(dispute);

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                resolveCurrentUser().getUserId(),
                "DISPUTE_RESOLVED",
                "DISPUTE",
                saved.getDisputeId(),
                AuditLog.AuditOutcome.SUCCESS,
                "Dispute resolved with status " + status.name()
        );

        // Notify the user who raised the dispute of the outcome
        notificationService.createDisputeNotification(
                saved.getRaisedBy().getUserId(),
                saved.getDisputeId(),
                "Dispute " + status.name(),
                "Your dispute on booking #" + saved.getBooking().getBookingId()
                        + " was updated to " + status.name() + "."
                        + (saved.getResolution() != null && !saved.getResolution().isBlank()
                                ? " Resolution: " + saved.getResolution() : ""),
                resolveCurrentUser().getUserId()
        );

        return DisputeMapper.toResponse(saved);
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

        Dispute saved = disputeRepository.save(dispute);

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                resolveCurrentUser().getUserId(),
                "DISPUTE_CLOSED",
                "DISPUTE",
                saved.getDisputeId(),
                AuditLog.AuditOutcome.SUCCESS,
                "Dispute closed"
        );

        return DisputeMapper.toResponse(saved);
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

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                currentUser.getUserId(),
                "DISPUTE_DELETED",
                "DISPUTE",
                disputeId,
                AuditLog.AuditOutcome.SUCCESS,
                "Dispute deleted"
        );
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

    @Override
    @Transactional
    public void followUpStaleDisputes(java.time.LocalDateTime threshold) {
        List<DisputeStatus> statuses = List.of(DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW);
        List<Dispute> staleDisputes = disputeRepository.findByStatusInAndUpdatedAtBefore(statuses, threshold);

        if (staleDisputes.isEmpty()) return;

        // Collect all admin/moderator/super_admin user IDs once
        List<Long> adminUserIds = userRepository
                .findAllByRoleNamesList(List.of("ROLE_ADMIN", "ROLE_MODERATOR", "ROLE_SUPER_ADMIN"))
                .stream()
                .map(u -> u.getUserId())
                .toList();

        for (Dispute dispute : staleDisputes) {
            Long disputeId = dispute.getDisputeId();
            String statusLabel = dispute.getStatus().name();

            // Notify each admin
            for (Long adminId : adminUserIds) {
                notificationService.createDisputeNotification(
                        adminId,
                        disputeId,
                        "Stale Dispute Requires Attention",
                        "Dispute #" + disputeId + " has been in " + statusLabel +
                                " status since " + dispute.getUpdatedAt().toLocalDate() +
                                " and requires follow-up.",
                        null
                );
            }

            // Audit
            auditLogService.logAction(
                    AuditLog.ActorType.SYSTEM,
                    null,
                    "DISPUTE_STALE_FOLLOWUP",
                    "DISPUTE",
                    disputeId,
                    AuditLog.AuditOutcome.SUCCESS,
                    "Dispute #" + disputeId + " flagged as stale (" + statusLabel +
                            " since " + dispute.getUpdatedAt().toLocalDate() + "). Admins notified."
            );
        }
    }
}
