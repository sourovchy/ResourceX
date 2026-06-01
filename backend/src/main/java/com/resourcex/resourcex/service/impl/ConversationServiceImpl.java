package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.ConversationRequest;
import com.resourcex.resourcex.dto.request.MessageRequest;
import com.resourcex.resourcex.dto.response.ConversationResponse;
import com.resourcex.resourcex.entity.*;
import com.resourcex.resourcex.exception.BadRequestException;
import com.resourcex.resourcex.exception.ForbiddenException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.repository.*;
import com.resourcex.resourcex.mapper.ConversationMapper;
import com.resourcex.resourcex.service.ConversationService;
import com.resourcex.resourcex.validator.ConversationValidator;
import com.resourcex.resourcex.validator.MessageValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConversationServiceImpl implements ConversationService {

        private final ConversationRepository conversationRepository;
        private final MessageRepository messageRepository;
        private final UserRepository userRepository;
        private final BookingRepository bookingRepository;
        private final DisputeRepository disputeRepository;
        private final UserBlockRepository userBlockRepository;
        private final ConversationMapper conversationMapper;
        private final ConversationValidator conversationValidator;
        private final MessageValidator messageValidator;

        @Override
        @Transactional
        public ConversationResponse startConversation(String currentUserEmail, ConversationRequest request) {
                conversationValidator.validateStartRequest(request);

                User currentUser = getAuthenticatedUser(currentUserEmail);
                User otherUser = userRepository.findById(request.getOtherUserId())
                                .orElseThrow(() -> new ResourceNotFoundException("Other user not found"));

                conversationValidator.validateUsers(currentUser, otherUser);

                // Blocking: a block in either direction prevents starting/continuing a conversation
                if (userBlockRepository.existsBlockBetween(currentUser.getUserId(), otherUser.getUserId())) {
                        throw new ForbiddenException(
                                        "You cannot message this user because one of you has blocked the other.");
                }

                final Booking booking = request.getBookingId() != null
                                ? bookingRepository.findById(request.getBookingId())
                                                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"))
                                : null;

                final Dispute dispute = request.getDisputeId() != null
                                ? disputeRepository.findById(request.getDisputeId())
                                                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found"))
                                : null;

                conversationValidator.validateContext(currentUser, otherUser, booking, dispute);

                Long participantOneId = Math.min(currentUser.getUserId(), otherUser.getUserId());
                Long participantTwoId = Math.max(currentUser.getUserId(), otherUser.getUserId());

                Conversation conversation = conversationRepository
                                .findExistingConversation(
                                                participantOneId,
                                                participantTwoId,
                                                booking != null ? booking.getBookingId() : null,
                                                dispute != null ? dispute.getDisputeId() : null)
                                .orElseGet(() -> conversationRepository.save(
                                                Conversation.builder()
                                                                .participantOneUser(participantOneId.equals(
                                                                                currentUser.getUserId()) ? currentUser
                                                                                                : otherUser)
                                                                .participantTwoUser(participantTwoId.equals(
                                                                                currentUser.getUserId()) ? currentUser
                                                                                                : otherUser)
                                                                .booking(booking)
                                                                .dispute(dispute)
                                                                .build()));

                if (request.getInitialMessage() != null && !request.getInitialMessage().trim().isEmpty()) {
                        sendInitialMessage(conversation, currentUser, otherUser, request.getInitialMessage().trim());
                }

                Message lastMessage = messageRepository
                                .findFirstByConversationConversationIdOrderByCreatedAtDesc(
                                                conversation.getConversationId())
                                .orElse(null);

                long unreadCount = messageRepository
                                .countByConversationConversationIdAndReceiverUserUserIdAndIsReadFalse(
                                                conversation.getConversationId(),
                                                currentUser.getUserId());

                return conversationMapper.toResponse(conversation, unreadCount, lastMessage);
        }

        @Override
        @Transactional(readOnly = true)
        public List<ConversationResponse> getMyConversations(String currentUserEmail) {
                User currentUser = getAuthenticatedUser(currentUserEmail);

                List<Conversation> conversations = conversationRepository
                                .findAllByUserIdOrderByActivityDesc(currentUser.getUserId());

                return conversations.stream()
                                .map(conversation -> {
                                        long unreadCount = messageRepository
                                                        .countByConversationConversationIdAndReceiverUserUserIdAndIsReadFalse(
                                                                        conversation.getConversationId(),
                                                                        currentUser.getUserId());
                                        Message lastMessage = messageRepository
                                                        .findFirstByConversationConversationIdOrderByCreatedAtDesc(
                                                                        conversation.getConversationId())
                                                        .orElse(null);
                                        return conversationMapper.toResponse(conversation, unreadCount, lastMessage);
                                })
                                .sorted(Comparator.comparing(ConversationResponse::getLastMessageAt,
                                                Comparator.nullsLast(Comparator.reverseOrder())))
                                .toList();
        }

        @Override
        @Transactional(readOnly = true)
        public ConversationResponse getConversation(String currentUserEmail, Long conversationId) {
                User currentUser = getAuthenticatedUser(currentUserEmail);
                Conversation conversation = getConversationForUser(conversationId, currentUser.getUserId());

                long unreadCount = messageRepository
                                .countByConversationConversationIdAndReceiverUserUserIdAndIsReadFalse(
                                                conversation.getConversationId(),
                                                currentUser.getUserId());
                Message lastMessage = messageRepository
                                .findFirstByConversationConversationIdOrderByCreatedAtDesc(
                                                conversation.getConversationId())
                                .orElse(null);

                return conversationMapper.toResponse(conversation, unreadCount, lastMessage);
        }

        @Override
        @Transactional(readOnly = true)
        public long getUnreadCount(String currentUserEmail) {
                User currentUser = getAuthenticatedUser(currentUserEmail);
                return messageRepository.countByReceiverUserUserIdAndIsReadFalse(currentUser.getUserId());
        }

        @Override
        @Transactional
        public void clearChat(String currentUserEmail, Long conversationId) {
                User currentUser = getAuthenticatedUser(currentUserEmail);
                Conversation conversation = getConversationForUser(conversationId, currentUser.getUserId());

                if (conversation.getParticipantOneUser().getUserId().equals(currentUser.getUserId())) {
                        conversation.setParticipantOneClearedAt(LocalDateTime.now());
                } else {
                        conversation.setParticipantTwoClearedAt(LocalDateTime.now());
                }
                conversationRepository.save(conversation);
        }

        @Override
        @Transactional
        public void deleteConversation(String currentUserEmail, Long conversationId) {
                User currentUser = getAuthenticatedUser(currentUserEmail);
                Conversation conversation = getConversationForUser(conversationId, currentUser.getUserId());

                if (conversation.getParticipantOneUser().getUserId().equals(currentUser.getUserId())) {
                        conversation.setParticipantOneDeleted(true);
                        conversation.setParticipantOneClearedAt(LocalDateTime.now());
                } else {
                        conversation.setParticipantTwoDeleted(true);
                        conversation.setParticipantTwoClearedAt(LocalDateTime.now());
                }
                conversationRepository.save(conversation);
        }

        private void sendInitialMessage(Conversation conversation, User sender, User receiver, String content) {
                MessageRequest request = MessageRequest.builder()
                                .content(content)
                                .build();

                messageValidator.validateRequest(request);

                Message message = Message.builder()
                                .conversation(conversation)
                                .senderUser(sender)
                                .receiverUser(receiver)
                                .content(request.getContent().trim())
                                .isRead(false)
                                .build();

                Message savedMessage = messageRepository.save(message);
                conversation.setLastMessageAt(savedMessage.getCreatedAt() != null ? savedMessage.getCreatedAt()
                                : LocalDateTime.now());
                conversationRepository.save(conversation);
        }

        private Conversation getConversationForUser(Long conversationId, Long currentUserId) {
                Conversation conversation = conversationRepository.findById(conversationId)
                                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

                conversationValidator.validateAccess(conversation, currentUserId);
                return conversation;
        }

        private User getAuthenticatedUser(String currentUserEmail) {
                if (currentUserEmail == null || currentUserEmail.trim().isEmpty()) {
                        throw new BadRequestException("Authenticated user is required");
                }

                return userRepository.findByEmailIgnoreCase(currentUserEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
        }
}