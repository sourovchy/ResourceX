package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.ConversationRequest;
import com.resourcex.resourcex.dto.response.ConversationResponse;

import java.util.List;

public interface ConversationService {

    ConversationResponse startConversation(String currentUserEmail, ConversationRequest request);

    List<ConversationResponse> getMyConversations(String currentUserEmail);

    ConversationResponse getConversation(String currentUserEmail, Long conversationId);

    void clearChat(String currentUserEmail, Long conversationId);

    void deleteConversation(String currentUserEmail, Long conversationId);

    long getUnreadCount(String currentUserEmail);
}