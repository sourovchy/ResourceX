package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.response.ReviewEligibilityResponse;
import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.Item;
import com.resourcex.resourcex.entity.StudentProfile;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserStatus;
import com.resourcex.resourcex.repository.BookingRepository;
import com.resourcex.resourcex.repository.ItemRepository;
import com.resourcex.resourcex.repository.NotificationRepository;
import com.resourcex.resourcex.repository.ReviewRepository;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;

/**
 * End-to-end coverage of the booking-completion flow that depends on data being
 * actually committed.
 */
@SpringBootTest
@ActiveProfiles("test")
public class RentalCompletionPersistenceIntegrationTest {

    @Autowired
    private BookingServiceImpl bookingService;

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private ItemRepository itemRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StudentProfileRepository studentProfileRepository;
    @Autowired
    private com.resourcex.resourcex.repository.RoleRepository roleRepository;
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private NotificationRepository notificationRepository;
    @SpyBean
    private NotificationService notificationService;

    @Autowired
    private PlatformTransactionManager transactionManager;

    private User owner;
    private User renter;
    private Item item;
    private Booking booking;

    @BeforeEach
    void setUp() {
        new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
            com.resourcex.resourcex.entity.Role role = roleRepository.findByNameIgnoreCase("ROLE_USER")
                    .orElseGet(() -> roleRepository.save(
                            com.resourcex.resourcex.entity.Role.builder().name("ROLE_USER").build()));

            owner = userRepository.save(User.builder()
                    .name("Owner").email("owner.persist@test.com").password("hash")
                    .status(UserStatus.ACTIVE).role(role).build());
            studentProfileRepository.save(StudentProfile.builder()
                    .user(owner).studentId("P-OWN").phone("111").build());

            renter = userRepository.save(User.builder()
                    .name("Renter").email("renter.persist@test.com").password("hash")
                    .status(UserStatus.ACTIVE).role(role).build());
            studentProfileRepository.save(StudentProfile.builder()
                    .user(renter).studentId("P-REN").phone("222").build());

            item = itemRepository.save(Item.builder()
                    .owner(owner).title("Persisted Item").dailyRate(BigDecimal.TEN)
                    .status(Item.ItemStatus.UNAVAILABLE).build());

            booking = bookingRepository.save(Booking.builder()
                    .item(item).renter(renter)
                    .status(Booking.BookingStatus.ACTIVE)
                    .startDate(LocalDate.now().minusDays(5))
                    .endDate(LocalDate.now().plusDays(1))
                    .totalPrice(BigDecimal.valueOf(50))
                    .build());
        });

        authenticateAs(owner.getEmail());
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        reviewRepository.deleteAll();
        notificationRepository.deleteAll();
        bookingRepository.deleteAll();
        itemRepository.deleteAll();
        studentProfileRepository.deleteAll();
        userRepository.deleteAll();
    }

    private void authenticateAs(String email) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(email, null, Collections.emptyList()));
    }

    @Test
    void completeBooking_updatesTrustScores() {
        bookingService.completeBooking(booking.getBookingId());

        StudentProfile renterProfile = studentProfileRepository.findByUser_UserId(renter.getUserId()).orElseThrow();
        StudentProfile ownerProfile = studentProfileRepository.findByUser_UserId(owner.getUserId()).orElseThrow();

        assertThat(renterProfile.getTrustScore()).isEqualTo(105);
        assertThat(ownerProfile.getTrustScore()).isEqualTo(103);
    }

    @Test
    void completeBooking_makesRenterEligibleToReview() {
        authenticateAs(renter.getEmail());
        ReviewEligibilityResponse before = reviewService.getItemReviewEligibility(item.getItemId());
        assertThat(before.isEligible()).isFalse();

        authenticateAs(owner.getEmail());
        bookingService.completeBooking(booking.getBookingId());

        authenticateAs(renter.getEmail());
        ReviewEligibilityResponse after = reviewService.getItemReviewEligibility(item.getItemId());
        assertThat(after.isEligible()).isTrue();
        assertThat(after.getBookingId()).isEqualTo(booking.getBookingId());
    }

    @Test
    void completeBooking_notifiesRenter() {
        bookingService.completeBooking(booking.getBookingId());

        verify(notificationService, atLeastOnce()).createBookingNotification(
                eq(renter.getUserId()), eq(booking.getBookingId()), any(), any());
    }
}
