package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.response.BlockStatusResponse;
import com.resourcex.resourcex.dto.response.BlockedUserResponse;
import com.resourcex.resourcex.entity.AuditLog;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserBlock;
import com.resourcex.resourcex.exception.BadRequestException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.repository.UserBlockRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.repository.UserRoleRepository;
import com.resourcex.resourcex.service.AuditLogService;
import com.resourcex.resourcex.service.BlockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BlockServiceImpl implements BlockService {

    private final UserBlockRepository userBlockRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public BlockStatusResponse blockUser(String currentUserEmail, Long targetUserId) {
        User currentUser = getAuthenticatedUser(currentUserEmail);

        if (currentUser.getUserId().equals(targetUserId)) {
            throw new BadRequestException("You cannot block yourself");
        }

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isTargetStaff = userRoleRepository.findAllByUser_UserId(target.getUserId()).stream()
                .map(ur -> ur.getRole().getName().toUpperCase())
                .anyMatch(role -> role.equals("ROLE_ADMIN") || role.equals("ROLE_SUPER_ADMIN") || role.equals("ROLE_MODERATOR"));
        
        if (isTargetStaff) {
            throw new BadRequestException("Staff and Administrators cannot be blocked");
        }

        // Idempotent — only create the block (and log) when it doesn't already exist
        if (!userBlockRepository.existsByBlocker_UserIdAndBlocked_UserId(
                currentUser.getUserId(), target.getUserId())) {

            userBlockRepository.save(UserBlock.builder()
                    .blocker(currentUser)
                    .blocked(target)
                    .build());

            auditLogService.logAction(
                    AuditLog.ActorType.USER,
                    currentUser.getUserId(),
                    "USER_BLOCKED",
                    "USER",
                    target.getUserId(),
                    AuditLog.AuditOutcome.SUCCESS,
                    "User " + currentUser.getUserId() + " blocked user " + target.getUserId()
            );
        }

        return computeStatus(currentUser.getUserId(), target.getUserId());
    }

    @Override
    @Transactional
    public BlockStatusResponse unblockUser(String currentUserEmail, Long targetUserId) {
        User currentUser = getAuthenticatedUser(currentUserEmail);

        userBlockRepository
                .findByBlocker_UserIdAndBlocked_UserId(currentUser.getUserId(), targetUserId)
                .ifPresent(block -> {
                    userBlockRepository.delete(block);
                    auditLogService.logAction(
                            AuditLog.ActorType.USER,
                            currentUser.getUserId(),
                            "USER_UNBLOCKED",
                            "USER",
                            targetUserId,
                            AuditLog.AuditOutcome.SUCCESS,
                            "User " + currentUser.getUserId() + " unblocked user " + targetUserId
                    );
                });

        return computeStatus(currentUser.getUserId(), targetUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public BlockStatusResponse getBlockStatus(String currentUserEmail, Long targetUserId) {
        User currentUser = getAuthenticatedUser(currentUserEmail);
        return computeStatus(currentUser.getUserId(), targetUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlockedUserResponse> getBlockedUsers(String currentUserEmail) {
        User currentUser = getAuthenticatedUser(currentUserEmail);

        return userBlockRepository
                .findByBlocker_UserIdOrderByCreatedAtDesc(currentUser.getUserId())
                .stream()
                .map(block -> BlockedUserResponse.builder()
                        .userId(block.getBlocked().getUserId())
                        .name(block.getBlocked().getName())
                        .email(block.getBlocked().getEmail())
                        .blockedAt(block.getCreatedAt())
                        .build())
                .toList();
    }

    private BlockStatusResponse computeStatus(Long currentUserId, Long targetUserId) {
        boolean blockedByMe = userBlockRepository
                .existsByBlocker_UserIdAndBlocked_UserId(currentUserId, targetUserId);
        boolean blockedByThem = userBlockRepository
                .existsByBlocker_UserIdAndBlocked_UserId(targetUserId, currentUserId);

        return BlockStatusResponse.builder()
                .blockedByMe(blockedByMe)
                .blockedByThem(blockedByThem)
                .blocked(blockedByMe || blockedByThem)
                .build();
    }

    private User getAuthenticatedUser(String currentUserEmail) {
        if (currentUserEmail == null || currentUserEmail.trim().isEmpty()) {
            throw new BadRequestException("Authenticated user is required");
        }

        return userRepository.findByEmailIgnoreCase(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
