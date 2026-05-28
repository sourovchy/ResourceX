package com.resourcex.resourcex.security;

import com.resourcex.resourcex.entity.SuspensionType;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserStatus;
import com.resourcex.resourcex.repository.UserRoleRepository;
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
    private final UserRoleRepository userRoleRepository;

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

        List<SimpleGrantedAuthority> authorities = userRoleRepository.findAllByUser(user).stream()
                .map(userRole -> userRole.getRole())
                .filter(role -> role != null && role.getName() != null && !role.getName().isBlank())
                .map(role -> {
                    String roleName = role.getName();
                    log.debug("Loading role: {} for user: {}", roleName, normalizedEmail);
                    return new SimpleGrantedAuthority(roleName);
                })
                .toList();

        if (authorities.isEmpty()) {
            log.debug("No roles found for user: {}. Assigning default ROLE_USER", normalizedEmail);
            authorities = List.of(new SimpleGrantedAuthority(RoleConstants.ROLE_USER));
        } else {
            log.debug("Loaded {} authorities for user {}: {}", authorities.size(), normalizedEmail, authorities);
        }

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

        log.debug("Successfully loaded user details for: {} with {} authorities, enabled={}",
                normalizedEmail, authorities.size(), enabled);
        return userDetails;
    }

    /**
     * An account is enabled when:
     * <ul>
     *   <li>Status is ACTIVE, OR</li>
     *   <li>Status is SUSPENDED but the timed suspension window has already expired.</li>
     * </ul>
     */
    private boolean isAccountEnabled(User user) {
        if (user.getStatus() == UserStatus.ACTIVE) {
            return true;
        }
        if (user.getStatus() == UserStatus.SUSPENDED) {
            if (user.getSuspensionType() == SuspensionType.PERMANENT) {
                return false;
            }
            LocalDateTime until = user.getSuspendedUntil();
            return until != null && LocalDateTime.now().isAfter(until);
        }
        return false; // BANNED or unknown
    }
}