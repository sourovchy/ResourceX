package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.OtpRequest;
import com.resourcex.resourcex.dto.request.OtpVerifyRequest;
import com.resourcex.resourcex.dto.response.OtpResponse;
import com.resourcex.resourcex.entity.OtpStatus;
import com.resourcex.resourcex.entity.OtpToken;
import com.resourcex.resourcex.entity.PendingUser;
import com.resourcex.resourcex.entity.UserStatus;
import com.resourcex.resourcex.exception.ConflictException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.exception.UnauthorizedException;
import com.resourcex.resourcex.repository.OtpRepository;
import com.resourcex.resourcex.repository.PendingUserRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.EmailService;
import com.resourcex.resourcex.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private static final int OTP_LENGTH = 6;
    private static final int MAX_ATTEMPTS = 5;
    private static final long OTP_TTL_MINUTES = 3;
    private static final long RESEND_COOLDOWN_SECONDS = 300;
    private static final int MAX_OTP_REQUESTS_PER_DAY = 3;
    private static final long RETAIN_FINISHED_TOKENS_HOURS = 24;

    private final OtpRepository otpRepository;
    private final UserRepository userRepository;
    private final PendingUserRepository pendingUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final TransactionTemplate transactionTemplate;

    private final SecureRandom secureRandom = new SecureRandom();
    private final Clock clock = Clock.systemUTC();

    @Override
    public OtpResponse sendOtp(OtpRequest request) {
        return issueOtp(request.email(), "OTP sent successfully");
    }

    @Override
    public OtpResponse resendOtp(OtpRequest request) {
        return issueOtp(request.email(), "OTP resent successfully");
    }

    @Override
    @Transactional
    public OtpResponse verifyOtp(OtpVerifyRequest request) {
        String email = normalizeEmail(request.email());
        String inputOtp = normalizeOtp(request.otp());
        Instant now = now();

        expireExpiredPendingTokens(email, now);

        OtpToken token = findLatestPendingTokenForUpdate(email)
                .orElseThrow(() -> new UnauthorizedException("OTP expired or not found"));

        if (isExpired(token, now)) {
            token.setStatus(OtpStatus.EXPIRED);
            otpRepository.save(token);
            throw new UnauthorizedException("OTP expired or not found");
        }

        if (token.getAttemptCount() >= MAX_ATTEMPTS) {
            token.setStatus(OtpStatus.CANCELLED);
            otpRepository.save(token);
            throw new UnauthorizedException("OTP cancelled due to too many attempts");
        }

        if (!passwordEncoder.matches(inputOtp, token.getOtpHash())) {
            token.setAttemptCount(token.getAttemptCount() + 1);

            if (token.getAttemptCount() >= MAX_ATTEMPTS) {
                token.setStatus(OtpStatus.CANCELLED);
            }

            otpRepository.save(token);
            throw new UnauthorizedException("Invalid OTP");
        }

        token.setStatus(OtpStatus.USED);
        token.setVerifiedAt(now);
        token.setUsedAt(now);
        otpRepository.save(token);

        PendingUser pendingUser = pendingUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Pending user not found"));

        pendingUser.setEmailVerified(true);
        if (pendingUser.getStatus() == UserStatus.PENDING_VERIFICATION) {
            pendingUser.setStatus(UserStatus.PENDING_APPROVAL);
        }
        pendingUserRepository.save(pendingUser);

        return OtpResponse.builder()
                .success(true)
                .message("OTP verified successfully")
                .email(email)
                .expiresInSeconds(0L)
                .build();
    }

    private OtpResponse issueOtp(String rawEmail, String successMessage) {
        IssuedOtp issuedOtp = transactionTemplate.execute(status -> createOtp(rawEmail));

        try {
            emailService.sendOtpEmail(issuedOtp.email(), issuedOtp.rawOtp());
        } catch (RuntimeException ex) {
            cancelIssuedOtp(issuedOtp.tokenId());
            throw ex;
        }

        return OtpResponse.builder()
                .success(true)
                .message(successMessage)
                .email(issuedOtp.email())
                .expiresInSeconds(issuedOtp.expiresInSeconds())
                .build();
    }

    private IssuedOtp createOtp(String rawEmail) {
        String email = normalizeEmail(rawEmail);
        Instant now = now();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email is already registered");
        }

        PendingUser pendingUser = pendingUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Please register first"));

        if (Boolean.TRUE.equals(pendingUser.getEmailVerified())) {
            throw new UnauthorizedException("Email is already verified. Awaiting admin approval.");
        }

        if (pendingUser.getStatus() == UserStatus.REJECTED) {
            throw new UnauthorizedException("Registration was rejected");
        }

        if (pendingUser.getStatus() == UserStatus.PENDING_APPROVAL) {
            throw new UnauthorizedException("Email is already verified. Awaiting admin approval.");
        }

        long requestCount = otpRepository.countByEmailAndCreatedAtAfter(
                email,
                now.minus(24, ChronoUnit.HOURS)
        );

        if (requestCount >= MAX_OTP_REQUESTS_PER_DAY) {
            throw new UnauthorizedException("Maximum OTP request limit reached");
        }

        expireExpiredPendingTokens(email, now);

        Optional<OtpToken> latestPendingOtp = findLatestPendingTokenForUpdate(email);

        if (latestPendingOtp.isPresent()) {
            OtpToken latest = latestPendingOtp.get();
            if (latest.getLastSentAt() != null &&
                    latest.getLastSentAt().plusSeconds(RESEND_COOLDOWN_SECONDS).isAfter(now)) {
                long secondsRemaining = ChronoUnit.SECONDS.between(
                        now,
                        latest.getLastSentAt().plusSeconds(RESEND_COOLDOWN_SECONDS)
                );
                throw new UnauthorizedException(
                        "Please wait " + secondsRemaining + " seconds before requesting another OTP"
                );
            }

            latest.setStatus(OtpStatus.EXPIRED);
            otpRepository.save(latest);
        }

        String rawOtp = generateOtp();
        String hashedOtp = passwordEncoder.encode(rawOtp);

        OtpToken token = OtpToken.builder()
                .email(email)
                .otpHash(hashedOtp)
                .status(OtpStatus.PENDING)
                .attemptCount(0)
                .createdAt(now)
                .expiresAt(now.plus(OTP_TTL_MINUTES, ChronoUnit.MINUTES))
                .lastSentAt(now)
                .build();

        OtpToken savedToken = otpRepository.save(token);

        return new IssuedOtp(
                email,
                rawOtp,
                OTP_TTL_MINUTES * 60,
                savedToken.getId()
        );
    }

    @Scheduled(fixedDelayString = "${app.otp.cleanup.fixed-delay-ms:3600000}")
    @Transactional
    public void cleanupOtpTokens() {
        Instant now = now();
        otpRepository.expireExpiredOtp(
                OtpStatus.EXPIRED,
                OtpStatus.PENDING,
                now
        );
        otpRepository.deleteByStatusInAndExpiresAtBefore(
                List.copyOf(EnumSet.of(
                        OtpStatus.EXPIRED,
                        OtpStatus.USED,
                        OtpStatus.CANCELLED
                )),
                now.minus(RETAIN_FINISHED_TOKENS_HOURS, ChronoUnit.HOURS)
        );
    }

    private Optional<OtpToken> findLatestPendingTokenForUpdate(String email) {
        return otpRepository.findByEmailAndStatusForUpdate(
                        email,
                        OtpStatus.PENDING
                ).stream()
                .findFirst();
    }

    private void expireExpiredPendingTokens(String email, Instant now) {
        otpRepository.expireExpiredOtpForEmail(
                email,
                OtpStatus.EXPIRED,
                OtpStatus.PENDING,
                now
        );
    }

    private boolean isExpired(OtpToken token, Instant now) {
        return token.getExpiresAt() == null || !token.getExpiresAt().isAfter(now);
    }

    private void cancelIssuedOtp(Long tokenId) {
        transactionTemplate.executeWithoutResult(status ->
                otpRepository.findById(tokenId).ifPresent(token -> {
                    token.setStatus(OtpStatus.CANCELLED);
                    otpRepository.save(token);
                })
        );
    }

    private String generateOtp() {
        int min = (int) Math.pow(10, OTP_LENGTH - 1);
        int max = (int) Math.pow(10, OTP_LENGTH) - 1;
        return String.valueOf(min + secureRandom.nextInt(max - min + 1));
    }

    private String normalizeOtp(String otp) {

        if (otp == null) {
            throw new UnauthorizedException("OTP is required");
        }

        String normalized = otp.trim();

        if (!normalized.matches("\\d{6}")) {
            throw new UnauthorizedException("OTP must be 6 digits");
        }

        return normalized;
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new UnauthorizedException("Email is required");
        }
        return email.trim().toLowerCase();
    }

    private Instant now() {
        return Instant.now(clock);
    }

    private record IssuedOtp(
            String email,
            String rawOtp,
            Long expiresInSeconds,
            Long tokenId
    ) {
    }
}
