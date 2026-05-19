package com.thirdhand.campusvault.service.impl;

import com.thirdhand.campusvault.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        
        if (fromEmail != null && !fromEmail.isEmpty()) {
            message.setFrom(fromEmail);
        }
        
        message.setTo(to);
        message.setSubject("ResourseX - Your OTP Code");
        message.setText("Your OTP is: " + otp + "\n\nThis code will expire in 3 minutes.");
        
        mailSender.send(message);
    }
}