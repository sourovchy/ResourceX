package com.resourcex.resourcex.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String jwt = extractJwt(accessor);

            if (jwt != null) {
                try {
                    String email = jwtService.extractEmail(jwt);
                    if (email != null && !email.isBlank()) {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                        if (jwtService.isTokenValid(jwt, userDetails.getUsername())) {
                            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities());

                            accessor.setUser(authToken);
                            log.debug("Successfully authenticated user for WebSocket: {}", email);
                        } else {
                            log.warn("WebSocket token validation failed for user: {}", email);
                        }
                    }
                } catch (Exception e) {
                    log.error("Error processing JWT authentication for WebSocket", e);
                }
            } else {
                log.warn("No valid Bearer token provided in WebSocket CONNECT frame");
            }
        }
        return message;
    }

    private String extractJwt(StompHeaderAccessor accessor) {
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }
        // Fall back to JWT extracted from the httpOnly cookie during the HTTP handshake
        var sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes != null) {
            Object cookieJwt = sessionAttributes.get("jwt");
            if (cookieJwt instanceof String token && !token.isBlank()) {
                return token;
            }
        }
        return null;
    }
}
