package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.ConversationRequest;
import com.resourcex.resourcex.dto.response.ConversationResponse;
import com.resourcex.resourcex.service.ConversationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ConversationController {

    private final ConversationService conversationService;

    @PostMapping
    public ResponseEntity<ConversationResponse> startConversation(
            @Valid @RequestBody ConversationRequest request,
            Authentication authentication
    ) {
        ConversationResponse response = conversationService.startConversation(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ConversationResponse>> getMyConversations(Authentication authentication) {
        return ResponseEntity.ok(conversationService.getMyConversations(authentication.getName()));
    }

    @GetMapping("/{conversationId}")
    public ResponseEntity<ConversationResponse> getConversation(
            @PathVariable Long conversationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(conversationService.getConversation(authentication.getName(), conversationId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        return ResponseEntity.ok(conversationService.getUnreadCount(authentication.getName()));
    }

    @DeleteMapping("/{conversationId}/messages")
    public ResponseEntity<Void> clearChat(
            @PathVariable Long conversationId,
            Authentication authentication
    ) {
        conversationService.clearChat(authentication.getName(), conversationId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{conversationId}")
    public ResponseEntity<Void> deleteConversation(
            @PathVariable Long conversationId,
            Authentication authentication
    ) {
        conversationService.deleteConversation(authentication.getName(), conversationId);
        return ResponseEntity.noContent().build();
    }
}