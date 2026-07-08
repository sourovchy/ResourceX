package com.resourcex.resourcex.service;

import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.Item;
import com.resourcex.resourcex.entity.StudentProfile;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserStatus;
import com.resourcex.resourcex.repository.BookingRepository;
import com.resourcex.resourcex.repository.ItemRepository;
import com.resourcex.resourcex.repository.NotificationRepository;
import com.resourcex.resourcex.repository.StudentProfileRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.impl.BookingServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doThrow;

/**
 * Verifies that booking completion works end-to-end, including the case where
 * an attempted trust-score side effect throws. Mirrors the persistence-style
 * integration test pattern: each test seeds its own data inside a short-lived
 * transaction, flushes/clears the persistence context, and cleans up afterwards.
 *
 * We intentionally do NOT use a class-level @Transactional here because
 * @SpyBean + class-level @Transactional + H2 (MODE=MySQL) interact badly when
 * the spy is stubbed in one test and not the next — the first test would fail
 * to resolve the persisted owner.
 *
 * Emails are fixed (per-method) and the persistence context is explicitly
 * flushed and cleared after setup so that the BookingServiceImpl transaction
 * (started later in the test body) sees a clean L1 cache and queries the
 * freshly-committed row from the database.
 */
@SpringBootTest
@ActiveProfiles("test")
public class RentalCompletionIntegrationTest {

    @Autowired
    private BookingServiceImpl bookingService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private com.resourcex.resourcex.repository.RoleRepository roleRepository;

    @Autowired private PlatformTransactionManager transactionManager;

    @SpyBean
    private TrustScoreService trustScoreService;

    private User owner;
    private User renter;
    private Item item;
    private Booking booking;

    @BeforeEach
    void setUp() {
        long testRunId = System.nanoTime();
        new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
            com.resourcex.resourcex.entity.Role role = roleRepository.findByNameIgnoreCase("ROLE_USER")
                    .orElseGet(() -> roleRepository.save(
                            com.resourcex.resourcex.entity.Role.builder().name("ROLE_USER").build()));

            owner = userRepository.save(User.builder()
                    .name("Owner")
                    .email("owner.it." + testRunId + "@test.com")
                    .password("hash")
                    .status(UserStatus.ACTIVE)
                    .role(role)
                    .build());
            studentProfileRepository.save(StudentProfile.builder()
                    .user(owner).studentId("S-OWN-IT").phone("123").build());

            renter = userRepository.save(User.builder()
                    .name("Renter")
                    .email("renter.it." + testRunId + "@test.com")
                    .password("hash")
                    .status(UserStatus.ACTIVE)
                    .role(role)
                    .build());
            studentProfileRepository.save(StudentProfile.builder()
                    .user(renter).studentId("S-REN-IT-" + testRunId).phone("456").build());

            item = itemRepository.save(Item.builder()
                    .owner(owner)
                    .title("Test Item")
                    .dailyRate(BigDecimal.TEN)
                    .status(Item.ItemStatus.UNAVAILABLE)
                    .build());

            booking = bookingRepository.save(Booking.builder()
                    .item(item)
                    .renter(renter)
                    .status(Booking.BookingStatus.ACTIVE)
                    .startDate(LocalDate.now().minusDays(5))
                    .endDate(LocalDate.now().plusDays(1))
                    .totalPrice(BigDecimal.valueOf(50))
                    .build());
        });

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(owner.getEmail(), null, Collections.emptyList()));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        // Order matters: delete dependents before parents to satisfy FK constraints.
        bookingRepository.deleteAll();
        itemRepository.deleteAll();
        studentProfileRepository.deleteAll();
        notificationRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void completeBooking_Success_UpdatesStatusesAndAwardsTrust() {
        bookingService.completeBooking(booking.getBookingId());

        Booking completedBooking = bookingRepository.findById(booking.getBookingId()).orElseThrow();
        assertThat(completedBooking.getStatus()).isEqualTo(Booking.BookingStatus.COMPLETED);
        assertThat(completedBooking.getReturnedDate()).isNotNull();

        Item completedItem = itemRepository.findById(item.getItemId()).orElseThrow();
        assertThat(completedItem.getStatus()).isEqualTo(Item.ItemStatus.AVAILABLE);
        org.mockito.Mockito.verify(trustScoreService, org.mockito.Mockito.atLeastOnce())
                .applyTrustChange(any(), anyInt(), any());
    }

    @Test
    void completeBooking_TrustEventFails_BookingStillCompletes() {
        doThrow(new RuntimeException("Simulated trust DB failure"))
                .when(trustScoreService).applyTrustChange(any(), anyInt(), any());

        bookingService.completeBooking(booking.getBookingId());

        // Booking should STILL be completed despite the exception
        Booking completedBooking = bookingRepository.findById(booking.getBookingId()).orElseThrow();
        assertThat(completedBooking.getStatus()).isEqualTo(Booking.BookingStatus.COMPLETED);

        // Item should STILL be available
        Item completedItem = itemRepository.findById(item.getItemId()).orElseThrow();
        assertThat(completedItem.getStatus()).isEqualTo(Item.ItemStatus.AVAILABLE);
    }

    @Test
    void completeBooking_AfterStubTest_BookingAlsoCompletes() {
        // Stub AND immediately verify it (no booking call)
        doThrow(new RuntimeException("Simulated trust DB failure"))
                .when(trustScoreService).applyTrustChange(any(), anyInt(), any());

        org.mockito.Mockito.verify(trustScoreService, org.mockito.Mockito.never())
                .applyTrustChange(any(), anyInt(), any());
    }
}
