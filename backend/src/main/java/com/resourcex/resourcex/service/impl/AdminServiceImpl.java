package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.SuspendUserRequest;
import com.resourcex.resourcex.dto.response.DashboardStatsResponse;
import com.resourcex.resourcex.dto.response.PendingUserResponse;
import com.resourcex.resourcex.entity.*;
import com.resourcex.resourcex.exception.BadRequestException;
import com.resourcex.resourcex.exception.ConflictException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.repository.*;
import com.resourcex.resourcex.service.AdminService;
import com.resourcex.resourcex.service.AuditLogService;
import com.resourcex.resourcex.util.constants.RoleConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

        private final PendingUserRepository pendingUserRepository;
        private final UserRepository userRepository;
        private final StudentProfileRepository studentProfileRepository;
        private final ItemRepository itemRepository;
        private final BookingRepository bookingRepository;
        private final PaymentRepository paymentRepository;
        private final RoleRepository roleRepository;
        private final UserRoleRepository userRoleRepository;
        private final AuditLogService auditLogService;

        @Override
        //To get dashboard stat
        public DashboardStatsResponse getDashboardStats() {
                long approvedBookings = bookingRepository.countByStatus(Booking.BookingStatus.APPROVED);

                return DashboardStatsResponse.builder()
                                .totalUsers(userRepository.count())
                                .activeBookings(approvedBookings)
                                .revenue(paymentRepository.sumSuccessfulRevenue().doubleValue())
                                .pendingApprovals(pendingUserRepository.countByStatus(PendingUserStatus.PENDING_REVIEW))
                                .build();
        }

        @Override
        @Transactional(readOnly = true)
        public Page<PendingUserResponse> getPendingUsers(Pageable pageable) {

                return pendingUserRepository
                        .findByStatus(PendingUserStatus.PENDING_REVIEW, pageable)
                        .map(this::mapToResponse);
        }

        @Override
        @Transactional(readOnly = true)
        public PendingUserResponse getPendingUserById(Long pendingId) {
                return pendingUserRepository.findById(pendingId)
                        .map(this::mapToResponse)
                        .orElseThrow(() -> new ResourceNotFoundException("Pending user not found"));
        }

        @Override
        @Transactional
        //to approve user
        public void approveUser(Long pendingId) {
                PendingUser pending = pendingUserRepository.findByIdForUpdate(pendingId)
                                .orElseThrow(() -> new ResourceNotFoundException("Pending user not found"));

                if (pending.getStatus() != PendingUserStatus.PENDING_REVIEW) {
                        throw new ConflictException("Pending user is not awaiting approval");
                }

                assertUserDoesNotExist(pending);

                Role defaultRole = roleRepository.findByNameIgnoreCase(RoleConstants.ROLE_USER)
                                .orElseGet(() -> roleRepository.save(
                                                Role.builder()
                                                                .name(RoleConstants.ROLE_USER)
                                                                .build()));

                User user = User.builder()
                                .name(pending.getName())
                                .email(pending.getEmail().trim().toLowerCase())
                                .password(pending.getPasswordHash())
                                .status(UserStatus.ACTIVE)
                                .build();

                User savedUser = userRepository.save(user);

                StudentProfile studentProfile = StudentProfile.builder()
                                .user(savedUser)
                                .studentId(pending.getStudentId())
                                .phone(pending.getPhone())
                                .university(pending.getUniversity())
                                .department(pending.getDepartment())
                                .idCardDataUrl(pending.getIdCardDataUrl())
                                .trustScore(100)
                                .emailVerified(false)
                                .phoneVerified(false)
                                .build();

                studentProfileRepository.save(studentProfile);

                userRoleRepository.save(
                                UserRole.builder()
                                                .user(savedUser)
                                                .role(defaultRole)
                                                .build());

                pendingUserRepository.delete(pending);

                auditLogService.logAction(
                                AuditLog.ActorType.SYSTEM,
                                null,
                                "USER_APPROVAL",
                                "PENDING_USER",
                                pending.getPendingUserId(),
                                AuditLog.AuditOutcome.APPROVED,
                                "Approved pending user " + pending.getEmail() + " and created user account"
                );
        }

        @Override
        @Transactional
        //reject user
        public void rejectUser(Long pendingId, String reason) {
                PendingUser pending = pendingUserRepository.findByIdForUpdate(pendingId)
                                .orElseThrow(() -> new ResourceNotFoundException("Pending user not found"));

                if (pending.getStatus() != PendingUserStatus.PENDING_REVIEW) {
                        throw new ConflictException("Pending user cannot be rejected in current status");
                }

                String rejectionReason = reason != null && !reason.isBlank()
                                ? reason.trim()
                                : "No rejection reason provided";

                pendingUserRepository.delete(pending);

                auditLogService.logAction(
                                AuditLog.ActorType.SYSTEM,
                                null,
                                "USER_REJECTION",
                                "PENDING_USER",
                                pending.getPendingUserId(),
                                AuditLog.AuditOutcome.REJECTED,
                                "Rejected pending user " + pending.getEmail() + ". Reason: " + rejectionReason
                );
        }

        @Override
        @Transactional
        //block inappropriate item
        public void blockItem(Long itemId, String reason) {
                Item item = itemRepository.findById(itemId)
                                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

                item.setStatus(Item.ItemStatus.BLOCKED);
                itemRepository.save(item);

                auditLogService.logAction(
                                AuditLog.ActorType.SYSTEM,
                                null,
                                "ITEM_TAKEDOWN",
                                "ITEM",
                                itemId,
                                AuditLog.AuditOutcome.SUCCESS,
                                "Item " + item.getTitle() + " taken down. Reason: " + reason
                );
        }

        @Override
        @Transactional
        public void blockUser(Long userId, SuspendUserRequest request) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                if (user.getStatus() == UserStatus.SUSPENDED) {
                        throw new ConflictException("User is already suspended");
                }

                Long adminId = resolveCurrentAdminId();
                LocalDateTime now = LocalDateTime.now();

                LocalDateTime suspendedUntil;
                LocalDateTime scheduledDeletion = null;

                switch (request.getSuspensionType()) {
                        case ONE_DAY     -> suspendedUntil = now.plusDays(1);
                        case SEVEN_DAYS  -> suspendedUntil = now.plusDays(7);
                        case THIRTY_DAYS -> suspendedUntil = now.plusDays(30);
                        case PERMANENT   -> {
                                suspendedUntil = null;
                                scheduledDeletion = now.plusDays(15);
                        }
                        default          -> suspendedUntil = now.plusDays(1);
                }

                user.setStatus(UserStatus.SUSPENDED);
                user.setSuspensionType(request.getSuspensionType());
                user.setSuspensionReason(request.getReason().trim());
                user.setSuspendedAt(now);
                user.setSuspendedUntil(suspendedUntil);
                user.setSuspendedByUserId(adminId);
                user.setScheduledDeletionAt(scheduledDeletion);
                userRepository.save(user);

                String detail = String.format(
                        "Suspended user %s — type=%s, until=%s, reason=%s",
                        user.getEmail(),
                        request.getSuspensionType(),
                        suspendedUntil != null ? suspendedUntil.toString() : "PERMANENT",
                        request.getReason()
                );

                auditLogService.logAction(
                                AuditLog.ActorType.USER,
                                adminId,
                                "USER_SUSPENDED",
                                "USER",
                                userId,
                                AuditLog.AuditOutcome.SUCCESS,
                                detail
                );
        }

        @Override
        @Transactional
        public void unblockUser(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                Long adminId = resolveCurrentAdminId();

                user.setStatus(UserStatus.ACTIVE);
                user.setSuspensionType(null);
                user.setSuspensionReason(null);
                user.setSuspendedAt(null);
                user.setSuspendedUntil(null);
                user.setSuspendedByUserId(null);
                user.setScheduledDeletionAt(null);
                userRepository.save(user);

                auditLogService.logAction(
                                AuditLog.ActorType.USER,
                                adminId,
                                "USER_UNSUSPENDED",
                                "USER",
                                userId,
                                AuditLog.AuditOutcome.SUCCESS,
                                "Unsuspended user " + user.getEmail()
                );
        }

        // ── Private helpers ──────────────────────────────────────────────────────

        /** Returns the userId of the currently authenticated admin, or null if not resolvable. */
        private Long resolveCurrentAdminId() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth == null || auth.getName() == null) return null;
                return userRepository.findByEmailIgnoreCase(auth.getName())
                                .map(User::getUserId)
                                .orElse(null);
        }

        private PendingUserResponse mapToResponse(PendingUser pending) {
                return PendingUserResponse.builder()
                                .id(pending.getPendingUserId())
                                .studentId(pending.getStudentId())
                                .name(pending.getName())
                                .email(pending.getEmail())
                                .phone(pending.getPhone())
                                .university(pending.getUniversity() != null ? pending.getUniversity().getName() : null)
                                .department(pending.getDepartment())
                                .idCardDataUrl(pending.getIdCardDataUrl())
                                .status(pending.getStatus())
                                .createdAt(pending.getCreatedAt())
                                .build();
        }

        private void assertUserDoesNotExist(PendingUser pending) {
                if (userRepository.existsByEmailIgnoreCase(pending.getEmail())) {
                        throw new ConflictException("Email already exists in users");
                }

                if (studentProfileRepository.existsByStudentId(pending.getStudentId())) {
                        throw new ConflictException("Student ID already exists in users");
                }

                if (studentProfileRepository.existsByPhone(pending.getPhone())) {
                        throw new ConflictException("Phone number already exists in users");
                }
        }
}
