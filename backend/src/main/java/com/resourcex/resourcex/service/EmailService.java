package com.resourcex.resourcex.service;

public interface EmailService {

    void sendOtpEmail(String toEmail, String otpCode);
    void sendPasswordResetEmail(String toEmail, String resetToken);
}