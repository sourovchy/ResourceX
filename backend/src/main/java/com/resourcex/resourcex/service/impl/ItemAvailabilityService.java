package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.entity.Item;
import com.resourcex.resourcex.repository.BookingRepository;
import com.resourcex.resourcex.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Keeps an item's AVAILABLE/UNAVAILABLE status in sync with whether it is
 * currently occupied by an APPROVED/ACTIVE booking. Extracted from
 * {@code BookingServiceImpl} because every booking transition (and the nightly
 * batch jobs) need it — it is the one place that derives item status from
 * booking state. BLOCKED items are left untouched (admin-controlled).
 */
@Component
@RequiredArgsConstructor
public class ItemAvailabilityService {

    private final BookingRepository bookingRepository;
    private final ItemRepository itemRepository;

    public void sync(Item item) {
        if (item == null || item.getStatus() == Item.ItemStatus.BLOCKED) {
            return;
        }

        boolean hasActiveBooking = bookingRepository.existsOccupyingBookingOn(item, LocalDate.now());

        item.setStatus(hasActiveBooking
                ? Item.ItemStatus.UNAVAILABLE
                : Item.ItemStatus.AVAILABLE);
        itemRepository.save(item);
    }
}
