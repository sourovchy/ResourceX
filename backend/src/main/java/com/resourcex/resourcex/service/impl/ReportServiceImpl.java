package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.response.ReportResponse;
import com.resourcex.resourcex.entity.Item;
import com.resourcex.resourcex.entity.Report;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.exception.BadRequestException;
import com.resourcex.resourcex.exception.ConflictException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.repository.ItemRepository;
import com.resourcex.resourcex.repository.ReportRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.ReportService;
import com.resourcex.resourcex.service.TrustScoreService;
import com.resourcex.resourcex.util.constants.TrustPoints;
import lombok.RequiredArgsConstructor;
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
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final TrustScoreService trustScoreService;

    @Override
    public ReportResponse createReport(Long reporterId, Long reportedUserId, Long reportedItemId, String reason) {
        if (reportedUserId == null && reportedItemId == null) {
            throw new BadRequestException("A reported user or reported item must be specified.");
        }
        if (reportedUserId != null && reportedItemId != null) {
            throw new BadRequestException("Only one target (user or item) may be reported at a time.");
        }

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("Reporter not found"));

        if (reportedUserId != null) {
            if (reportedUserId.equals(reporterId)) {
                throw new BadRequestException("You cannot report yourself.");
            }
            User reportedUser = userRepository.findById(reportedUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("Reported user not found"));

            if (reportRepository.existsByReporter_UserIdAndReportedUser(reporterId, reportedUser)) {
                throw new ConflictException("You have already reported this user. A review is pending.");
            }

            Report report = Report.builder()
                    .reporter(reporter)
                    .reportedUser(reportedUser)
                    .reason(reason)
                    .build();
            return mapToResponse(reportRepository.save(report));
        }

        // Reported item path
        Item reportedItem = itemRepository.findById(reportedItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Reported item not found"));

        if (reportedItem.getOwner() != null && reportedItem.getOwner().getUserId().equals(reporterId)) {
            throw new BadRequestException("You cannot report your own listing.");
        }

        if (reportRepository.existsByReporter_UserIdAndReportedItem(reporterId, reportedItem)) {
            throw new ConflictException("You have already reported this item. A review is pending.");
        }

        Report report = Report.builder()
                .reporter(reporter)
                .reportedItem(reportedItem)
                .reason(reason)
                .build();
        return mapToResponse(reportRepository.save(report));
    }

    @Override
    public void resolveReport(Long reportId, boolean confirmed, boolean penalizeReporter) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

        if (report.getStatus() != Report.ReportStatus.PENDING) {
            throw new ConflictException("This report has already been resolved.");
        }

        if (confirmed) {
            Long reportedUserId = resolveReportedUserId(report);
            if (reportedUserId != null) {
                trustScoreService.applyTrustChange(
                        reportedUserId,
                        TrustPoints.VALID_REPORT,
                        "Valid report confirmed against you (report #" + report.getReportId() + ")");
            }
            report.setStatus(Report.ReportStatus.RESOLVED);
        } else {
            if (penalizeReporter && report.getReporter() != null) {
                trustScoreService.applyTrustChange(
                        report.getReporter().getUserId(),
                        TrustPoints.CONFIRMED_FALSE_REPORT,
                        "Filed a report judged false (report #" + report.getReportId() + ")");
            }
            report.setStatus(Report.ReportStatus.DISMISSED);
        }

        report.setResolvedAt(LocalDateTime.now());
        reportRepository.save(report);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReportResponse> getAllReports(Report.ReportStatus status) {
        List<Report> reports = (status != null)
                ? reportRepository.findByStatusOrderByCreatedAtDesc(status)
                : reportRepository.findAllByOrderByCreatedAtDesc();
        return reports.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReportResponse> getReporterReports(Long reporterId) {
        return reportRepository.findByReporter_UserIdOrderByCreatedAtDesc(reporterId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReportResponse> getReportsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return reportRepository.findByReportedUserOrderByCreatedAtDesc(user)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReportResponse> getReportsForItem(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));
        return reportRepository.findByReportedItemOrderByCreatedAtDesc(item)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReportResponse getReportDetails(Long reportId) {
        return reportRepository.findById(reportId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
    }

    private ReportResponse mapToResponse(Report report) {
        ReportResponse.ReportResponseBuilder builder = ReportResponse.builder()
                .reportId(report.getReportId())
                .reason(report.getReason())
                .status(report.getStatus().name())
                .resolvedAt(report.getResolvedAt())
                .createdAt(report.getCreatedAt());

        if (report.getReporter() != null) {
            builder.reporterId(report.getReporter().getUserId())
                   .reporterName(report.getReporter().getName())
                   .reporterEmail(report.getReporter().getEmail());
        }

        if (report.getReportedUser() != null) {
            builder.reportedUserId(report.getReportedUser().getUserId())
                   .reportedUserName(report.getReportedUser().getName())
                   .reportedUserEmail(report.getReportedUser().getEmail());
        }

        if (report.getReportedItem() != null) {
            builder.reportedItemId(report.getReportedItem().getItemId())
                   .reportedItemTitle(report.getReportedItem().getTitle());
            if (report.getReportedItem().getOwner() != null) {
                builder.reportedItemOwnerName(report.getReportedItem().getOwner().getName());
            }
        }

        return builder.build();
    }

    private Long resolveReportedUserId(Report report) {
        if (report.getReportedUser() != null) {
            return report.getReportedUser().getUserId();
        }
        if (report.getReportedItem() != null && report.getReportedItem().getOwner() != null) {
            return report.getReportedItem().getOwner().getUserId();
        }
        return null;
    }

    private Long resolveCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) return null;
        return userRepository.findByEmailIgnoreCase(auth.getName())
                .map(User::getUserId)
                .orElse(null);
    }
}
