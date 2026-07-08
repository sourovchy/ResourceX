package com.resourcex.resourcex.validator;

import com.resourcex.resourcex.dto.request.MessageRequest;
import com.resourcex.resourcex.entity.Conversation;
import com.resourcex.resourcex.entity.Message;
import com.resourcex.resourcex.exception.BadRequestException;
import com.resourcex.resourcex.exception.ForbiddenException;
import org.springframework.stereotype.Component;

@Component
public class MessageValidator {

    public void validateRequest(MessageRequest request) {
        if (request == null) {
            throw new BadRequestException("Message request is required");
        }
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new BadRequestException("Message content is required");
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

    public void validateMessageOwnership(Message message, Long currentUserId) {
        if (message == null) {
            throw new BadRequestException("Message is required");
        }

        Long senderId = message.getSenderUser().getUserId();
        Conversation conv = message.getConversation();
        Long participantOneId = conv.getParticipantOneUser().getUserId();
        Long participantTwoId = conv.getParticipantTwoUser().getUserId();
        
        Long receiverId = participantOneId.equals(senderId) ? participantTwoId : participantOneId;

        if (!receiverId.equals(currentUserId)) {
            throw new ForbiddenException("Only the receiver can mark this message as read");
        }
    }
}