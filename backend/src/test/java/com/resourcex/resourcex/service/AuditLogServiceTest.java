package com.resourcex.resourcex.service;

import com.resourcex.resourcex.service.impl.AuditLogServiceImpl;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;

class AuditLogServiceTest {

    private final AuditLogServiceImpl auditLogService = new AuditLogServiceImpl();

    @Test
    void cleanupOldLogs_isNoOp() {
        // Given
        LocalDateTime threshold = LocalDateTime.now().minusDays(30);

        // When/Then (Should complete without exception)
        auditLogService.cleanupOldLogs(threshold);
    }
}
