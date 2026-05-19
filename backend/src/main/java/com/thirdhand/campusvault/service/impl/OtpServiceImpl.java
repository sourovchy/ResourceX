package com.thirdhand.campusvault.service.impl;

import com.thirdhand.campusvault.dto.request.OtpRequest;
import com.thirdhand.campusvault.dto.request.OtpVerifyRequest;
import com.thirdhand.campusvault.entity.OtpStatus;
import com.thirdhand.campusvault.entity.OtpToken;
import com.thirdhand.campusvault.repository.OtpRepository;
import com.thirdhand.campusvault.repository.UserRepository;
import com.thirdhand.campusvault.service.EmailService;
import com.thirdhand.campusvault.service.OtpService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class OtpServiceImpl implements OtpService {

    private static final int OTP_LENGTH = 6;
    private static final int MAX_ATTEMPTS = 5;
    private static final long OTP_TTL_MINUTES = 3;
    private static final long RESEND_COOLDOWN_SECONDS = 60;

    private final OtpRepository otpRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public OtpServiceImpl(OtpRepository otpRepository,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          EmailService emailService) {
        this.otpRepository = otpRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public void requestOtp(OtpRequest request) {
        try {
            String email = normalizeEmail(request.email());
            Instant now = Instant.now();

            if (!userRepository.existsByEmailIgnoreCase(email)) {
                throw new IllegalArgumentException("Invalid email");
            }

            List<OtpToken> activeTokens = otpRepository.findActiveForUpdate(email, OtpStatus.ACTIVE, now);

            if (!activeTokens.isEmpty()) {
                OtpToken latest = activeTokens.get(0);

                if (latest.getLastSentAt() != null &&
                        latest.getLastSentAt().plusSeconds(RESEND_COOLDOWN_SECONDS).isAfter(now)) {
                    throw new IllegalStateException("Please wait before requesting another OTP");
                }

                latest.setStatus(OtpStatus.EXPIRED);
                otpRepository.save(latest);
            }

            String rawOtp = generateOtp();
            String hashedOtp = passwordEncoder.encode(rawOtp);

            OtpToken token = new OtpToken(
                    email,
                    hashedOtp,
                    OtpStatus.ACTIVE,
                    now,
                    now.plus(OTP_TTL_MINUTES, ChronoUnit.MINUTES)
            );

            otpRepository.save(token);
            emailService.sendOtpEmail(email, rawOtp);

        } catch (IllegalArgumentException | IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate OTP", e);
        }
    }

    @Override
    @Transactional
    public void verifyOtp(OtpVerifyRequest request) {
        try {
            String email = normalizeEmail(request.email());
            String inputOtp = request.otp();
            Instant now = Instant.now();

            if (inputOtp == null || !inputOtp.matches("\\d{6}")) {
                throw new IllegalArgumentException("OTP must be 6 digits");
            }

            List<OtpToken> activeTokens = otpRepository.findActiveForUpdate(email, OtpStatus.ACTIVE, now);

            if (activeTokens.isEmpty()) {
                throw new IllegalStateException("OTP expired or not found");
            }

            OtpToken token = activeTokens.get(0);

            if (token.getAttemptCount() >= MAX_ATTEMPTS) {
                token.setStatus(OtpStatus.LOCKED);
                otpRepository.save(token);
                throw new IllegalStateException("OTP locked due to too many attempts");
            }

            if (!passwordEncoder.matches(inputOtp, token.getOtpHash())) {
                token.setAttemptCount(token.getAttemptCount() + 1);

                if (token.getAttemptCount() >= MAX_ATTEMPTS) {
                    token.setStatus(OtpStatus.LOCKED);
                }

                otpRepository.save(token);
                throw new IllegalArgumentException("Invalid OTP");
            }

            token.setStatus(OtpStatus.USED);
            token.setVerifiedAt(now);
            token.setUsedAt(now);
            otpRepository.save(token);

            // Mark user as email-verified
            userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
                user.setVerified(true);
                userRepository.save(user);
            });

        } catch (IllegalArgumentException | IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to verify OTP", e);
        }
    }

    private String generateOtp() {
        int min = (int) Math.pow(10, OTP_LENGTH - 1);
        int max = (int) Math.pow(10, OTP_LENGTH) - 1;
        int code = min + secureRandom.nextInt(max - min + 1);
        return String.valueOf(code);
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        return email.trim().toLowerCase();
    }
}