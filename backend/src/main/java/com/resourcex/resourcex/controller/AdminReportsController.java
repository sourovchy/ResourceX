package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.response.ReportResponse;
import com.resourcex.resourcex.dto.response.SimpleReportResponse;
import com.resourcex.resourcex.entity.Report;
import com.resourcex.resourcex.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportsController {

    private final ReportService reportService;

    /**
     * Recent pending reports for the admin dashboard summary widget.
     */
    @GetMapping("/recent")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<List<SimpleReportResponse>> recent() {
        List<ReportResponse> reports = reportService.getAllReports(Report.ReportStatus.PENDING);
        List<SimpleReportResponse> resp = reports.stream()
                .limit(10)
                .map(r -> SimpleReportResponse.builder()
                        .id(r.getReportId())
                        .title(r.getReason() != null && r.getReason().length() > 60
                                ? r.getReason().substring(0, 60) + "..."
                                : r.getReason())
                        .description(r.getReason())
                        .priority("MEDIUM")
                        .type(r.getReportedUserId() != null ? "USER" : "ITEM")
                        .status(r.getStatus())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(resp);
    }

    /**
     * All reports, optionally filtered by status (PENDING / RESOLVED / DISMISSED).
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<List<ReportResponse>> getAllReports(
            @RequestParam(required = false) String status) {
        Report.ReportStatus reportStatus = null;
        if (status != null && !status.isBlank()) {
            try {
                reportStatus = Report.ReportStatus.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                reportStatus = null;
            }
        }
        return ResponseEntity.ok(reportService.getAllReports(reportStatus));
    }

    @GetMapping("/{reportId}")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<ReportResponse> getReportDetails(@PathVariable Long reportId) {
        return ResponseEntity.ok(reportService.getReportDetails(reportId));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<List<ReportResponse>> getReportsForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(reportService.getReportsForUser(userId));
    }

    @GetMapping("/item/{itemId}")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<List<ReportResponse>> getReportsForItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(reportService.getReportsForItem(itemId));
    }

    /**
     * Resolve or dismiss a report.
     * confirmed=true  → RESOLVED (trust penalty on the reported entity)
     * confirmed=false → DISMISSED (trust penalty on reporter if penalizeReporter=true)
     */
    @PatchMapping("/{reportId}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<Void> resolve(
            @PathVariable Long reportId,
            @RequestParam(defaultValue = "true") boolean confirmed,
            @RequestParam(defaultValue = "false") boolean penalizeReporter) {
        reportService.resolveReport(reportId, confirmed, penalizeReporter);
        return ResponseEntity.ok().build();
    }
}
