package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.response.BlockStatusResponse;
import com.resourcex.resourcex.dto.response.BlockedUserResponse;
import com.resourcex.resourcex.service.BlockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blocks")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class BlockController {

    private final BlockService blockService;

    @PostMapping("/{userId}")
    public ResponseEntity<BlockStatusResponse> blockUser(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(blockService.blockUser(authentication.getName(), userId));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<BlockStatusResponse> unblockUser(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(blockService.unblockUser(authentication.getName(), userId));
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<BlockStatusResponse> getBlockStatus(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(blockService.getBlockStatus(authentication.getName(), userId));
    }

    @GetMapping
    public ResponseEntity<List<BlockedUserResponse>> getBlockedUsers(
            Authentication authentication
    ) {
        return ResponseEntity.ok(blockService.getBlockedUsers(authentication.getName()));
    }
}
