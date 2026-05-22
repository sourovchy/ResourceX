package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.MessageRequest;
import com.resourcex.resourcex.dto.response.MessageResponse;

import java.util.List;

public interface MessageService {

    MessageResponse sendMessage(String currentUserEmail, Long conversationId, MessageRequest request);

    List<MessageResponse> getConversationMessages(String currentUserEmail, Long conversationId);

    void markConversationAsRead(String currentUserEmail, Long conversationId);

    void markMessageAsRead(String currentUserEmail, Long messageId);
}