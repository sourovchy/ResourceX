package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.exception.EmailDeliveryException;
import com.resourcex.resourcex.service.EmailService;
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

        validateInputs(toEmail, otpCode);

        try {
            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail.trim().toLowerCase());
            helper.setSubject("Your ResourceX OTP Code");

            helper.setText(buildHtmlBody(otpCode), true);

            mailSender.send(message);

        } catch (MailException ex) {

            throw new EmailDeliveryException(
                    "Failed to send OTP email. Please try again later.",
                    ex
            );

        } catch (Exception ex) {

            throw new EmailDeliveryException(
                    "Unexpected error while sending OTP email.",
                    ex
            );
        }
    }

    private void validateInputs(String toEmail, String otpCode) {

        if (toEmail == null || toEmail.isBlank()) {
            throw new EmailDeliveryException("Recipient email is required");
        }

        if (otpCode == null || otpCode.isBlank()) {
            throw new EmailDeliveryException("OTP code is required");
        }
    }

    private String buildHtmlBody(String otpCode) {

        return """
                <html>
                <body style="margin:0;padding:40px 20px;background-color:#0b0f19;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

                  <div style="max-width:480px;margin:0 auto;background:#111827;border-radius:16px;overflow:hidden;border:1px solid #1f2937;">

                    <div style="height:6px;background:linear-gradient(90deg,#3b82f6 0%,#8b5cf6 100%);"></div>

                    <div style="padding:40px 32px;">

                      <div style="margin-bottom:32px;text-align:center;">
                        <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">
                          Resource<span style="color:#3b82f6;">X</span>
                        </span>
                      </div>

                      <h2 style="margin:0 0 12px 0;color:#ffffff;font-size:22px;font-weight:700;text-align:center;">
                        Verification Code
                      </h2>

                      <p style="margin:0 0 32px 0;font-size:15px;color:#9ca3af;line-height:1.6;text-align:center;">
                        Please use the one-time password (OTP) below to verify your email address securely.
                      </p>

                      <div style="margin:32px 0;text-align:center;">
                        <div style="display:inline-block;background:#1f2937;border:1px solid #374151;color:#3b82f6;letter-spacing:8px;font-size:36px;font-weight:800;padding:16px 32px;border-radius:12px;font-family:'Courier New',Courier,monospace;">
                          %s
                        </div>
                      </div>

                      <div style="background:rgba(59,130,246,0.05);border-left:3px solid #3b82f6;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:32px;">
                        <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.5;">
                          <strong>Security Note:</strong>
                          This OTP expires in 5 minutes.
                          If you did not request this code, you may safely ignore this email.
                        </p>
                      </div>

                      <hr style="border:0;height:1px;background:#1f2937;margin-bottom:24px;">

                      <p style="margin:0;font-size:12px;color:#6b7280;text-align:center;line-height:1.5;">
                        &copy; 2026 ResourceX Inc. All rights reserved.<br>
                        This is an automated security notification. Please do not reply.
                      </p>

                    </div>
                  </div>

                </body>
                </html>
                """.formatted(otpCode);
    }
}