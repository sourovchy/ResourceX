package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.response.SimpleReportResponse;
import com.resourcex.resourcex.dto.response.ReportResponse;
import com.resourcex.resourcex.entity.Report;
import com.resourcex.resourcex.repository.ReportRepository;
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

    private final ReportRepository reportRepository;
    private final ReportService reportService;

    @GetMapping("/recent")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<List<SimpleReportResponse>> recent() {
        List<Report> reports = reportRepository.findAllByOrderByCreatedAtDesc();

        List<SimpleReportResponse> resp = reports.stream().map(r -> SimpleReportResponse.builder()
                .id(r.getReportId())
                .title(r.getReason() != null && r.getReason().length() > 60 ? r.getReason().substring(0, 60) + "..."
                        : r.getReason())
                .description(r.getReason())
                .priority("MEDIUM")
                .type(r.getEntityType().name())
                .build()).collect(Collectors.toList());

        return ResponseEntity.ok(resp);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<List<ReportResponse>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReportsWithDetails());
    }

    @GetMapping("/{reportId}")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<ReportResponse> getReportDetails(@PathVariable Long reportId) {
        return ResponseEntity.ok(reportService.getReportDetails(reportId));
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<List<ReportResponse>> getEntityReports(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        return ResponseEntity.ok(reportService.getEntityReports(entityType, entityId));
    }

    /**
     * Resolve a report. {@code confirmed=true} confirms a violation (penalises the reported user),
     * {@code confirmed=false} judges the report false (penalises the reporter if {@code penalizeReporter=true}).
     */
    @PatchMapping("/{reportId}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<Void> resolve(
            @PathVariable Long reportId,
            @RequestParam(defaultValue = "true") boolean confirmed,
            @RequestParam(defaultValue = "true") boolean penalizeReporter) {
        reportService.resolveReport(reportId, confirmed, penalizeReporter);
        return ResponseEntity.ok().build();
    }
}

