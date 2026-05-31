package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.PenaltyRequest;
import com.resourcex.resourcex.dto.response.PenaltyResponse;
import com.resourcex.resourcex.entity.*;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.mapper.PenaltyMapper;
import com.resourcex.resourcex.repository.*;
import com.resourcex.resourcex.service.AuditLogService;
import com.resourcex.resourcex.service.NotificationService;
import com.resourcex.resourcex.service.PenaltyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PenaltyServiceImpl implements PenaltyService {

    private final PenaltyRepository penaltyRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final DisputeRepository disputeRepository;
    private final PenaltyMapper penaltyMapper;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Override
    public PenaltyResponse createPenalty(PenaltyRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Booking booking = null;
        if (request.getBookingId() != null) {
            booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        }

        Dispute dispute = null;
        if (request.getDisputeId() != null) {
            dispute = disputeRepository.findById(request.getDisputeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Dispute not found"));
        }

        User issuedBy = userRepository.findById(request.getIssuedByUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Admin/User not found"));

        Penalty penalty = Penalty.builder()
                .user(user)
                .booking(booking)
                .dispute(dispute)
                .amount(request.getAmount())
                .reason(request.getReason())
                .issuedBy(issuedBy)
                .status(Penalty.PenaltyStatus.PENDING)
                .build();

        Penalty saved = penaltyRepository.save(penalty);

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                issuedBy.getUserId(),
                "PENALTY_CREATED",
                "PENALTY",
                saved.getPenaltyId(),
                AuditLog.AuditOutcome.SUCCESS,
                "Penalty created for user " + user.getUserId()
        );

        notificationService.createPenaltyNotification(
                user.getUserId(),
                saved.getPenaltyId(),
                "New Penalty Issued",
                "A penalty of " + request.getAmount() + " has been issued. Reason: " + request.getReason(),
                issuedBy.getUserId()
        );

        return penaltyMapper.toResponse(saved);
    }

    @Override
    public PenaltyResponse updatePenalty(Long penaltyId, PenaltyRequest request) {

        Penalty penalty = penaltyRepository.findById(penaltyId)
                .orElseThrow(() -> new ResourceNotFoundException("Penalty not found"));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        penalty.setUser(user);
        penalty.setAmount(request.getAmount());
        penalty.setReason(request.getReason());

        if (request.getBookingId() != null) {

            Booking booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

            penalty.setBooking(booking);
        } else {
            penalty.setBooking(null);
        }

        if (request.getDisputeId() != null) {

            Dispute dispute = disputeRepository.findById(request.getDisputeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Dispute not found"));

            penalty.setDispute(dispute);
        } else {
            penalty.setDispute(null);
        }

        Penalty saved = penaltyRepository.save(penalty);

        auditLogService.logAction(
                AuditLog.ActorType.SYSTEM,
                null,
                "PENALTY_UPDATED",
                "PENALTY",
                saved.getPenaltyId(),
                AuditLog.AuditOutcome.SUCCESS,
                "Penalty updated"
        );

        return penaltyMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PenaltyResponse getPenaltyById(Long penaltyId) {

        Penalty penalty = penaltyRepository.findById(penaltyId)
                .orElseThrow(() -> new ResourceNotFoundException("Penalty not found"));

        return penaltyMapper.toResponse(penalty);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PenaltyResponse> getAllPenalties(Pageable pageable) {
        return penaltyRepository.findAll(pageable).map(penaltyMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PenaltyResponse> getPenaltiesByUserId(Long userId) {

        return penaltyRepository.findByUser_UserId(userId)
                .stream()
                .map(penaltyMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PenaltyResponse> getPenaltiesByBookingId(Long bookingId) {

        return penaltyRepository.findByBooking_BookingId(bookingId)
                .stream()
                .map(penaltyMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PenaltyResponse> getPenaltiesByDisputeId(Long disputeId) {

        return penaltyRepository.findByDispute_DisputeId(disputeId)
                .stream()
                .map(penaltyMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PenaltyResponse> getPenaltiesByStatus(Penalty.PenaltyStatus status) {

        return penaltyRepository.findByStatus(status)
                .stream()
                .map(penaltyMapper::toResponse)
                .toList();
    }

    @Override
    public PenaltyResponse applyPenalty(Long penaltyId) {

        Penalty penalty = penaltyRepository.findById(penaltyId)
                .orElseThrow(() -> new ResourceNotFoundException("Penalty not found"));

        penalty.setStatus(Penalty.PenaltyStatus.APPLIED);
        penalty.setAppliedAt(LocalDateTime.now());

        Penalty saved = penaltyRepository.save(penalty);

        auditLogService.logAction(
                AuditLog.ActorType.SYSTEM,
                null,
                "PENALTY_APPLIED",
                "PENALTY",
                saved.getPenaltyId(),
                AuditLog.AuditOutcome.SUCCESS,
                "Penalty applied"
        );

        notificationService.createPenaltyNotification(
                penalty.getUser().getUserId(),
                saved.getPenaltyId(),
                "Penalty Applied",
                "A penalty has been formally applied to your account.",
                null
        );

        return penaltyMapper.toResponse(saved);
    }

    @Override
    public PenaltyResponse waivePenalty(Long penaltyId) {

        Penalty penalty = penaltyRepository.findById(penaltyId)
                .orElseThrow(() -> new ResourceNotFoundException("Penalty not found"));

        penalty.setStatus(Penalty.PenaltyStatus.WAIVED);

        Penalty saved = penaltyRepository.save(penalty);

        auditLogService.logAction(
                AuditLog.ActorType.SYSTEM,
                null,
                "PENALTY_WAIVED",
                "PENALTY",
                saved.getPenaltyId(),
                AuditLog.AuditOutcome.SUCCESS,
                "Penalty waived"
        );

        notificationService.createPenaltyNotification(
                penalty.getUser().getUserId(),
                saved.getPenaltyId(),
                "Penalty Waived",
                "A penalty on your account has been waived.",
                null
        );

        return penaltyMapper.toResponse(saved);
    }

    @Override
    public void deletePenalty(Long penaltyId) {

        Penalty penalty = penaltyRepository.findById(penaltyId)
                .orElseThrow(() -> new ResourceNotFoundException("Penalty not found"));

        penaltyRepository.delete(penalty);

        auditLogService.logAction(
                AuditLog.ActorType.SYSTEM,
                null,
                "PENALTY_DELETED",
                "PENALTY",
                penaltyId,
                AuditLog.AuditOutcome.SUCCESS,
                "Penalty deleted"
        );
    }
}