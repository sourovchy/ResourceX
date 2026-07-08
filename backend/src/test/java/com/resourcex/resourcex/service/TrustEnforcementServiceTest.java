package com.resourcex.resourcex.service;

import com.resourcex.resourcex.entity.StudentProfile;
import com.resourcex.resourcex.entity.StudentRestriction;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserStatus;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.impl.TrustEnforcementServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class TrustEnforcementServiceTest {

    @Mock UserRepository userRepository;
    @Mock NotificationService notificationService;
    @Mock EmailService emailService;
    @Mock AuditLogService auditLogService;
    @Mock StudentRestrictionManager restrictionManager;
    @InjectMocks TrustEnforcementServiceImpl enforcement;

    private User user;
    private StudentProfile profile;
    private StudentRestriction restriction;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(2L);
        user.setEmail("u@campus.edu");
        user.setStatus(UserStatus.ACTIVE);

        restriction = StudentRestriction.builder()
                .studentUserId(2L)
                .build();
        given(restrictionManager.find(2L)).willReturn(Optional.of(restriction));

        profile = StudentProfile.builder().userId(2L).user(user).build();
    }

    @Test
    void warnsBelowSixty() {
        profile.setTrustScore(55);

        enforcement.evaluate(user, profile, 100);

        then(notificationService).should().createTrustNotification(eq(2L), any(), contains("acceptable community standard"), any());
        then(emailService).should().sendTrustNotificationEmail(eq("u@campus.edu"), any(), eq("Trust Score Warning"), any());
    }

    @Test
    void restrictsBelowFifty() {
        profile.setTrustScore(45);

        enforcement.evaluate(user, profile, 100);

        then(notificationService).should().createTrustNotification(eq(2L), any(), contains("temporarily restricted"), any());
    }

    @Test
    void recoverySendsLiftedNotification() {
        profile.setTrustScore(85);

        enforcement.evaluate(user, profile, 45);

        then(notificationService).should().createTrustNotification(eq(2L), any(), contains("restriction has been lifted"), any());
    }

    @Test
    void suspensionIsPermanent() {
        profile.setTrustScore(30);

        enforcement.evaluate(user, profile, 100);

        assertThat(restriction.getSuspendedUntil()).isNull();
        assertThat(restriction.getScheduledDeletionAt()).isNotNull();
        then(notificationService).should().createTrustNotification(eq(2L), any(), contains("automatically suspended"), any());
    }
}
