package com.resourcex.resourcex.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
@Slf4j
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http,
                        CorsConfigurationSource corsConfigurationSource) throws Exception {

                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                                .csrf(csrf -> csrf.disable())

                                .formLogin(AbstractHttpConfigurer::disable)
                                .httpBasic(AbstractHttpConfigurer::disable)

                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                .authorizeHttpRequests(auth -> auth

                                                // Preflight
                                                .requestMatchers(HttpMethod.OPTIONS, "/**")
                                                .permitAll()

                                                // Public auth endpoints
                                                .requestMatchers(
                                                                "/api/auth/login",
                                                                "/api/auth/register",
                                                                "/api/auth/forgot-password",
                                                                "/api/auth/reset-password")
                                                .permitAll()

                                                // OTP endpoints
                                                .requestMatchers("/api/otp/**")
                                                .permitAll()

                                                // Public File endpoints (GET only – uploads require auth)
                                                .requestMatchers(HttpMethod.GET, "/api/files/**")
                                                .permitAll()

                                                // Swagger
                                                .requestMatchers(
                                                                "/swagger-ui/**",
                                                                "/v3/api-docs/**",
                                                                "/swagger-ui.html")
                                                .permitAll()

                                                // Super Admin endpoints
                                                .requestMatchers("/api/superadmin/**")
                                                .hasRole("SUPER_ADMIN")

                                                // Admin endpoints
                                                .requestMatchers("/api/admin/**")
                                                .hasAnyRole("SUPER_ADMIN", "ADMIN")

                                                // Analytics endpoints
                                                .requestMatchers("/api/analytics/**")
                                                .hasAnyRole("SUPER_ADMIN", "ADMIN", "MODERATOR")

                                                // User endpoints
                                                .requestMatchers("/api/users/**")
                                                .authenticated()

                                                // Item endpoints
                                                .requestMatchers(HttpMethod.GET, "/api/items/**")
                                                .authenticated()

                                                .requestMatchers("/api/items/**")
                                                .hasAnyRole("USER", "ADMIN", "SUPER_ADMIN", "MODERATOR")

                                                // Booking endpoints
                                                .requestMatchers("/api/bookings/**")
                                                .hasAnyRole("USER", "ADMIN", "SUPER_ADMIN", "MODERATOR")

                                                // Review endpoints
                                                .requestMatchers("/api/reviews/**")
                                                .hasAnyRole("USER", "ADMIN", "SUPER_ADMIN", "MODERATOR")

                                                // Payment endpoints
                                                .requestMatchers("/api/payments/**")
                                                .hasAnyRole("USER", "ADMIN", "SUPER_ADMIN", "MODERATOR")

                                                // Dispute endpoints
                                                .requestMatchers("/api/disputes/**")
                                                .hasAnyRole("USER", "ADMIN", "SUPER_ADMIN", "MODERATOR")

                                                // Everything else
                                                .anyRequest()
                                                .authenticated())

                                .addFilterBefore(
                                                jwtAuthenticationFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationManager authenticationManager(
                        AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }
}
