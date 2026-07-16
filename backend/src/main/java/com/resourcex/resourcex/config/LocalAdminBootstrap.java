package com.resourcex.resourcex.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.resourcex.resourcex.entity.Role;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserStatus;
import com.resourcex.resourcex.repository.RoleRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.util.constants.RoleConstants;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Local-profile-only bootstrap of a SUPER_ADMIN account.
 *
 * <p>The application intentionally registers users in {@link UserStatus#PENDING}
 * and requires an existing administrator to approve them. In the {@code local}
 * profile there is no Flyway seed and no other bootstrap, so a fresh database
 * contains zero administrators — making the approval workflow unreachable.
 *
 * <p>This runner is gated by {@link Profile @Profile("local")} and therefore
 * never executes in production or any other profile. It is idempotent: roles
 * and the bootstrap user are created only if they do not already exist, and
 * subsequent boots perform a no-op.
 *
 * <p>Configuration is read from {@code application-local.properties} via the
 * {@code app.bootstrap-admin.*} keys. Credentials are never hardcoded.
 */
@Component
@Profile("local")
@RequiredArgsConstructor
@Slf4j
@Order(0)
public class LocalAdminBootstrap implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap-admin.enabled:false}")
    private boolean enabled;

    @Value("${app.bootstrap-admin.email:}")
    private String email;

    @Value("${app.bootstrap-admin.password:}")
    private String rawPassword;

    @Value("${app.bootstrap-admin.name:Local Super Admin}")
    private String name;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }

        if (email == null || email.isBlank() || rawPassword == null || rawPassword.isBlank()) {
            log.warn("[LocalAdminBootstrap] Skipped: app.bootstrap-admin.email and " +
                    "app.bootstrap-admin.password must both be set when enabled=true.");
            return;
        }

        Role superAdminRole = roleRepository.findByNameIgnoreCase(RoleConstants.ROLE_SUPER_ADMIN)
                .orElseGet(() -> roleRepository.save(
                        Role.builder().name(RoleConstants.ROLE_SUPER_ADMIN).build()));

        String normalizedEmail = email.trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            log.info("[LocalAdminBootstrap] Bootstrap admin already present for email {} — no action taken.",
                    normalizedEmail);
        } else {
            User admin = User.builder()
                    .name(name)
                    .email(normalizedEmail)
                    .password(passwordEncoder.encode(rawPassword))
                    .status(UserStatus.ACTIVE)
                    .role(superAdminRole)
                    .build();
            userRepository.save(admin);
            log.info("[LocalAdminBootstrap] Created bootstrap SUPER_ADMIN user for email {}.",
                    normalizedEmail);
        }

        log.info("==================================================");
        log.info("Local bootstrap administrator ready");
        log.info("");
        log.info("Email:");
        log.info(normalizedEmail);
        log.info("");
        log.info("Profile:");
        log.info("local");
        log.info("==================================================");
    }
}