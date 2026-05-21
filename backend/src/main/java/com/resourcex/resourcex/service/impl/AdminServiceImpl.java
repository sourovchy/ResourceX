package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.response.DashboardStatsResponse;
import com.resourcex.resourcex.dto.response.PendingUserResponse;
import com.resourcex.resourcex.entity.*;
import com.resourcex.resourcex.exception.BadRequestException;
import com.resourcex.resourcex.exception.ConflictException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.repository.*;
import com.resourcex.resourcex.service.AdminService;
import com.resourcex.resourcex.util.constants.RoleConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final PendingUserRepository pendingUserRepository;
    private final UserRepository userRepository;
    private final UniversityRepository universityRepository;
    private final StudentVerificationRepository studentVerificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final ItemRepository itemRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;

    @Override
    public DashboardStatsResponse getDashboardStats() {
        long activeBookings = bookingRepository.countByStatus(Booking.BookingStatus.ACTIVE);
        long approvedBookings = bookingRepository.countByStatus(Booking.BookingStatus.APPROVED);

        return DashboardStatsResponse.builder()
                .totalUsers(userRepository.count())
                .activeBookings(activeBookings + approvedBookings)
                .revenue(paymentRepository.sumSuccessfulRevenue().doubleValue())
                .pendingApprovals(pendingUserRepository.countByStatus(UserStatus.PENDING_APPROVAL))
                .build();
    }

    @Override
    public List<PendingUserResponse> getPendingUsers() {
        return pendingUserRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void approveUser(Long pendingId) {
        PendingUser pending = pendingUserRepository.findByIdForUpdate(pendingId)
                .orElseThrow(() -> new ResourceNotFoundException("Pending user not found"));

        if (!Boolean.TRUE.equals(pending.getEmailVerified())) {
            throw new BadRequestException("Email must be verified before approval");
        }

        if (pending.getStatus() != UserStatus.PENDING_APPROVAL) {
            throw new ConflictException("Pending user is not awaiting approval");
        }

        assertUserDoesNotExist(pending);

        Role defaultRole = roleRepository.findByName(RoleConstants.ROLE_USER)
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .name(RoleConstants.ROLE_USER)
                                .build()
                ));

        LocalDateTime reviewedAt = LocalDateTime.now();
        String university = pending.getUniversity() != null && !pending.getUniversity().isBlank()
                ? pending.getUniversity().trim()
                : null;

        User user = User.builder()
                .studentId(pending.getStudentId())
                .name(pending.getName())
                .email(pending.getEmail().trim().toLowerCase())
                .password(pending.getPassword())
                .phone(pending.getPhone())
                .university(university)
                .department(pending.getDepartment())
                .trustScore(100)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .phoneVerified(Boolean.TRUE.equals(pending.getPhoneVerified()))
                .build();

        User savedUser = userRepository.save(user);

        userRoleRepository.save(
                UserRole.builder()
                        .user(savedUser)
                        .role(defaultRole)
                        .build()
        );

        StudentVerification verification = StudentVerification.builder()
                .user(savedUser)
                .idCardImage(pending.getIdCardDataUrl())
                .status(StudentVerification.VerificationStatus.VERIFIED)
                .reviewedAt(reviewedAt)
                .build();
        studentVerificationRepository.save(verification);

        AuditLog log = AuditLog.builder()
                .actorType(AuditLog.ActorType.SYSTEM)
                .actionType("USER_APPROVAL")
                .entityType("USER")
                .entityId(savedUser.getUserId())
                .outcome(AuditLog.AuditOutcome.APPROVED)
                .details("Migrated pending user " + pending.getEmail() + " to active user")
                .build();
        auditLogRepository.save(log);

        pendingUserRepository.delete(pending);
    }

    @Override
    @Transactional
    public void rejectUser(Long pendingId, String reason) {
        PendingUser pending = pendingUserRepository.findByIdForUpdate(pendingId)
                .orElseThrow(() -> new ResourceNotFoundException("Pending user not found"));

        if (pending.getStatus() != UserStatus.PENDING_VERIFICATION
                && pending.getStatus() != UserStatus.PENDING_APPROVAL) {
            throw new ConflictException("Pending user cannot be rejected in current status");
        }

        String rejectionReason = reason != null && !reason.isBlank()
                ? reason.trim()
                : "No rejection reason provided";

        AuditLog log = AuditLog.builder()
                .actorType(AuditLog.ActorType.SYSTEM)
                .actionType("USER_REJECTION")
                .entityType("PENDING_USER")
                .entityId(pending.getPendingUserId())
                .outcome(AuditLog.AuditOutcome.REJECTED)
                .details("Rejected pending user " + pending.getEmail() + ". Reason: " + rejectionReason)
                .build();
        auditLogRepository.save(log);

        pendingUserRepository.delete(pending);
    }

    @Override
    @Transactional
    public void blockItem(Long itemId, String reason) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        
        item.setStatus(Item.ItemStatus.BLOCKED);
        itemRepository.save(item);

        AuditLog log = AuditLog.builder()
                .actorType(AuditLog.ActorType.SYSTEM)
                .actionType("ITEM_TAKEDOWN")
                .entityType("ITEM")
                .entityId(itemId)
                .outcome(AuditLog.AuditOutcome.SUCCESS)
                .details("Item " + item.getTitle() + " taken down. Reason: " + reason)
                .build();
        auditLogRepository.save(log);
    }

    private PendingUserResponse mapToResponse(PendingUser pending) {
        return PendingUserResponse.builder()
                .id(pending.getPendingUserId())
                .studentId(pending.getStudentId())
                .name(pending.getName())
                .email(pending.getEmail())
                .phone(pending.getPhone())
                .university(pending.getUniversity())
                .department(pending.getDepartment())
                .idCardDataUrl(pending.getIdCardDataUrl())
                .status(pending.getStatus())
                .emailVerified(Boolean.TRUE.equals(pending.getEmailVerified()))
                .phoneVerified(Boolean.TRUE.equals(pending.getPhoneVerified()))
                .createdAt(pending.getCreatedAt())
                .build();
    }

    private void assertUserDoesNotExist(PendingUser pending) {
        if (userRepository.existsByEmailIgnoreCase(pending.getEmail())) {
            throw new ConflictException("Email already exists in users");
        }

        if (userRepository.existsByStudentId(pending.getStudentId())) {
            throw new ConflictException("Student ID already exists in users");
        }

        if (userRepository.existsByPhone(pending.getPhone())) {
            throw new ConflictException("Phone number already exists in users");
        }
    }
}
