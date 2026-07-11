package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.CreateReportRequest;
import com.resourcex.resourcex.dto.response.ReportResponse;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.exception.BadRequestException;
import com.resourcex.resourcex.exception.UnauthorizedException;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ReportController {

    private final ReportService reportService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ReportResponse> submitReport(@Valid @RequestBody CreateReportRequest request) {
        if (request.getReportedUserId() == null && request.getReportedItemId() == null) {
            throw new BadRequestException("Either reportedUserId or reportedItemId must be provided.");
        }
        Long currentUserId = getCurrentUserId();
        ReportResponse response = reportService.createReport(
                currentUserId,
                request.getReportedUserId(),
                request.getReportedItemId(),
                request.getReason()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ReportResponse>> getMyReports() {
        return ResponseEntity.ok(reportService.getReporterReports(getCurrentUserId()));
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
