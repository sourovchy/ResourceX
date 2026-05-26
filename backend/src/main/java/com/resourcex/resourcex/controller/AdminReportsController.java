package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.response.SimpleReportResponse;
import com.resourcex.resourcex.entity.Report;
import com.resourcex.resourcex.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportsController {

    private final ReportRepository reportRepository;

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
}
