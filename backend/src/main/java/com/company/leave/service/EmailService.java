package com.company.leave.service;

import com.company.leave.entity.LeaveRequest;
import com.company.leave.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${app.mail.from:no-reply@company.com}")
    private String fromAddress;

    public void sendLeaveSubmittedEmail(User recipient, LeaveRequest leaveRequest, String message) {
        Map<String, Object> variables = baseLeaveVariables(recipient, leaveRequest);
        variables.put("message", message);
        sendTemplatedEmail(recipient.getEmail(), "Leave request submitted", "email/leave-submitted", variables);
    }

    public void sendLeaveApprovedEmail(User recipient, LeaveRequest leaveRequest, String comment) {
        Map<String, Object> variables = baseLeaveVariables(recipient, leaveRequest);
        variables.put("comment", comment != null ? comment : "Approved.");
        sendTemplatedEmail(recipient.getEmail(), "Leave request approved", "email/leave-approved", variables);
    }

    public void sendLeaveRejectedEmail(User recipient, LeaveRequest leaveRequest, String comment) {
        Map<String, Object> variables = baseLeaveVariables(recipient, leaveRequest);
        variables.put("comment", comment != null ? comment : "Rejected.");
        sendTemplatedEmail(recipient.getEmail(), "Leave request rejected", "email/leave-rejected", variables);
    }

    public void sendWelcomeEmail(User recipient) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("recipientName", recipient.getFirstName() + " " + recipient.getLastName());
        sendTemplatedEmail(recipient.getEmail(), "Welcome to the Leave Management System", "email/welcome", variables);
    }

    private Map<String, Object> baseLeaveVariables(User recipient, LeaveRequest leaveRequest) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("recipientName", recipient.getFirstName() + " " + recipient.getLastName());
        variables.put("employeeName", leaveRequest.getUser().getFirstName() + " " + leaveRequest.getUser().getLastName());
        variables.put("leaveType", leaveRequest.getLeaveType().getName());
        variables.put("startDate", leaveRequest.getStartDate());
        variables.put("endDate", leaveRequest.getEndDate());
        variables.put("totalDays", leaveRequest.getTotalDays());
        return variables;
    }

    private void sendTemplatedEmail(String to, String subject, String template, Map<String, Object> variables) {
        try {
            Context context = new Context();
            context.setVariables(variables);
            String html = templateEngine.process(template, context);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException | RuntimeException exception) {
            log.warn("Email delivery skipped: {}", exception.getMessage());
        }
    }
}
