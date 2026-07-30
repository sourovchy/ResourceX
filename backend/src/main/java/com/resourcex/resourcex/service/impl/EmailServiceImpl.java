package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.exception.EmailDeliveryException;
import com.resourcex.resourcex.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

  private final JavaMailSender mailSender;

  @Value("${spring.mail.username}")
  private String fromEmail;

  @Value("${app.frontend-url}")
  private String frontendUrl;

  @Override
  public void sendOtpEmail(String toEmail, String otpCode) {
    validateInputs(toEmail, otpCode);

    if (fromEmail == null || fromEmail.isBlank()) {
      log.error("OTP email sender is not configured");
      throw new EmailDeliveryException("OTP email sender is not configured. Please contact support.");
    }

    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setFrom(fromEmail);
      helper.setTo(toEmail.trim().toLowerCase());
      helper.setSubject("Your ResourceX OTP Code");
      helper.setText(buildHtmlBody(otpCode), true);

      mailSender.send(message);

    } catch (MailException ex) {
      log.error("Failed to send OTP email to {}: {}", toEmail, ex.getMessage(), ex);
      throw new EmailDeliveryException(
          "Failed to send OTP email. Please try again later.",
          ex);

    } catch (Exception ex) {
      log.error("Unexpected error sending OTP email to {}: {}", toEmail, ex.getMessage(), ex);
      throw new EmailDeliveryException(
          "Unexpected error while sending OTP email.",
          ex);
    }
  }

  @Override
  public void sendTrustNotificationEmail(String toEmail, String subject, String heading, String message) {
    // Best-effort delivery — never propagate so a mail outage can't roll back a score change.
    if (toEmail == null || toEmail.isBlank() || fromEmail == null || fromEmail.isBlank()) {
      log.warn("Skipping trust email — recipient or sender not configured");
      return;
    }

    try {
      MimeMessage mimeMessage = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

      helper.setFrom(fromEmail);
      helper.setTo(toEmail.trim().toLowerCase());
      helper.setSubject(subject);
      helper.setText(buildTrustHtmlBody(heading, message), true);

      mailSender.send(mimeMessage);
    } catch (Exception ex) {
      log.error("Failed to send trust notification email to {}: {}", toEmail, ex.getMessage(), ex);
    }
  }

  private String buildTrustHtmlBody(String heading, String message) {
    String template = """
        <html>
        <body style="margin:0;padding:40px 20px;background-color:#faf9f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e5de;">
            <div style="height:6px;background:linear-gradient(90deg,#da7756 0%%,#f09970 100%%);"></div>
            <div style="padding:40px 32px;">
              <div style="margin-bottom:24px;text-align:center;">
                <span style="font-size:20px;font-weight:800;color:#1a1816;letter-spacing:0.5px;">
                  Resource<span style="color:#da7756;">X</span>
                </span>
              </div>
              <h2 style="margin:0 0 16px 0;color:#1a1816;font-size:20px;font-weight:700;text-align:center;">
                {{HEADING}}
              </h2>
              <p style="margin:0 0 24px 0;font-size:15px;color:#5c5851;line-height:1.6;">
                {{MESSAGE}}
              </p>
              <hr style="border:0;height:1px;background:#e8e5de;margin-bottom:24px;">
              <p style="margin:0;font-size:12px;color:#9c9890;text-align:center;line-height:1.5;">
                &copy; 2026 ResourceX Inc. All rights reserved.<br>
                This is an automated Trust &amp; Safety notification. Please do not reply.
              </p>
            </div>
          </div>
        </body>
        </html>
        """;

    return template
        .replace("{{HEADING}}", escapeHtml(heading))
        .replace("{{MESSAGE}}", escapeHtml(message));
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
    String safeOtp = escapeHtml(otpCode);

    String template = """
        <html>
        <body style="margin:0;padding:40px 20px;background-color:#faf9f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

          <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e5de;">

            <div style="height:6px;background:linear-gradient(90deg,#da7756 0%%,#f09970 100%%);"></div>

            <div style="padding:40px 32px;">

              <div style="margin-bottom:32px;text-align:center;">
                <span style="font-size:20px;font-weight:800;color:#1a1816;letter-spacing:0.5px;">
                  Resource<span style="color:#da7756;">X</span>
                </span>
              </div>

              <h2 style="margin:0 0 12px 0;color:#1a1816;font-size:22px;font-weight:700;text-align:center;">
                Verification Code
              </h2>

              <p style="margin:0 0 32px 0;font-size:15px;color:#5c5851;line-height:1.6;text-align:center;">
                Please use the one-time password (OTP) below to verify your email address securely.
              </p>

              <div style="margin:32px 0;text-align:center;">
                <div style="display:inline-block;background:#f3f1ec;border:1px solid #e8e5de;color:#da7756;letter-spacing:8px;font-size:36px;font-weight:800;padding:16px 32px;border-radius:12px;font-family:'Courier New',Courier,monospace;">
                  {{OTP}}
                </div>
              </div>

              <div style="background:rgba(218,119,86,0.05);border-left:3px solid #da7756;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:32px;">
                <p style="margin:0;font-size:13px;color:#5c5851;line-height:1.5;">
                  <strong>Security Note:</strong>
                  This OTP expires in 3 minutes.
                  If you did not request this code, you may safely ignore this email.
                </p>
              </div>

              <hr style="border:0;height:1px;background:#e8e5de;margin-bottom:24px;">

              <p style="margin:0;font-size:12px;color:#9c9890;text-align:center;line-height:1.5;">
                &copy; 2026 ResourceX Inc. All rights reserved.<br>
                This is an automated security notification. Please do not reply.
              </p>

            </div>
          </div>

        </body>
        </html>
        """;

    return template.replace("{{OTP}}", safeOtp);
  }

  private String escapeHtml(String value) {
    if (value == null) {
      return "";
    }

    return value
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;")
        .replace("'", "&#39;");
  }

  @Override
  public void sendPasswordResetEmail(String toEmail, String resetToken) {
    if (toEmail == null || toEmail.isBlank()) {
      throw new EmailDeliveryException("Recipient email is required");
    }

    if (resetToken == null || resetToken.isBlank()) {
      throw new EmailDeliveryException("Reset token is required");
    }

    if (fromEmail == null || fromEmail.isBlank()) {
      log.error("Email sender is not configured");
      throw new EmailDeliveryException("Email sender is not configured. Please contact support.");
    }

    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setFrom(fromEmail);
      helper.setTo(toEmail.trim().toLowerCase());
      helper.setSubject("Reset your ResourceX Password");

      String baseUrl = frontendUrl != null ? frontendUrl.replaceAll("/+$", "") : "http://localhost:3000";
      String resetLink = baseUrl + "/auth/reset-password?token=" + resetToken;

      String template = """
          <html>
          <body style="margin:0;padding:40px 20px;background-color:#faf9f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
            <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e5de;">
              <div style="height:6px;background:linear-gradient(90deg,#da7756 0%%,#f09970 100%%);"></div>
              <div style="padding:40px 32px;">
                <div style="margin-bottom:32px;text-align:center;">
                  <span style="font-size:20px;font-weight:800;color:#1a1816;letter-spacing:0.5px;">
                    Resource<span style="color:#da7756;">X</span>
                  </span>
                </div>
                <h2 style="margin:0 0 12px 0;color:#1a1816;font-size:22px;font-weight:700;text-align:center;">
                  Reset Your Password
                </h2>
                <p style="margin:0 0 32px 0;font-size:15px;color:#5c5851;line-height:1.6;text-align:center;">
                  Click the button below to reset your password. This link will expire in 1 hour.
                </p>
                <div style="margin:32px 0;text-align:center;">
                  <a href="{{LINK}}" style="display:inline-block;background:#da7756;color:#ffffff;font-size:16px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;">
                    Reset Password
                  </a>
                </div>
                <hr style="border:0;height:1px;background:#e8e5de;margin-bottom:24px;">
                <p style="margin:0;font-size:12px;color:#9c9890;text-align:center;line-height:1.5;">
                  &copy; 2026 ResourceX Inc. All rights reserved.<br>
                  If you did not request a password reset, please ignore this email.
                </p>
              </div>
            </div>
          </body>
          </html>
          """;

      helper.setText(template.replace("{{LINK}}", resetLink), true);

      mailSender.send(message);

    } catch (MailException ex) {
      log.error("Failed to send password reset email to {}: {}", toEmail, ex.getMessage(), ex);
      throw new EmailDeliveryException(
          "Failed to send password reset email. Please try again later.",
          ex);

    } catch (Exception ex) {
      log.error("Unexpected error sending password reset email to {}: {}", toEmail, ex.getMessage(), ex);
      throw new EmailDeliveryException(
          "Unexpected error while sending password reset email.",
          ex);
    }
  }
}