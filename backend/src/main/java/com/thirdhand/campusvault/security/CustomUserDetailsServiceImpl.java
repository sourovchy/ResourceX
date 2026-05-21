package com.thirdhand.campusvault.security;

import com.thirdhand.campusvault.entity.User;
import com.thirdhand.campusvault.exception.ResourceNotFoundException;
import com.thirdhand.campusvault.repository.UserRoleRepository;
import com.thirdhand.campusvault.repository.UserRepository;
import com.thirdhand.campusvault.util.constants.RoleConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        List<SimpleGrantedAuthority> authorities = userRoleRepository.findByUser(user).stream()
                .map(userRole -> new SimpleGrantedAuthority(userRole.getRole().getName()))
                .toList();

        if (authorities.isEmpty()) {
            authorities = Collections.singletonList(
                    new SimpleGrantedAuthority(RoleConstants.ROLE_USER)
            );
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }
}
