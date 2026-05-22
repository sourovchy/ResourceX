package com.resourcex.resourcex.validator;

import com.resourcex.resourcex.dto.request.ConversationRequest;
import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.Conversation;
import com.resourcex.resourcex.entity.Dispute;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.exception.BadRequestException;
import com.resourcex.resourcex.exception.ForbiddenException;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class ConversationValidator {

    public void validateStartRequest(ConversationRequest request) {
        if (request == null) {
            throw new BadRequestException("Conversation request is required");
        }
        if (request.getOtherUserId() == null) {
            throw new BadRequestException("Other user ID is required");
        }
    }

    public void validateUsers(User currentUser, User otherUser) {
        if (currentUser == null || otherUser == null) {
            throw new BadRequestException("Conversation participants are required");
        }
        if (currentUser.getUserId().equals(otherUser.getUserId())) {
            throw new BadRequestException("You cannot start a conversation with yourself");
        }
    }

    public void validateContext(User currentUser, User otherUser, Booking booking, Dispute dispute) {
        if (booking != null) {
            validateBookingParticipants(currentUser, otherUser, booking);
        }

        if (dispute != null) {
            Booking disputeBooking = dispute.getBooking();
            if (disputeBooking == null) {
                throw new BadRequestException("Dispute must be linked to a booking");
            }
            validateBookingParticipants(currentUser, otherUser, disputeBooking);
        }

        if (booking != null && dispute != null && !booking.getBookingId().equals(dispute.getBooking().getBookingId())) {
            throw new BadRequestException("Booking and dispute context do not match");
        }
    }

    public void validateAccess(Conversation conversation, Long currentUserId) {
        if (conversation == null) {
            throw new BadRequestException("Conversation is required");
        }

        Long participantOneId = conversation.getParticipantOneUser().getUserId();
        Long participantTwoId = conversation.getParticipantTwoUser().getUserId();

        if (!participantOneId.equals(currentUserId) && !participantTwoId.equals(currentUserId)) {
            throw new ForbiddenException("You do not have access to this conversation");
        }
    }

    private void validateBookingParticipants(User currentUser, User otherUser, Booking booking) {
        Long renterId = booking.getRenter().getUserId();
        Long ownerId = booking.getItem().getOwner().getUserId();
        Set<Long> expectedParticipants = Set.of(renterId, ownerId);

        if (!expectedParticipants.contains(currentUser.getUserId()) || !expectedParticipants.contains(otherUser.getUserId())) {
            throw new ForbiddenException("Conversation participants must match the booking participants");
        }
    }
}