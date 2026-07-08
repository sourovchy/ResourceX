package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.response.ReportResponse;
import com.resourcex.resourcex.entity.AuditLog;
import com.resourcex.resourcex.entity.Item;
import com.resourcex.resourcex.entity.Report;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.exception.BadRequestException;
import com.resourcex.resourcex.exception.ConflictException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.repository.ItemRepository;
import com.resourcex.resourcex.repository.ReportRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.AuditLogService;
import com.resourcex.resourcex.service.ReportService;
import com.resourcex.resourcex.service.TrustScoreService;
import com.resourcex.resourcex.util.constants.TrustPoints;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final TrustScoreService trustScoreService;

    @Override
    public void resolveReport(Long reportId, boolean confirmed, boolean penalizeReporter) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

        Long adminId = resolveCurrentUserId();

        if (confirmed) {
            Long reportedUserId = resolveReportedUserId(report);
            if (reportedUserId != null) {
                trustScoreService.applyTrustChange(
                        reportedUserId,
                        TrustPoints.VALID_REPORT,
                        "Valid report confirmed against you (report #" + report.getReportId() + ")");
            }
        } else if (penalizeReporter) {
            // False report — penalise the reporter.
            trustScoreService.applyTrustChange(
                    report.getReporter().getUserId(),
                    TrustPoints.CONFIRMED_FALSE_REPORT,
                    "Filed a report judged false (report #" + report.getReportId() + ")");
        }

        String actionType = confirmed ? "REPORT_RESOLVED" : "REPORT_REJECTED";
        auditLogService.logAction(
                adminId != null ? AuditLog.ActorType.USER : AuditLog.ActorType.SYSTEM,
                adminId,
                actionType,
                "REPORT",
                report.getReportId(),
                confirmed ? AuditLog.AuditOutcome.SUCCESS : AuditLog.AuditOutcome.REJECTED,
                confirmed ? "Report resolved and confirmed violation" : "Report reviewed and rejected");

        reportRepository.delete(report);
    }

    @Override
    public ReportResponse createReport(Long reporterId, String entityTypeStr, Long entityId, String reason) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("Reporter not found"));

        Report.EntityType entityType;
        try {
            entityType = Report.EntityType.valueOf(entityTypeStr.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid entity type: " + entityTypeStr);
        }

        // Validate entity exists
        if (entityType == Report.EntityType.ITEM) {
            Item item = itemRepository.findById(entityId)
                    .orElseThrow(() -> new ResourceNotFoundException("Reported listing not found"));
            
            // Prevent reporting own listing
            if (item.getOwner() != null && item.getOwner().getUserId().equals(reporterId)) {
                throw new BadRequestException("You cannot report your own listing.");
            }
        } else if (entityType == Report.EntityType.USER) {
            if (!userRepository.existsById(entityId)) {
                throw new ResourceNotFoundException("Reported user not found");
            }
            if (entityId.equals(reporterId)) {
                throw new BadRequestException("You cannot report yourself.");
            }
        }

        // Anti-spam/duplicate check
        boolean exists = reportRepository.existsByReporterUserIdAndEntityTypeAndEntityId(
                reporterId, entityType, entityId);
        if (exists) {
            throw new ConflictException("You have already reported this. A review is pending.");
        }

        Report report = Report.builder()
                .reporter(reporter)
                .entityType(entityType)
                .entityId(entityId)
                .reason(reason)
                .build();

        Report saved = reportRepository.save(report);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReportResponse> getReporterReports(Long reporterId) {
        return reportRepository.findByReporterUserIdOrderByCreatedAtDesc(reporterId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReportResponse> getEntityReports(String entityTypeStr, Long entityId) {
        Report.EntityType entityType;
        try {
            entityType = Report.EntityType.valueOf(entityTypeStr.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid entity type: " + entityTypeStr);
        }
        return reportRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReportResponse getReportDetails(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        return mapToResponse(report);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReportResponse> getAllReportsWithDetails() {
        return reportRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ReportResponse mapToResponse(Report report) {
        if (report == null) return null;

        ReportResponse.ReportResponseBuilder builder = ReportResponse.builder()
                .reportId(report.getReportId())
                .reason(report.getReason())
                .createdAt(report.getCreatedAt());

        if (report.getReporter() != null) {
            builder.reporterId(report.getReporter().getUserId())
                   .reporterName(report.getReporter().getName())
                   .reporterEmail(report.getReporter().getEmail());
        }

        builder.entityType(report.getEntityType().name());
        builder.entityId(report.getEntityId());

        if (report.getEntityType() == Report.EntityType.ITEM) {
            itemRepository.findById(report.getEntityId()).ifPresent(item -> {
                builder.entityName(item.getTitle());
                if (item.getOwner() != null) {
                    builder.ownerId(item.getOwner().getUserId())
                           .ownerName(item.getOwner().getName())
                           .ownerEmail(item.getOwner().getEmail());
                }
            });
        } else if (report.getEntityType() == Report.EntityType.USER) {
            userRepository.findById(report.getEntityId()).ifPresent(user -> {
                builder.entityName(user.getName());
                builder.ownerId(user.getUserId())
                       .ownerName(user.getName())
                       .ownerEmail(user.getEmail());
            });
        } else if (report.getEntityType() == Report.EntityType.BOOKING) {
            builder.entityName("Booking #" + report.getEntityId());
        }

        // Review info is no longer stored on the report since resolved reports are deleted

        return builder.build();
    }

    private Long resolveReportedUserId(Report report) {
        return switch (report.getEntityType()) {
            case USER -> report.getEntityId();
            case ITEM -> itemRepository.findById(report.getEntityId())
                    .map(Item::getOwner)
                    .map(User::getUserId)
                    .orElse(null);
            case BOOKING -> {
                log.debug("[Trust] Report #{} targets a booking — no single reportee to penalise", report.getReportId());
                yield null;
            }
        };
    }

    private Long resolveCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return null;
        }
        return userRepository.findByEmailIgnoreCase(auth.getName())
                .map(User::getUserId)
                .orElse(null);
    }
}
