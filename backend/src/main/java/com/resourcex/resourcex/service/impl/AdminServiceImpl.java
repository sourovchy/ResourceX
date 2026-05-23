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
        private final StudentProfileRepository studentProfileRepository;
        private final AuditLogRepository auditLogRepository;
        private final ItemRepository itemRepository;
        private final BookingRepository bookingRepository;
        private final PaymentRepository paymentRepository;
        private final RoleRepository roleRepository;
        private final UserRoleRepository userRoleRepository;

        @Override
        //To get dashboard stat
        public DashboardStatsResponse getDashboardStats() {
                long approvedBookings = bookingRepository.countByStatus(Booking.BookingStatus.APPROVED);

                return DashboardStatsResponse.builder()
                                .totalUsers(userRepository.count())
                                .activeBookings(approvedBookings)
                                .revenue(paymentRepository.sumSuccessfulRevenue().doubleValue())
                                .pendingApprovals(pendingUserRepository.countByStatus(PendingUserStatus.PENDING))
                                .build();
        }

        @Override
        public List<PendingUserResponse> getPendingUsers() {
                return pendingUserRepository.findByStatus(PendingUserStatus.PENDING).stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional
        //to approve user
        public void approveUser(Long pendingId) {
                PendingUser pending = pendingUserRepository.findByIdForUpdate(pendingId)
                                .orElseThrow(() -> new ResourceNotFoundException("Pending user not found"));

                if (pending.getStatus() != PendingUserStatus.PENDING) {
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

                pending.setStatus(PendingUserStatus.APPROVED);
                pending.setReviewedAt(LocalDateTime.now());
                pendingUserRepository.save(pending);

                AuditLog log = AuditLog.builder()
                                .actorType(AuditLog.ActorType.SYSTEM)
                                .actionType("USER_APPROVAL")
                                .entityType("PENDING_USER")
                                .entityId(pending.getPendingUserId())
                                .outcome(AuditLog.AuditOutcome.APPROVED)
                                .details("Approved pending user " + pending.getEmail() + " and created user account")
                                .build();
                auditLogRepository.save(log);
        }

        @Override
        @Transactional
        //reject user
        public void rejectUser(Long pendingId, String reason) {
                PendingUser pending = pendingUserRepository.findByIdForUpdate(pendingId)
                                .orElseThrow(() -> new ResourceNotFoundException("Pending user not found"));

                if (pending.getStatus() != PendingUserStatus.PENDING) {
                        throw new ConflictException("Pending user cannot be rejected in current status");
                }

                String rejectionReason = reason != null && !reason.isBlank()
                                ? reason.trim()
                                : "No rejection reason provided";

                pending.setStatus(PendingUserStatus.REJECTED);
                pending.setRejectionReason(rejectionReason);
                pending.setReviewedAt(LocalDateTime.now());
                pendingUserRepository.save(pending);

                AuditLog log = AuditLog.builder()
                                .actorType(AuditLog.ActorType.SYSTEM)
                                .actionType("USER_REJECTION")
                                .entityType("PENDING_USER")
                                .entityId(pending.getPendingUserId())
                                .outcome(AuditLog.AuditOutcome.REJECTED)
                                .details("Rejected pending user " + pending.getEmail() + ". Reason: " + rejectionReason)
                                .build();
                auditLogRepository.save(log);
        }

        @Override
        @Transactional
        //block inappropriate item
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
