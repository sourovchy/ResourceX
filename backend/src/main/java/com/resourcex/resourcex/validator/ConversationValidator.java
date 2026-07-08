package com.resourcex.resourcex.validator;

import com.resourcex.resourcex.dto.request.ConversationRequest;
import com.resourcex.resourcex.entity.Conversation;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.exception.BadRequestException;
import com.resourcex.resourcex.exception.ForbiddenException;
import org.springframework.stereotype.Component;

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
}