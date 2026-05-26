package com.resourcex.resourcex.security;

import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.repository.UserRoleRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.util.constants.RoleConstants;
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

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities);

        log.debug("Successfully loaded user details for: {} with {} authorities", normalizedEmail, authorities.size());
        return userDetails;
    }
}