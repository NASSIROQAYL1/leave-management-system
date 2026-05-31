package com.company.leave.service;

import com.company.leave.entity.AuditLog;
import com.company.leave.entity.User;
import com.company.leave.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void log(User actor, String action, String entityType, Long entityId, String oldValue, String newValue, String ipAddress) {
        AuditLog auditLog = new AuditLog();
        auditLog.setUser(actor);
        auditLog.setAction(action);
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setOldValue(oldValue);
        auditLog.setNewValue(newValue);
        auditLog.setIpAddress(ipAddress);
        auditLogRepository.save(auditLog);
    }
}
