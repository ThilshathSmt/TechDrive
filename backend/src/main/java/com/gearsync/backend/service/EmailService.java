package com.gearsync.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.name}")
    private String appName;

    @Value("${app.url}")
    private String appUrl;


    public void sendEmployeeWelcomeEmail(String toEmail, String employeeName, String tempPassword, String role) {
        try {
            String subject = "Welcome to " + appName + " - Your Account Details";
            String htmlContent = buildWelcomeEmailHtml(employeeName, toEmail, tempPassword,role);
            sendHtmlEmail(toEmail, subject, htmlContent);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send welcome email", e);
        }
    }

    public void sendCustomerWelcomeEmail(String toEmail, String customerName) {
        try {
            String subject = "Welcome to " + appName + " - Your Account is Ready!";
            String htmlContent = buildWelcomeEmailHtmlforCustomer(customerName, toEmail);
            sendHtmlEmail(toEmail, subject, htmlContent);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send welcome email", e);
        }
    }

    public void sendCustomerAppointmentConfirmation(String toEmail, String vehicleRegistrationNumber,
                                                    String customerName, LocalDateTime timeDate, BigDecimal finalCost) {
        try {
            String subject = "Appointment Confirmation - " + appName;
            String htmlContent = buildAppointmentConfirmationHtml(toEmail, vehicleRegistrationNumber, customerName, timeDate, finalCost);
            sendHtmlEmail(toEmail, subject, htmlContent);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send appointment confirmation email", e);
        }
    }

    private String buildAppointmentConfirmationHtml(String toEmail, String vehicleRegistrationNumber,
                                                    String customerName, LocalDateTime timeDate, BigDecimal finalCost) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm a");

        return String.format("""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .container {
                background: #ffffff;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #00b09b 0%%, #96c93d 100%%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 26px;
            }
            .content {
                padding: 30px;
            }
            .details-box {
                background: #f8f9fa;
                border-left: 4px solid #00b09b;
                padding: 20px;
                margin: 20px 0;
                border-radius: 5px;
            }
            .detail-item {
                margin: 10px 0;
            }
            .detail-label {
                font-weight: bold;
                color: #00b09b;
                display: inline-block;
                width: 180px;
            }
            .detail-value {
                background: white;
                padding: 8px 15px;
                border-radius: 4px;
                display: inline-block;
                border: 1px solid #dee2e6;
            }
            .btn {
                display: inline-block;
                padding: 12px 30px;
                background: linear-gradient(135deg, #00b09b 0%%, #96c93d 100%%);
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 25px 0;
                font-weight: bold;
            }
            .footer {
                background: #f8f9fa;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #6c757d;
            }
            .note-box {
                background: #e7f3ff;
                padding: 15px;
                border-radius: 5px;
                border-left: 4px solid #007bff;
                margin-top: 25px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Appointment Confirmed</h1>
                <p>Thank you for choosing %s!</p>
            </div>

            <div class="content">
                <h2>Hello %s, 👋</h2>
                <p>We’re happy to confirm your vehicle service appointment.</p>

                <div class="details-box">
                    <div class="detail-item">
                        <span class="detail-label">📅 Appointment Date:</span>
                        <span class="detail-value">%s</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">🚗 Vehicle Reg. No:</span>
                        <span class="detail-value">%s</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">💰 Estimated Cost:</span>
                        <span class="detail-value">LKR %s</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">📧 Registered Email:</span>
                        <span class="detail-value">%s</span>
                    </div>
                </div>

                <div class="note-box">
                    <strong>🔔 Please Note:</strong>
                    <p>Arrive 10–15 minutes before your scheduled time. If you wish to reschedule, contact our support team at least 24 hours in advance.</p>
                </div>

                <center>
                    <a href="%s/appointments" class="btn">View Appointment Details</a>
                </center>

                <p style="margin-top: 30px; font-size: 14px; color: #6c757d;">
                    We look forward to serving you and keeping your vehicle in top condition.
                </p>
            </div>

            <div class="footer">
                <p>This email was sent by %s</p>
                <p>If you didn’t book this appointment, please contact us immediately.</p>
                <p style="margin-top: 15px; color: #999;">
                    © %d %s. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    """, appName, customerName, formatter.format(timeDate), vehicleRegistrationNumber,
                finalCost.toPlainString(), toEmail, appUrl, appName, LocalDateTime.now().getYear(), appName);
    }



    public void sendPasswordResetOTP(String toEmail, String userName, String otp) {
        try {
            String subject = "Password Reset OTP - " + appName;
            String htmlContent = buildPasswordResetOtpHtml(userName, otp);
            sendHtmlEmail(toEmail, subject, htmlContent);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    public void sendPasswordChangedConfirmation(String toEmail, String userName) {
        try {
            String subject = "Password Changed Successfully - " + appName;
            String htmlContent = buildPasswordChangedHtml(userName);
            sendHtmlEmail(toEmail, subject, htmlContent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    private String buildWelcomeEmailHtml(String employeeName, String email, String tempPassword,String role) {
        return String.format("""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .container {
                    background: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                }
                .content {
                    padding: 30px;
                }
                .credentials-box {
                    background: #f8f9fa;
                    border-left: 4px solid #667eea;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 5px;
                }
                .credential-item {
                    margin: 10px 0;
                }
                .credential-label {
                    font-weight: bold;
                    color: #667eea;
                    display: inline-block;
                    width: 150px;
                }
                .credential-value {
                    background: white;
                    padding: 8px 15px;
                    border-radius: 4px;
                    display: inline-block;
                    font-family: 'Courier New', monospace;
                    border: 1px solid #dee2e6;
                }
                .warning-box {
                    background: #fff3cd;
                    border-left: 4px solid #ffc107;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 5px;
                }
                .btn {
                    display: inline-block;
                    padding: 12px 30px;
                    background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                    font-weight: bold;
                }
                .footer {
                    background: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #6c757d;
                }
                .steps {
                    background: #e7f3ff;
                    padding: 20px;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .step {
                    margin: 10px 0;
                    padding-left: 30px;
                    position: relative;
                }
                .step:before {
                    content: "→";
                    position: absolute;
                    left: 0;
                    color: #667eea;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚗 Welcome to %s</h1>
                    <p style="margin: 10px 0 0 0;">Your %s Account Has Been Created</p>
                </div>
                
                <div class="content">
                    <h2>Hello %s! 👋</h2>
                    <p>Your %s account has been successfully created. Welcome to the team!</p>
                    
                    <div class="credentials-box">
                        <h3 style="margin-top: 0; color: #667eea;">🔐 Your Login Credentials</h3>
                        <div class="credential-item">
                            <span class="credential-label">Email:</span>
                            <span class="credential-value">%s</span>
                        </div>
                        <div class="credential-item">
                            <span class="credential-label">Temporary Password:</span>
                            <span class="credential-value">%s</span>
                        </div>
                    </div>
                    
                    <div class="warning-box">
                        <strong>⚠️ Important Security Notice:</strong>
                        <p style="margin: 5px 0 0 0;">This is a temporary password. You will be required to change it upon your first login for security purposes.</p>
                    </div>
                    
                    <div class="steps">
                        <h3 style="margin-top: 0; color: #667eea;">📋 Next Steps:</h3>
                        <div class="step">Click the login button below</div>
                        <div class="step">Enter your email and temporary password</div>
                        <div class="step">Create a strong new password</div>
                        <div class="step">Start managing your assignments!</div>
                    </div>
                    
                    <center>
                        <a href="%s/login" class="btn">Login to Your Account</a>
                    </center>
                    
                    <p style="margin-top: 30px; font-size: 14px; color: #6c757d;">
                        <strong>Password Requirements:</strong><br>
                        • Minimum 8 characters<br>
                        • At least 1 uppercase letter<br>
                        • At least 1 number<br>
                        • At least 1 special character
                    </p>
                </div>
                
                <div class="footer">
                    <p>This email was sent by %s</p>
                    <p>If you did not expect this email, please contact your administrator immediately.</p>
                    <p style="margin-top: 15px; color: #999;">
                        © %d %s. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """, appName,role, employeeName, role, email, tempPassword, appUrl, appName, LocalDateTime.now().getYear(), appName);
    }


    private String buildPasswordResetOtpHtml(String userName, String otp) {
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .container {
                    background: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #f093fb 0%%, #f5576c 100%%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                }
                .content {
                    padding: 30px;
                }
                .otp-box {
                    background: #f8f9fa;
                    border: 3px dashed #f5576c;
                    padding: 30px;
                    margin: 30px 0;
                    text-align: center;
                    border-radius: 10px;
                }
                .otp-code {
                    font-size: 48px;
                    font-weight: bold;
                    color: #f5576c;
                    letter-spacing: 10px;
                    font-family: 'Courier New', monospace;
                    margin: 20px 0;
                }
                .warning-box {
                    background: #fff3cd;
                    border-left: 4px solid #ffc107;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 5px;
                }
                .security-note {
                    background: #e7f3ff;
                    border-left: 4px solid #0066cc;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 5px;
                }
                .footer {
                    background: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #6c757d;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Password Reset Request</h1>
                    <p style="margin: 10px 0 0 0;">One-Time Password (OTP)</p>
                </div>
                
                <div class="content">
                    <h2>Hello %s,</h2>
                    <p>We received a request to reset your password. Use the OTP below to proceed:</p>
                    
                    <div class="otp-box">
                        <p style="margin: 0; font-size: 14px; color: #6c757d;">Your OTP Code</p>
                        <div class="otp-code">%s</div>
                        <p style="margin: 0; font-size: 14px; color: #6c757d;">Valid for 10 minutes</p>
                    </div>
                    
                    <div class="warning-box">
                        <strong>⏰ Time Sensitive:</strong>
                        <p style="margin: 5px 0 0 0;">This OTP will expire in <strong>10 minutes</strong>. Please use it soon!</p>
                    </div>
                    
                    <div class="security-note">
                        <strong>🛡️ Security Tips:</strong>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Never share this OTP with anyone</li>
                            <li>We will never ask for your OTP via phone or email</li>
                            <li>If you didn't request this, please ignore this email</li>
                        </ul>
                    </div>
                    
                    <p style="margin-top: 30px; font-size: 14px; color: #6c757d;">
                        If you didn't request a password reset, your account is still secure. You can safely ignore this email.
                    </p>
                </div>
                
                <div class="footer">
                    <p>This email was sent by %s</p>
                    <p>For security reasons, this OTP can only be used once.</p>
                    <p style="margin-top: 15px; color: #999;">
                        © %d %s. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """.formatted(
                userName,
                otp,
                appName,
                LocalDateTime.now().getYear(),
                appName
        );
    }


    private String buildPasswordChangedHtml(String userName) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' hh:mm a"));
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .container {
                    background: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #11998e 0%%, #38ef7d 100%%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                }
                .content {
                    padding: 30px;
                }
                .success-box {
                    background: #d4edda;
                    border-left: 4px solid #28a745;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 5px;
                }
                .info-box {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .warning-box {
                    background: #fff3cd;
                    border-left: 4px solid #ffc107;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 5px;
                }
                .footer {
                    background: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #6c757d;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Password Changed Successfully</h1>
                    <p style="margin: 10px 0 0 0;">Your Account is Secure</p>
                </div>
                
                <div class="content">
                    <h2>Hello %s,</h2>
                    
                    <div class="success-box">
                        <strong>✓ Password Updated</strong>
                        <p style="margin: 5px 0 0 0;">Your password has been successfully changed.</p>
                    </div>
                    
                    <div class="info-box">
                        <h3 style="margin-top: 0; color: #28a745;">📋 Change Details</h3>
                        <p style="margin: 5px 0;"><strong>Date:</strong> %s</p>
                        <p style="margin: 5px 0;"><strong>Action:</strong> Password Change</p>
                        <p style="margin: 5px 0;"><strong>Status:</strong> Successful</p>
                    </div>
                    
                    <div class="warning-box">
                        <strong>⚠️ Didn't Make This Change?</strong>
                        <p style="margin: 5px 0 0 0;">If you didn't change your password, please contact your administrator immediately. Your account may be compromised.</p>
                    </div>
                    
                    <p style="margin-top: 30px; font-size: 14px; color: #6c757d;">
                        <strong>Security Reminders:</strong><br>
                        • Use a unique password for this account<br>
                        • Never share your password with anyone<br>
                        • Change your password regularly<br>
                        • Enable two-factor authentication if available
                    </p>
                </div>
                
                <div class="footer">
                    <p>This is an automated security notification from %s</p>
                    <p>For your security, we always notify you of important account changes.</p>
                    <p style="margin-top: 15px; color: #999;">
                        © %d %s. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """.formatted(
                userName,
                timestamp,
                appName,
                LocalDateTime.now().getYear(),
                appName
        );
    }

    private String buildWelcomeEmailHtmlforCustomer(String customerName, String email) {
        return String.format("""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .container {
                    background: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                }
                .content {
                    padding: 30px;
                }
                .welcome-box {
                    background: #f8f9fa;
                    border-left: 4px solid #667eea;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 5px;
                }
                .info-item {
                    margin: 10px 0;
                }
                .info-label {
                    font-weight: bold;
                    color: #667eea;
                    display: inline-block;
                    width: 100px;
                }
                .btn {
                    display: inline-block;
                    padding: 12px 30px;
                    background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                    font-weight: bold;
                }
                .footer {
                    background: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #6c757d;
                }
                .features {
                    background: #e7f3ff;
                    padding: 20px;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .feature {
                    margin: 10px 0;
                    padding-left: 30px;
                    position: relative;
                }
                .feature:before {
                    content: "✓";
                    position: absolute;
                    left: 0;
                    color: #667eea;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚗 Welcome to %s</h1>
                    <p style="margin: 10px 0 0 0;">Your Customer Account is Ready!</p>
                </div>
                
                <div class="content">
                    <h2>Hello %s! 👋</h2>
                    <p>Your customer account has been successfully created. We're excited to have you on board!</p>
                    
                    <div class="welcome-box">
                        <h3 style="margin-top: 0; color: #667eea;">📧 Your Account Information</h3>
                        <div class="info-item">
                            <span class="info-label">Email:</span>
                            <span>%s</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Status:</span>
                            <span>Active ✅</span>
                        </div>
                    </div>
                    
                    <div class="features">
                        <h3 style="margin-top: 0; color: #667eea;">🌟 What You Can Do:</h3>
                        <div class="feature">Book vehicle service appointments online</div>
                        <div class="feature">Track your service history</div>
                        <div class="feature">Receive service status updates</div>
                        <div class="feature">View and download service invoices</div>
                        <div class="feature">Manage your vehicle information</div>
                    </div>
                    
                    <center>
                        <a href="%s/login" class="btn">Login to Your Account</a>
                    </center>
                    
                    <p style="margin-top: 30px; font-size: 14px; color: #6c757d;">
                        <strong>Need help?</strong><br>
                        Contact our support team at support@%s or call us at [Phone Number]
                    </p>
                </div>
                
                <div class="footer">
                    <p>This email was sent by %s</p>
                    <p>If you did not expect this email, please contact our support team immediately.</p>
                    <p style="margin-top: 15px; color: #999;">
                        © %d %s. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """, appName, customerName, email, appUrl, appName, appName, LocalDateTime.now().getYear(), appName);
    }
}