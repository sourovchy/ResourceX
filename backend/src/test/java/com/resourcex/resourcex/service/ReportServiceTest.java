package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.response.ReportResponse;
import com.resourcex.resourcex.entity.Item;
import com.resourcex.resourcex.entity.Report;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.exception.BadRequestException;
import com.resourcex.resourcex.exception.ConflictException;
import com.resourcex.resourcex.repository.ItemRepository;
import com.resourcex.resourcex.repository.ReportRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.impl.ReportServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TrustScoreService trustScoreService;

    @InjectMocks
    private ReportServiceImpl reportService;

    private User reporter;
    private User owner;
    private Item item;

    @BeforeEach
    void setUp() {
        reporter = new User();
        reporter.setUserId(1L);
        reporter.setName("Reporter Student");
        reporter.setEmail("reporter@campus.edu");

        owner = new User();
        owner.setUserId(2L);
        owner.setName("Owner Student");
        owner.setEmail("owner@campus.edu");

        item = new Item();
        item.setItemId(10L);
        item.setTitle("Flagged Camera");
        item.setOwner(owner);
    }

    @Test
    void createReport_selfReportListing_throwsBadRequest() {
        given(userRepository.findById(reporter.getUserId())).willReturn(Optional.of(reporter));

        // Make the reporter the owner of the item
        item.setOwner(reporter);
        given(itemRepository.findById(item.getItemId())).willReturn(Optional.of(item));

        assertThatThrownBy(() -> reportService.createReport(reporter.getUserId(), null, item.getItemId(), "FRAUD_OR_SCAM"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("You cannot report your own listing.");
    }

    @Test
    void createReport_duplicateReport_throwsConflict() {
        given(userRepository.findById(reporter.getUserId())).willReturn(Optional.of(reporter));
        given(itemRepository.findById(item.getItemId())).willReturn(Optional.of(item));

        given(reportRepository.existsByReporter_UserIdAndReportedItem(reporter.getUserId(), item))
                .willReturn(true);

        assertThatThrownBy(() -> reportService.createReport(reporter.getUserId(), null, item.getItemId(), "FRAUD_OR_SCAM"))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("You have already reported this item. A review is pending.");
    }

    @Test
    void createReport_validItemReport_savesAndReturnsResponse() {
        given(userRepository.findById(reporter.getUserId())).willReturn(Optional.of(reporter));
        given(itemRepository.findById(item.getItemId())).willReturn(Optional.of(item));
        given(reportRepository.existsByReporter_UserIdAndReportedItem(reporter.getUserId(), item))
                .willReturn(false);

        Report report = Report.builder()
                .reportId(100L)
                .reporter(reporter)
                .reportedItem(item)
                .reason("FRAUD_OR_SCAM")
                .status(Report.ReportStatus.PENDING)
                .build();

        given(reportRepository.save(any(Report.class))).willReturn(report);

        ReportResponse res = reportService.createReport(reporter.getUserId(), null, item.getItemId(), "FRAUD_OR_SCAM");

        assertThat(res).isNotNull();
        assertThat(res.getReportId()).isEqualTo(100L);
        assertThat(res.getReportedItemId()).isEqualTo(item.getItemId());
        assertThat(res.getReason()).isEqualTo("FRAUD_OR_SCAM");
        assertThat(res.getStatus()).isEqualTo("PENDING");
        verify(reportRepository, times(1)).save(any(Report.class));
    }
}
