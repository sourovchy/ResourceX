package com.thirdhand.campusvault.service;

public interface EmailService {
    void sendOtpEmail(String to, String otp);
}