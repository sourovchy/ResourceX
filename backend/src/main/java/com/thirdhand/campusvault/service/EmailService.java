package com.thirdhand.campusvault.service;

public interface EmailService {

    void sendOtpEmail(String toEmail, String otpCode);
}