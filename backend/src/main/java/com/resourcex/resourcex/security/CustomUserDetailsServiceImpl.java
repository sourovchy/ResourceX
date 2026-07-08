package com.resourcex.resourcex.security;

import com.resourcex.resourcex.entity.StudentRestriction;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserStatus;
import com.resourcex.resourcex.repository.StudentRestrictionRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.util.constants.RoleConstants;

import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;
    private final StudentRestrictionRepository studentRestrictionRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();

        if (normalizedEmail.isBlank()) {
            log.warn("Attempted to load user with blank email");
            throw new UsernameNotFoundException("Email is required");
        }

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> {
                    log.warn("User not found with email: {}", normalizedEmail);
                    return new UsernameNotFoundException("User not found");
                });

        // Each user has exactly one role.
        String roleName = (user.getRole() != null && user.getRole().getName() != null
                && !user.getRole().getName().isBlank())
                ? user.getRole().getName()
                : RoleConstants.ROLE_USER;
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(roleName));

        // Account is "enabled" only when ACTIVE, or when a timed suspension has naturally expired.
        boolean enabled = isAccountEnabled(user);
        if (!enabled) {
            log.debug("Account is suspended/disabled for user: {}", normalizedEmail);
        }

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                enabled,  // isEnabled
                true,     // isAccountNonExpired
                true,     // isCredentialsNonExpired
                true,     // isAccountNonLocked
                authorities);

        log.debug("Successfully loaded user details for: {} with role {}, enabled={}",
                normalizedEmail, roleName, enabled);
        return userDetails;
    }

    /**
     * Account is enabled when:
     * <ul>
     *   <li>Status is ACTIVE, OR</li>
     *   <li>Status is SUSPENDED but the timed suspension window has already expired.</li>
     * </ul>
     * Suspension details live on the student's {@link StudentRestriction} record.
     */
    private boolean isAccountEnabled(User user) {
        if (user.getStatus() != UserStatus.ACTIVE) {
            return false;
        }
        StudentRestriction restriction = studentRestrictionRepository
                .findByStudentUserId(user.getUserId())
                .orElse(null);
        if (restriction != null && restriction.getSuspendedAt() != null) {
            LocalDateTime until = restriction.getSuspendedUntil();
            if (until == null) {
                return false;
            }
            return LocalDateTime.now().isAfter(until);
        }
        return true;
    }
}
