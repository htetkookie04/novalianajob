package com.jobportal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${spring.mail.properties.mail.from.name:Novaliana}")
    private String fromName;

    public void sendRegistrationEmail(String userName, String userEmail) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        try {
            helper.setFrom(fromEmail, fromName);
        } catch (UnsupportedEncodingException e) {
            helper.setFrom(fromEmail);
        }
        helper.setTo(userEmail);
        helper.setSubject("Welcome to Novaliana — Registration Successful");

        String htmlContent = buildRegistrationEmailContent(userName);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    public void sendCVUploadEmail(String userName, String userEmail, String fileName) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        try {
            helper.setFrom(fromEmail, fromName);
        } catch (UnsupportedEncodingException e) {
            helper.setFrom(fromEmail);
        }
        helper.setTo(userEmail);
        helper.setSubject("CV Uploaded Successfully — Novaliana");

        String htmlContent = buildCVUploadEmailContent(userName, fileName);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    private String buildRegistrationEmailContent(String userName) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #6d28d9, #7c3aed); color: white; padding: 20px; text-align: center; border-radius: 14px 14px 0 0; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                    .pill { display:inline-block; padding:6px 10px; border-radius:999px; background:rgba(109,40,217,0.12); color:#5b21b6; font-weight:700; font-size:12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Novaliana!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello %s,</h2>
                        <p>Thank you for registering with <strong>Novaliana</strong>. Your account has been successfully created!</p>
                        <p>You can now:</p>
                        <ul>
                            <li>Browse available job listings</li>
                            <li>Upload your CV</li>
                            <li>Apply for jobs</li>
                        </ul>
                        <p>We're excited to help you find your next opportunity!</p>
                        <p><span class="pill">Tip</span> Complete your profile to get better job matches.</p>
                    </div>
                    <div class="footer">
                        <p>Best regards,<br>The Novaliana Team</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName);
    }

    private String buildCVUploadEmailContent(String userName, String fileName) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #6d28d9, #7c3aed); color: white; padding: 20px; text-align: center; border-radius: 14px 14px 0 0; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                    .file { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; background:#fff; border:1px solid #e5e7eb; padding:8px 10px; border-radius:10px; display:inline-block; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>CV Upload Successful</h1>
                    </div>
                    <div class="content">
                        <h2>Hello %s,</h2>
                        <p>Your CV has been successfully uploaded to <strong>Novaliana</strong>!</p>
                        <p><strong>File Name:</strong> <span class="file">%s</span></p>
                        <p>Your CV is now available in your account and can be used when applying for jobs.</p>
                        <p>Thank you for using Novaliana!</p>
                    </div>
                    <div class="footer">
                        <p>Best regards,<br>The Novaliana Team</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, fileName);
    }
}

