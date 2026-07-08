package com.resourcex.resourcex.service;

public interface EmailService {

    void sendOtpEmail(String toEmail, String otpCode);
    void sendPasswordResetEmail(String toEmail, String resetToken);

    /**
     * Generic transactional notice email (used by the Trust Score system for
     * warnings, restrictions and suspensions). Implementations must not throw —
     * delivery failures are logged so they never roll back the caller's tx.
     */
    void sendTrustNotificationEmail(String toEmail, String subject, String heading, String message);
}