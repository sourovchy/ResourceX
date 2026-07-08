package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.response.ReportResponse;
import java.time.LocalDateTime;
import java.util.List;

public interface ReportService {

    /**
     * Resolve a report.
     *
     * @param reportId         the report to resolve
     * @param confirmed        {@code true} if the moderator confirms a violation (penalises the reported user)
     * @param penalizeReporter {@code true} if the report is false and the reporter should be penalized
     */
    void resolveReport(Long reportId, boolean confirmed, boolean penalizeReporter);

    ReportResponse createReport(Long reporterId, String entityType, Long entityId, String reason);

    List<ReportResponse> getReporterReports(Long reporterId);

    List<ReportResponse> getEntityReports(String entityType, Long entityId);

    ReportResponse getReportDetails(Long reportId);

    List<ReportResponse> getAllReportsWithDetails();
}
