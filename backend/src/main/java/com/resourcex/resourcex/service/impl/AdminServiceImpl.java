package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.SuspendUserRequest;
import com.resourcex.resourcex.dto.response.DashboardStatsResponse;

import com.resourcex.resourcex.dto.response.PlatformActivityResponse;
import com.resourcex.resourcex.dto.response.UserResponse;
import com.resourcex.resourcex.entity.*;
import com.resourcex.resourcex.exception.BadRequestException;
import com.resourcex.resourcex.exception.ConflictException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.mapper.UserMapper;
import com.resourcex.resourcex.repository.*;
import com.resourcex.resourcex.service.AdminService;
import com.resourcex.resourcex.service.AuditLogService;
import com.resourcex.resourcex.service.NotificationService;
import com.resourcex.resourcex.service.TrustScoreService;
import com.resourcex.resourcex.util.constants.RoleConstants;
import com.resourcex.resourcex.util.constants.TrustPoints;
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


        private final UserRepository userRepository;
        private final StudentProfileRepository studentProfileRepository;
        private final ItemRepository itemRepository;
        private final BookingRepository bookingRepository;
        private final RoleRepository roleRepository;
        private final com.resourcex.resourcex.service.StudentRestrictionManager restrictionManager;
        private final com.resourcex.resourcex.service.AvatarUrlResolver avatarUrlResolver;
        private final FileMetadataRepository fileMetadataRepository;
        private final AuditLogService auditLogService;
        private final com.resourcex.resourcex.service.ItemService itemService;
        private final TrustScoreService trustScoreService;
        private final ReportRepository reportRepository;
        private final NotificationService notificationService;
        private final StudentRestrictionRepository studentRestrictionRepository;
        private final PlatformActivityAggregator platformActivityAggregator;

        @Override
        @Transactional(readOnly = true)
        public DashboardStatsResponse getDashboardStats() {
                long totalUsers = userRepository.count();
                long verifiedStudents = studentProfileRepository.countByEmailVerifiedTrue();
                long pendingApprovals = userRepository.countByStatus(UserStatus.PENDING);
                long totalListings = itemRepository.countByStatusNot(Item.ItemStatus.DELETED);
                long availableListings = itemRepository.countByStatus(Item.ItemStatus.AVAILABLE);
                long activeRentals = bookingRepository.countByStatus(Booking.BookingStatus.APPROVED);
                long reportsPendingReview = reportRepository.count();
                long suspendedUsers = studentRestrictionRepository.countActiveSuspensions(LocalDateTime.now());

                return DashboardStatsResponse.builder()
                                .totalUsers(totalUsers)
                                .verifiedStudents(verifiedStudents)
                                .pendingApprovals(pendingApprovals)
                                .totalListings(totalListings)
                                .availableListings(availableListings)
                                .activeBookings(activeRentals) // Map to existing activeBookings
                                .activeRentals(activeRentals)
                                .reportsPendingReview(reportsPendingReview)
                                .suspendedUsers(suspendedUsers)
                                .build();
        }

        @Override
        @Transactional(readOnly = true)
        public Page<UserResponse> getPendingUsers(Pageable pageable) {

                return userRepository
                        .findByStatus(UserStatus.PENDING, pageable)
                        .map(this::mapToUserResponse);
        }

        @Override
        @Transactional(readOnly = true)
        public UserResponse getPendingUserById(Long pendingId) {
                return userRepository.findById(pendingId)
                        .filter(u -> u.getStatus() == UserStatus.PENDING)
                        .map(this::mapToUserResponse)
                        .orElseThrow(() -> new ResourceNotFoundException("Pending user not found"));
        }

        @Override
        @Transactional
        //to approve user
        public void approveUser(Long pendingId) {
                User pending = userRepository.findById(pendingId)
                                .orElseThrow(() -> new ResourceNotFoundException("Pending user not found"));

                if (pending.getStatus() != UserStatus.PENDING) {
                        throw new ConflictException("User is not awaiting approval");
                }

                pending.setStatus(UserStatus.ACTIVE);
                userRepository.save(pending);

                // Role is assigned at registration (ROLE_USER); safety net if somehow unset.
                if (pending.getRole() == null) {
                        Role defaultRole = roleRepository.findByNameIgnoreCase(RoleConstants.ROLE_USER)
                                        .orElseGet(() -> roleRepository.save(
                                                        Role.builder().name(RoleConstants.ROLE_USER).build()));
                        pending.setRole(defaultRole);
                        userRepository.save(pending);
                }

                auditLogService.logAction(
                                AuditLog.ActorType.USER,
                                resolveCurrentAdminId(),
                                "USER_APPROVED",
                                "USER",
                                pending.getUserId(),
                                AuditLog.AuditOutcome.APPROVED,
                                "Approved university verification for " + pending.getName() + " (" + pending.getEmail() + ")"
                );

                notificationService.createAdminNotification(
                                pending.getUserId(),
                                "Your account has been approved. You now have full access to ResourceX.",
                                resolveCurrentAdminId()
                );
        }

        @Override
        @Transactional
        //reject user
        public void rejectUser(Long pendingId, String reason) {
                User pending = userRepository.findById(pendingId)
                                .orElseThrow(() -> new ResourceNotFoundException("Pending user not found"));

                if (pending.getStatus() != UserStatus.PENDING) {
                        throw new ConflictException("User cannot be rejected in current status");
                }

                pending.setStatus(UserStatus.DELETED);
                userRepository.save(pending);

                String rejectionReason = reason != null && !reason.isBlank()
                                ? reason.trim()
                                : "No rejection reason provided";

                StudentProfile profile = studentProfileRepository.findByUser(pending).orElse(null);
                if (profile != null) {
                        profile.setRejectionReason(rejectionReason);
                        studentProfileRepository.save(profile);
                }

                auditLogService.logAction(
                                AuditLog.ActorType.USER,
                                resolveCurrentAdminId(),
                                "USER_REJECTED",
                                "USER",
                                pending.getUserId(),
                                AuditLog.AuditOutcome.REJECTED,
                                "Rejected university verification for " + pending.getName() + " (" + pending.getEmail() + "). Reason: " + rejectionReason
                );

                notificationService.createAdminNotification(
                                pending.getUserId(),
                                "Your verification request was rejected. Reason: " + rejectionReason,
                                resolveCurrentAdminId()
                );
        }

        @Override
        @Transactional
        // Admin take-down â€” delegates to the single core deletion routine so an
        // admin removal is globally consistent with an owner deletion (item is
        // excluded from every query and its references are cleaned up).
        public void blockItem(Long itemId, String reason) {
                itemService.deleteItem(itemId, reason);
        }

        @Override
        @Transactional
        public void blockUser(Long userId, SuspendUserRequest request) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                com.resourcex.resourcex.entity.StudentRestriction restriction =
                                restrictionManager.getOrCreate(userId);

                if (restriction.getSuspendedAt() != null) {
                        if (restriction.getSuspendedUntil() == null) {
                                throw new ConflictException("User is already permanently suspended");
                        }
                        if (LocalDateTime.now().isBefore(restriction.getSuspendedUntil())) {
                                throw new ConflictException("User is already suspended");
                        }
                }

                Long adminId = resolveCurrentAdminId();
                LocalDateTime now = LocalDateTime.now();

                LocalDateTime suspendedUntil;
                LocalDateTime scheduledDeletion = null;

                String duration = request.getDuration() == null ? "" : request.getDuration().toUpperCase().trim();
                switch (duration) {
                        case "ONE_DAY"       -> suspendedUntil = now.plusDays(1);
                        case "SEVEN_DAYS"    -> suspendedUntil = now.plusDays(7);
                        case "FOURTEEN_DAYS" -> suspendedUntil = now.plusDays(14);
                        case "THIRTY_DAYS"   -> suspendedUntil = now.plusDays(30);
                        case "PERMANENT"     -> {
                                suspendedUntil = null;
                                scheduledDeletion = now.plusDays(15);
                        }
                        default -> throw new BadRequestException("Invalid suspension duration");
                }

                // Suspension details live on the student's restriction record.
                restriction.setSuspensionReason(request.getReason().trim());
                restriction.setSuspendedAt(now);
                restriction.setSuspendedUntil(suspendedUntil);
                restriction.setScheduledDeletionAt(scheduledDeletion);
                restrictionManager.save(restriction);

                String detail = String.format(
                        "Suspended user %s â€” duration=%s, until=%s, reason=%s",
                        user.getEmail(),
                        duration,
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

                // Trust: a moderator-issued suspension carries a trust cost (-30).
                // Applied after status is SUSPENDED so automated enforcement does not re-suspend.
                trustScoreService.applyTrustChange(
                                userId,
                                TrustPoints.TEMPORARY_SUSPENSION,
                                "Moderator suspension: " + request.getReason().trim()
                );
        }

        @Override
        @Transactional
        public void unblockUser(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                Long adminId = resolveCurrentAdminId();

                user.setStatus(UserStatus.ACTIVE);
                userRepository.save(user);

                restrictionManager.find(userId).ifPresent(restriction -> {
                        restriction.clearSuspension();
                        restrictionManager.save(restriction);
                });

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

        // â”€â”€ Private helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

        /** Returns the userId of the currently authenticated admin, or null if not resolvable. */
        private Long resolveCurrentAdminId() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth == null || auth.getName() == null) return null;
                return userRepository.findByEmailIgnoreCase(auth.getName())
                                .map(User::getUserId)
                                .orElse(null);
        }

        private UserResponse mapToUserResponse(User user) {
                UserResponse response = UserMapper.toResponse(
                        user,
                        studentProfileRepository.findByUser(user).orElse(null)
                );
                response.setAvatarUrl(avatarUrlResolver.resolve(user.getAvatarFileId()));
                // Suspension details live on the student's restriction record.
                restrictionManager.find(user.getUserId()).ifPresent(r -> {
                        response.setSuspensionReason(r.getSuspensionReason());
                        response.setSuspendedAt(r.getSuspendedAt());
                        response.setSuspendedUntil(r.getSuspendedUntil());
                        response.setScheduledDeletionAt(r.getScheduledDeletionAt());
                });
                if (response.getStudentProfile() != null && response.getStudentProfile().getIdCardFileId() != null) {
                        response.getStudentProfile().setIdCardDataUrl(resolveStoredName(response.getStudentProfile().getIdCardFileId()));
                }
                return response;
        }

        // Resolves a FileMetadata id to its stored file name, which the
        // GET /api/files/{storedName} endpoint serves. Returns null when the
        // id is null or no matching file exists.
        private String resolveStoredName(Long fileId) {
                if (fileId == null) {
                        return null;
                }
                return fileMetadataRepository.findById(fileId)
                                .map(com.resourcex.resourcex.entity.FileMetadata::getFileUrl)
                                .orElse(null);
        }



        @Override
        @Transactional(readOnly = true)
        public List<PlatformActivityResponse> getPlatformActivities() {
                return platformActivityAggregator.getPlatformActivities();
        }

        @Override
        @Transactional(readOnly = true)
        public List<UserResponse> getAdminsAndModerators() {
                List<String> roles = List.of(RoleConstants.ROLE_ADMIN, RoleConstants.ROLE_MODERATOR, RoleConstants.ROLE_SUPER_ADMIN);
                return userRepository.findAllByRoleNamesList(roles).stream()
                                .map(user -> UserMapper.toResponse(
                                                user,
                                                studentProfileRepository.findByUser(user).orElse(null)))
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional
        public void unblockItem(Long itemId) {
                Item item = itemRepository.findById(itemId)
                                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

                if (item.getStatus() != Item.ItemStatus.DELETED && item.getStatus() != Item.ItemStatus.BLOCKED) {
                        throw new ConflictException("Item is not blocked or deleted");
                }

                item.setStatus(Item.ItemStatus.AVAILABLE);
                itemRepository.save(item);

                auditLogService.logAction(
                                AuditLog.ActorType.USER,
                                resolveCurrentAdminId(),
                                "ITEM_UNBLOCKED",
                                "ITEM",
                                itemId,
                                AuditLog.AuditOutcome.SUCCESS,
                                "Admin unblocked item: " + item.getTitle()
                );
        }
}
