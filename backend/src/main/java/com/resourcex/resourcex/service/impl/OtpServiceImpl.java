package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.OtpRequest;
import com.resourcex.resourcex.dto.request.OtpVerifyRequest;
import com.resourcex.resourcex.dto.response.OtpResponse;
import com.resourcex.resourcex.entity.OtpToken;
import com.resourcex.resourcex.entity.TokenPurpose;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserStatus;
import com.resourcex.resourcex.entity.StudentProfile;
import com.resourcex.resourcex.exception.ConflictException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.exception.UnauthorizedException;
import com.resourcex.resourcex.repository.OtpRepository;
import com.resourcex.resourcex.repository.StudentProfileRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.EmailService;
import com.resourcex.resourcex.service.OtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpServiceImpl implements OtpService {

    private static final int OTP_LENGTH = 6;
    private static final long OTP_TTL_MINUTES = 3;
    private static final long RESEND_COOLDOWN_SECONDS = 300;
    private static final int MAX_OTP_REQUESTS_PER_DAY = 3;
    private static final long RETAIN_FINISHED_TOKENS_HOURS = 24;

    private final OtpRepository otpRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final TransactionTemplate transactionTemplate;

    private final SecureRandom secureRandom = new SecureRandom();
    private final Clock clock = Clock.systemUTC();

    @Override
    public OtpResponse sendOtp(OtpRequest request, TokenPurpose purpose) {
        return issueOtp(request.email(), purpose, "OTP sent successfully");
    }

    @Override
    public OtpResponse resendOtp(OtpRequest request, TokenPurpose purpose) {
        return issueOtp(request.email(), purpose, "OTP resent successfully");
    }

    @Override
    @Transactional
    public OtpResponse verifyOtp(OtpVerifyRequest request, TokenPurpose purpose) {
        String email = normalizeEmail(request.email());
        String inputOtp = normalizeOtp(request.otp());
        Instant now = now();

        OtpToken token = findLatestPendingTokenForUpdate(email, purpose)
                .orElseThrow(() -> new UnauthorizedException("OTP expired or not found"));

        if (isExpired(token, now)) {
            throw new UnauthorizedException("OTP expired or not found");
        }

        if (!passwordEncoder.matches(inputOtp, token.getOtpHash())) {
            throw new UnauthorizedException("Invalid OTP");
        }

        token.setUsedAt(now);
        otpRepository.save(token);

        if (purpose == TokenPurpose.EMAIL_VERIFICATION) {
            User user = userRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            StudentProfile profile = studentProfileRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
            
            profile.setEmailVerified(true);
            studentProfileRepository.save(profile);
        } else if (purpose == TokenPurpose.PASSWORD_RESET) {
            userRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }

        log.info("OTP verified successfully for email: {}, resend attempts used: {}/{}",
                email, token.getResendCount(), MAX_OTP_REQUESTS_PER_DAY);

        return OtpResponse.builder()
                .success(true)
                .message("OTP verified successfully")
                .email(email)
                .expiresInSeconds(0L)
                .attemptsRemaining(MAX_OTP_REQUESTS_PER_DAY - token.getResendCount())
                .build();
    }

    private OtpResponse issueOtp(String rawEmail, TokenPurpose purpose, String successMessage) {
        String email = normalizeEmail(rawEmail);

        // Validate user can request OTP
        validateOtpRequest(email, purpose);

        IssuedOtp issuedOtp = transactionTemplate.execute(status -> createOrUpdateOtp(email, purpose));

        try {
            log.info("Sending OTP to email: {} for purpose: {}", email, purpose);
            if (purpose == TokenPurpose.PASSWORD_RESET) {
                emailService.sendPasswordResetEmail(issuedOtp.email(), issuedOtp.rawOtp());
            } else {
                emailService.sendOtpEmail(issuedOtp.email(), issuedOtp.rawOtp());
            }
            log.info("OTP successfully sent to: {}", email);
        } catch (RuntimeException ex) {
            log.error("OTP email send failed for: {}, rolling back token creation", email, ex);
            cancelIssuedOtp(issuedOtp.tokenId());
            throw ex;
        }

        return OtpResponse.builder()
                .success(true)
                .message(successMessage)
                .email(issuedOtp.email())
                .expiresInSeconds(issuedOtp.expiresInSeconds())
                .attemptsRemaining(MAX_OTP_REQUESTS_PER_DAY - issuedOtp.resendCount())
                .build();
    }

    private void validateOtpRequest(String email, TokenPurpose purpose) {
        Instant now = now();

        // Check 24-hour daily limit using last_sent_at proxying for creation time
        long dailyRequestCount = otpRepository.countByEmailAndTokenPurposeAndLastSentAtAfter(
                email,
                purpose,
                now.minus(24, ChronoUnit.HOURS));

        if (dailyRequestCount >= MAX_OTP_REQUESTS_PER_DAY) {
            log.warn("Daily OTP request limit exceeded for email: {}", email);
            throw new UnauthorizedException(
                    "Maximum " + MAX_OTP_REQUESTS_PER_DAY + " OTP requests allowed per day. Try again tomorrow.");
        }
    }

    private IssuedOtp createOrUpdateOtp(String email, TokenPurpose purpose) {
        Instant now = now();

        if (purpose == TokenPurpose.EMAIL_VERIFICATION) {
            User user = userRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Please register first"));

            StudentProfile profile = studentProfileRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Please register first"));

            if (user.getStatus() == UserStatus.DELETED && profile.getRejectionReason() != null) {
                throw new UnauthorizedException("Registration was rejected");
            }

            if (profile.getEmailVerified()) {
                throw new ConflictException("Email is already verified");
            }
        } else if (purpose == TokenPurpose.PASSWORD_RESET) {
            if (!userRepository.existsByEmailIgnoreCase(email)) {
                throw new ResourceNotFoundException("User not found");
            }
        }

        Optional<OtpToken> existingPendingOtp = findLatestPendingTokenForUpdate(email, purpose);

        if (existingPendingOtp.isPresent()) {
            OtpToken existing = existingPendingOtp.get();

            if (existing.getLastSentAt() != null &&
                    existing.getLastSentAt().plusSeconds(RESEND_COOLDOWN_SECONDS).isAfter(now)) {
                long secondsRemaining = ChronoUnit.SECONDS.between(
                        now,
                        existing.getLastSentAt().plusSeconds(RESEND_COOLDOWN_SECONDS));
                log.warn("Resend cooldown active for email: {}, seconds remaining: {}", email, secondsRemaining);
                throw new UnauthorizedException(
                        "Please wait " + secondsRemaining + " seconds before requesting another OTP");
            }

            if (existing.getResendCount() >= MAX_OTP_REQUESTS_PER_DAY) {
                log.warn("Resend attempt limit exceeded for email: {}", email);
                throw new UnauthorizedException(
                        "Maximum resend attempts (" + MAX_OTP_REQUESTS_PER_DAY + ") exceeded. Try again later.");
            }

            String rawOtp = generateOtp();
            String hashedOtp = passwordEncoder.encode(rawOtp);

            existing.setOtpHash(hashedOtp);
            existing.setResendCount(existing.getResendCount() + 1);
            existing.setLastSentAt(now);
            existing.setExpiresAt(now.plus(OTP_TTL_MINUTES, ChronoUnit.MINUTES));

            OtpToken updatedToken = otpRepository.save(existing);

            log.info("OTP resent for email: {}, resend count: {}", email, updatedToken.getResendCount());

            return new IssuedOtp(
                    email,
                    rawOtp,
                    OTP_TTL_MINUTES * 60,
                    updatedToken.getId(),
                    updatedToken.getResendCount());
        }

        String rawOtp = generateOtp();
        String hashedOtp = passwordEncoder.encode(rawOtp);

        OtpToken token = OtpToken.builder()
                .email(email)
                .tokenPurpose(purpose)
                .otpHash(hashedOtp)
                .resendCount(0)
                .expiresAt(now.plus(OTP_TTL_MINUTES, ChronoUnit.MINUTES))
                .lastSentAt(now)
                .build();

        OtpToken savedToken = otpRepository.save(token);

        log.info("New OTP created for email: {}", email);

        return new IssuedOtp(
                email,
                rawOtp,
                OTP_TTL_MINUTES * 60,
                savedToken.getId(),
                0);
    }

    @Scheduled(fixedDelayString = "${app.otp.cleanup.fixed-delay-ms:3600000}")
    @Transactional
    public void cleanupOtpTokens() {
        Instant now = now();
        Instant threshold = now.minus(RETAIN_FINISHED_TOKENS_HOURS, ChronoUnit.HOURS);
        otpRepository.deleteExpiredBefore(threshold);
    }

    private Optional<OtpToken> findLatestPendingTokenForUpdate(String email, TokenPurpose purpose) {
        return otpRepository.findUnusedTokenForUpdate(email, purpose).stream()
                .filter(t -> !isExpired(t, now()))
                .findFirst();
    }

    private boolean isExpired(OtpToken token, Instant now) {
        return token.getExpiresAt() == null || !token.getExpiresAt().isAfter(now);
    }

    private void cancelIssuedOtp(Long tokenId) {
        transactionTemplate.executeWithoutResult(status -> otpRepository.deleteById(tokenId));
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
            Long tokenId,
            int resendCount) {
    }
}
