package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.CreateReportRequest;
import com.resourcex.resourcex.dto.response.ReportResponse;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.exception.UnauthorizedException;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ReportResponse> submitReport(@Valid @RequestBody CreateReportRequest request) {
        Long currentUserId = getCurrentUserId();
        ReportResponse response = reportService.createReport(
                currentUserId,
                request.getEntityType(),
                request.getEntityId(),
                request.getReason()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ReportResponse>> getMyReports() {
        Long currentUserId = getCurrentUserId();
        List<ReportResponse> reports = reportService.getReporterReports(currentUserId);
        return ResponseEntity.ok(reports);
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new UnauthorizedException("User is not authenticated");
        }
        return userRepository.findByEmailIgnoreCase(auth.getName())
                .map(User::getUserId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }
}
