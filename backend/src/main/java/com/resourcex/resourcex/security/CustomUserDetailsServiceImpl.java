package com.resourcex.resourcex.security;

import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.repository.UserRoleRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.util.constants.RoleConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();

        if (normalizedEmail.isBlank()) {
            throw new UsernameNotFoundException("Email is required");
        }

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<SimpleGrantedAuthority> authorities = userRoleRepository.findAllByUser(user).stream()
                .map(userRole -> userRole.getRole())
                .filter(role -> role != null && role.getName() != null && !role.getName().isBlank())
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .toList();

        if (authorities.isEmpty()) {
            authorities = List.of(new SimpleGrantedAuthority(RoleConstants.ROLE_USER));
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }
}