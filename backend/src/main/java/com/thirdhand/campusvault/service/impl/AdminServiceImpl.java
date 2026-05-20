package com.thirdhand.campusvault.service.impl;

import com.thirdhand.campusvault.dto.response.DashboardStatsResponse;
import com.thirdhand.campusvault.dto.response.PendingUserResponse;
import com.thirdhand.campusvault.entity.*;
import com.thirdhand.campusvault.repository.*;
import com.thirdhand.campusvault.service.AdminService;
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

    @Override
    public DashboardStatsResponse getDashboardStats() {
        return new DashboardStatsResponse();
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
        PendingUser pending = pendingUserRepository.findById(pendingId)
                .orElseThrow(() -> new IllegalArgumentException("Pending user not found"));

        if (!pending.isEmailVerified()) {
            throw new IllegalStateException("Email must be verified before approval");
        }

        // Find or create University
        String uniName = pending.getUniversity() != null ? pending.getUniversity() : "Unknown University";
        University university = universityRepository.findByName(uniName)
                .orElseGet(() -> universityRepository.save(University.builder()
                        .name(uniName)
                        .isVerified(false)
                        .build()));

        User user = User.builder()
                .studentId(pending.getStudentId())
                .name(pending.getName())
                .email(pending.getEmail())
                .password(pending.getPassword())
                .phone(pending.getPhone())
                .university(university)
                .trustScore(100)
                .status(User.AccountStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        // Create Verification record
        StudentVerification verification = StudentVerification.builder()
                .user(savedUser)
                .idCardImage(pending.getIdCardDataUrl()) // Assuming URL is used as image path/data
                .status(StudentVerification.VerificationStatus.VERIFIED)
                .reviewedAt(LocalDateTime.now())
                .build();
        studentVerificationRepository.save(verification);

        // Create Audit Log
        AuditLog log = AuditLog.builder()
                .actorType(AuditLog.ActorType.SYSTEM) // For now, system auto-approves or admin via API
                .actionType("USER_APPROVAL")
                .entityType("USER")
                .entityId(savedUser.getUserId())
                .outcome(AuditLog.AuditOutcome.APPROVED)
                .details("User " + savedUser.getEmail() + " approved from pending state")
                .build();
        auditLogRepository.save(log);

        pendingUserRepository.delete(pending);
    }

    @Override
    @Transactional
    public void rejectUser(Long pendingId) {
        PendingUser pending = pendingUserRepository.findById(pendingId)
                .orElseThrow(() -> new IllegalArgumentException("Pending user not found"));
        
        pending.setStatus(UserStatus.REJECTED);
        pendingUserRepository.save(pending);

        // Create Audit Log for rejection
        AuditLog log = AuditLog.builder()
                .actorType(AuditLog.ActorType.SYSTEM)
                .actionType("USER_REJECTION")
                .entityType("PENDING_USER")
                .entityId(pending.getId())
                .outcome(AuditLog.AuditOutcome.REJECTED)
                .details("User " + pending.getEmail() + " rejected")
                .build();
        auditLogRepository.save(log);
    }

    private PendingUserResponse mapToResponse(PendingUser pending) {
        return PendingUserResponse.builder()
                .id(pending.getId())
                .studentId(pending.getStudentId())
                .name(pending.getName())
                .email(pending.getEmail())
                .phone(pending.getPhone())
                .university(pending.getUniversity())
                .department(pending.getDepartment())
                .idCardDataUrl(pending.getIdCardDataUrl())
                .status(pending.getStatus())
                .emailVerified(pending.isEmailVerified())
                .phoneVerified(pending.isPhoneVerified())
                .createdAt(pending.getCreatedAt())
                .build();
    }
}