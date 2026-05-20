package com.thirdhand.campusvault.service.impl;

import com.thirdhand.campusvault.dto.response.DashboardStatsResponse;
import com.thirdhand.campusvault.dto.response.PendingUserResponse;
import com.thirdhand.campusvault.entity.PendingUser;
import com.thirdhand.campusvault.entity.User;
import com.thirdhand.campusvault.entity.UserStatus;
import com.thirdhand.campusvault.repository.PendingUserRepository;
import com.thirdhand.campusvault.repository.UserRepository;
import com.thirdhand.campusvault.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final PendingUserRepository pendingUserRepository;
    private final UserRepository userRepository;

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

        User user = User.builder()
                .studentId(pending.getStudentId())
                .name(pending.getName())
                .email(pending.getEmail())
                .password(pending.getPassword())
                .phone(pending.getPhone())
                .trustScore(100)
                .verified(true)
                .build();

        userRepository.save(user);
        pendingUserRepository.delete(pending);
    }

    @Override
    @Transactional
    public void rejectUser(Long pendingId) {
        PendingUser pending = pendingUserRepository.findById(pendingId)
                .orElseThrow(() -> new IllegalArgumentException("Pending user not found"));
        
        pending.setStatus(UserStatus.REJECTED);
        pendingUserRepository.save(pending);
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