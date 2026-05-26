package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.MessageRequest;
import com.resourcex.resourcex.dto.response.MessageResponse;
import com.resourcex.resourcex.entity.Conversation;
import com.resourcex.resourcex.entity.Message;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.exception.BadRequestException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.mapper.MessageMapper;
import com.resourcex.resourcex.repository.ConversationRepository;
import com.resourcex.resourcex.repository.MessageRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.MessageService;
import com.resourcex.resourcex.validator.MessageValidator;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final MessageMapper messageMapper;
    private final MessageValidator messageValidator;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public MessageResponse sendMessage(String currentUserEmail, Long conversationId, MessageRequest request) {
        messageValidator.validateRequest(request);

        User currentUser = getAuthenticatedUser(currentUserEmail);
        Conversation conversation = getConversationForUser(conversationId, currentUser.getUserId());

        User receiver = getOtherParticipant(conversation, currentUser.getUserId());

        Message message = Message.builder()
                .conversation(conversation)
                .senderUser(currentUser)
                .receiverUser(receiver)
                .content(request.getContent().trim())
                .isRead(false)
                .build();

        Message savedMessage = messageRepository.save(message);
        conversation.setLastMessageAt(savedMessage.getCreatedAt() != null ? savedMessage.getCreatedAt() : LocalDateTime.now());
        conversationRepository.save(conversation);

        MessageResponse response = messageMapper.toResponse(savedMessage);
        messagingTemplate.convertAndSend("/queue/messages/" + receiver.getUserId(), response);

        return response;
    }

    @Override
    @Transactional
    public List<MessageResponse> getConversationMessages(String currentUserEmail, Long conversationId) {
        User currentUser = getAuthenticatedUser(currentUserEmail);
        Conversation conversation = getConversationForUser(conversationId, currentUser.getUserId());

        markConversationAsRead(currentUserEmail, conversationId);

        return messageRepository.findByConversationConversationIdOrderByCreatedAtAsc(conversation.getConversationId())
                .stream()
                .map(messageMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void markConversationAsRead(String currentUserEmail, Long conversationId) {
        User currentUser = getAuthenticatedUser(currentUserEmail);
        Conversation conversation = getConversationForUser(conversationId, currentUser.getUserId());

        messageRepository.markConversationMessagesAsRead(
                conversation.getConversationId(),
                currentUser.getUserId(),
                LocalDateTime.now()
        );
    }

    @Override
    @Transactional
    public void markMessageAsRead(String currentUserEmail, Long messageId) {
        User currentUser = getAuthenticatedUser(currentUserEmail);

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        messageValidator.validateMessageOwnership(message, currentUser.getUserId());

        messageRepository.markMessageAsRead(message.getMessageId(), currentUser.getUserId(), LocalDateTime.now());
    }

    private Conversation getConversationForUser(Long conversationId, Long currentUserId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        messageValidator.validateAccess(conversation, currentUserId);
        return conversation;
    }

    private User getOtherParticipant(Conversation conversation, Long currentUserId) {
        Long participantOneId = conversation.getParticipantOneUser().getUserId();
        Long participantTwoId = conversation.getParticipantTwoUser().getUserId();

        if (participantOneId.equals(currentUserId)) {
            return conversation.getParticipantTwoUser();
        }

        if (participantTwoId.equals(currentUserId)) {
            return conversation.getParticipantOneUser();
        }

        throw new BadRequestException("You do not have access to this conversation");
    }

    private User getAuthenticatedUser(String currentUserEmail) {
        if (currentUserEmail == null || currentUserEmail.trim().isEmpty()) {
            throw new BadRequestException("Authenticated user is required");
        }

        return userRepository.findByEmailIgnoreCase(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}