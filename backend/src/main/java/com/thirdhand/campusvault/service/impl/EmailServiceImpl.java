package com.thirdhand.campusvault.service.impl;

import com.thirdhand.campusvault.exception.EmailDeliveryException;
import com.thirdhand.campusvault.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendOtpEmail(String toEmail, String otpCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Your CampusVault OTP Code");
            helper.setText(buildHtmlBody(otpCode), true);

            mailSender.send(message);
        } catch (MailException e) {
            throw new EmailDeliveryException("Failed to send OTP email. Please try again later.", e);
        } catch (Exception e) {
            throw new EmailDeliveryException("Unexpected error while sending OTP email. Please try again later.", e);
        }
    }

    private String buildHtmlBody(String otpCode) {
        return """
                <html>
                  <body style="font-family: Arial, sans-serif; background:#f6f8fb; padding:24px;">
                    <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:12px; padding:24px; border:1px solid #e5e7eb;">
                      <h2 style="margin:0 0 16px 0; color:#111827;">ResourceX OTP Verification</h2>
                      <p style="font-size:16px; color:#374151; line-height:1.6;">
                        Use the OTP below to verify your email address.
                      </p>
                      <div style="margin:24px 0; text-align:center;">
                        <div style="display:inline-block; background:#111827; color:#ffffff; letter-spacing:6px; font-size:28px; font-weight:bold; padding:14px 24px; border-radius:10px;">
                          %s
                        </div>
                      </div>
                      <p style="font-size:14px; color:#6b7280; line-height:1.6;">
                        This code will expire soon. If you did not request this, you can safely ignore this email.
                      </p>
                    </div>
                  </body>
                </html>
                """.formatted(otpCode);
    }
}
