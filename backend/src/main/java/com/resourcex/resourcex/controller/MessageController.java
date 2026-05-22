package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.MessageRequest;
import com.resourcex.resourcex.dto.response.MessageResponse;
import com.resourcex.resourcex.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class MessageController {

    private final MessageService messageService;

    @PostMapping("/api/conversations/{conversationId}/messages")
    public ResponseEntity<MessageResponse> sendMessage(
            @PathVariable Long conversationId,
            @Valid @RequestBody MessageRequest request,
            Authentication authentication
    ) {
        MessageResponse response = messageService.sendMessage(authentication.getName(), conversationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/conversations/{conversationId}/messages")
    public ResponseEntity<List<MessageResponse>> getConversationMessages(
            @PathVariable Long conversationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(messageService.getConversationMessages(authentication.getName(), conversationId));
    }

    @PostMapping("/api/conversations/{conversationId}/read")
    public ResponseEntity<Void> markConversationAsRead(
            @PathVariable Long conversationId,
            Authentication authentication
    ) {
        messageService.markConversationAsRead(authentication.getName(), conversationId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/messages/{messageId}/read")
    public ResponseEntity<Void> markMessageAsRead(
            @PathVariable Long messageId,
            Authentication authentication
    ) {
        messageService.markMessageAsRead(authentication.getName(), messageId);
        return ResponseEntity.noContent().build();
    }
}