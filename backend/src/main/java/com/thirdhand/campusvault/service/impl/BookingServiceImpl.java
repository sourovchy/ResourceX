package com.thirdhand.campusvault.service.impl;

import com.thirdhand.campusvault.dto.request.CreateBookingRequest;
import com.thirdhand.campusvault.dto.response.BookingResponse;
import com.thirdhand.campusvault.entity.Booking;
import com.thirdhand.campusvault.entity.Item;
import com.thirdhand.campusvault.entity.Staff;
import com.thirdhand.campusvault.entity.User;
import com.thirdhand.campusvault.mapper.BookingMapper;
import com.thirdhand.campusvault.repository.BookingRepository;
import com.thirdhand.campusvault.repository.ItemRepository;
import com.thirdhand.campusvault.repository.UserRepository;
import com.thirdhand.campusvault.service.BookingService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {
        validateBookingDates(request.getStartDate(), request.getEndDate());

        Item item = itemRepository.findById(request.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        if (item.getStatus() == Item.ItemStatus.BLOCKED) {
            throw new IllegalStateException("This item is blocked and cannot be booked");
        }

        // Prevent race-condition duplicates at the application layer.
        // Overlapping bookings in PENDING/APPROVED/ACTIVE already block the slot.
        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                item,
                request.getStartDate(),
                request.getEndDate()
        );

        if (!overlappingBookings.isEmpty()) {
            throw new IllegalStateException("This item is already booked for the selected dates");
        }

        User renter = resolveCurrentUser();

        long days = java.time.temporal.ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        if (days <= 0) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        BigDecimal totalPrice = item.getDailyRate().multiply(BigDecimal.valueOf(days));

        Booking booking = Booking.builder()
                .item(item)
                .renter(renter)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalPrice(totalPrice)
                .status(Booking.BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);
        return BookingMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponse getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        return BookingMapper.toResponse(booking);
    }

    @Override
    @Transactional
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(BookingMapper::toResponse)
                .toList();
    }

    @Transactional
    public BookingResponse approveBooking(Long bookingId, Staff approver) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new IllegalStateException("Only pending bookings can be approved");
        }

        booking.setStatus(Booking.BookingStatus.APPROVED);
        booking.setApprovedBy(approver);
        booking.setApprovedAt(java.time.LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);
        syncItemAvailability(saved.getItem());

        return BookingMapper.toResponse(saved);
    }

    @Transactional
    public BookingResponse rejectBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new IllegalStateException("Only pending bookings can be rejected");
        }

        booking.setStatus(Booking.BookingStatus.REJECTED);
        Booking saved = bookingRepository.save(booking);

        syncItemAvailability(saved.getItem());
        return BookingMapper.toResponse(saved);
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (booking.getStatus() == Booking.BookingStatus.COMPLETED ||
                booking.getStatus() == Booking.BookingStatus.CANCELLED ||
                booking.getStatus() == Booking.BookingStatus.REJECTED) {
            throw new IllegalStateException("This booking can no longer be cancelled");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);

        syncItemAvailability(saved.getItem());
        return BookingMapper.toResponse(saved);
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void autoTransitionBookings() {
        LocalDate today = LocalDate.now();

        List<Booking> bookings = bookingRepository.findAll();
        boolean itemStateChanged = false;

        for (Booking booking : bookings) {
            Booking.BookingStatus before = booking.getStatus();

            if (booking.getStatus() == Booking.BookingStatus.APPROVED
                    && !today.isBefore(booking.getStartDate())
                    && !today.isAfter(booking.getEndDate())) {
                booking.setStatus(Booking.BookingStatus.ACTIVE);
                itemStateChanged = true;
            }

            if (booking.getStatus() == Booking.BookingStatus.ACTIVE
                    && today.isAfter(booking.getEndDate())) {
                booking.setStatus(Booking.BookingStatus.COMPLETED);
                booking.setReturnedDate(booking.getEndDate());
                itemStateChanged = true;
            }

            if (before != booking.getStatus()) {
                bookingRepository.save(booking);
            }
        }

        if (itemStateChanged) {
            syncAllItemAvailability();
        }
    }

    private void validateBookingDates(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }
    }

    private User resolveCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new IllegalStateException("Authenticated user not found");
        }

        String identifier = authentication.getName();

        return userRepository.findByEmailIgnoreCase(identifier)
                .or(() -> userRepository.findByStudentId(identifier))
                .orElseThrow(() -> new IllegalStateException("User account not found"));
    }

    private void syncAllItemAvailability() {
        List<Item> items = bookingRepository.findAll().stream()
                .map(Booking::getItem)
                .distinct()
                .toList();

        for (Item item : items) {
            syncItemAvailability(item);
        }
    }

    private void syncItemAvailability(Item item) {
        LocalDate today = LocalDate.now();

        boolean hasActiveBookingToday = bookingRepository.findAll().stream()
                .filter(b -> b.getItem() != null && b.getItem().getItemId().equals(item.getItemId()))
                .anyMatch(b ->
                        b.getStatus() == Booking.BookingStatus.ACTIVE
                                && !today.isBefore(b.getStartDate())
                                && !today.isAfter(b.getEndDate())
                );

        if (item.getStatus() == Item.ItemStatus.BLOCKED) {
            return;
        }

        item.setStatus(hasActiveBookingToday ? Item.ItemStatus.UNAVAILABLE : Item.ItemStatus.AVAILABLE);
        itemRepository.save(item);
    }
}