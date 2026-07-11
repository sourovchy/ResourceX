package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.response.ReportResponse;
import com.resourcex.resourcex.entity.Report;

import java.util.List;

public interface ReportService {

    ReportResponse createReport(Long reporterId, Long reportedUserId, Long reportedItemId, String reason);

    void resolveReport(Long reportId, boolean confirmed, boolean penalizeReporter);

    List<ReportResponse> getAllReports(Report.ReportStatus status);

    List<ReportResponse> getReporterReports(Long reporterId);

    List<ReportResponse> getReportsForUser(Long userId);

    List<ReportResponse> getReportsForItem(Long itemId);

    ReportResponse getReportDetails(Long reportId);
}
