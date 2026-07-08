package com.resourcex.resourcex.service;

import com.resourcex.resourcex.entity.StudentProfile;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.repository.StudentProfileRepository;
import com.resourcex.resourcex.service.impl.TrustScoreServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TrustScoreServiceTest {

    @Mock StudentProfileRepository studentProfileRepository;
    @Mock NotificationService notificationService;
    @Mock AuditLogService auditLogService;
    @Mock TrustEnforcementService trustEnforcementService;
    @InjectMocks TrustScoreServiceImpl trustScoreService;

    private User user;
    private StudentProfile profile;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(2L);
        user.setEmail("renter@campus.edu");

        profile = StudentProfile.builder()
                .userId(2L)
                .user(user)
                .trustScore(100)
                .build();

        given(studentProfileRepository.findByUser_UserId(2L)).willReturn(Optional.of(profile));
    }

    @Test
    void appliesPositiveChange() {
        trustScoreService.applyTrustChange(2L, 25, "Completed booking");

        assertThat(profile.getTrustScore()).isEqualTo(125);
        then(trustEnforcementService).should().evaluate(user, profile, 100);
    }

    @Test
    void clampsAtMaximum() {
        profile.setTrustScore(199);

        trustScoreService.applyTrustChange(2L, 5, "5-star review");

        assertThat(profile.getTrustScore()).isEqualTo(200);
        then(trustEnforcementService).should().evaluate(user, profile, 199);
    }

    @Test
    void clampsAtMinimum() {
        profile.setTrustScore(3);

        trustScoreService.applyTrustChange(2L, -8, "1-star review");

        assertThat(profile.getTrustScore()).isEqualTo(0);
        then(trustEnforcementService).should().evaluate(user, profile, 3);
    }

    @Test
    void skipsWhenNoStudentProfile() {
        given(studentProfileRepository.findByUser_UserId(99L)).willReturn(Optional.empty());

        trustScoreService.applyTrustChange(99L, -10, "x");

        then(trustEnforcementService).should(never()).evaluate(any(), any(), anyInt());
    }
}
