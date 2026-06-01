package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.UpdateUserRequest;
import com.resourcex.resourcex.dto.response.UserResponse;
import com.resourcex.resourcex.dto.response.UserSearchResponse;
import com.resourcex.resourcex.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public Page<UserResponse> getAllUsers(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return userService.getAllUsers(pageable);
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser() {
        return userService.getCurrentUser();
    }

    /**
     * Search active users to start a conversation. Available to any authenticated user.
     */
    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public List<UserSearchResponse> searchUsers(
            @RequestParam("q") String query,
            @RequestParam(value = "limit", defaultValue = "10") int limit
    ) {
        return userService.searchUsers(query, limit);
    }

    @GetMapping("/{userId}")
    @PreAuthorize("isAuthenticated()")
    public UserResponse getUserById(
            @PathVariable Long userId
    ) {
        return userService.getUserById(userId);
    }

    @PutMapping("/me")
    public UserResponse updateCurrentUser(
            @Valid @RequestBody UpdateUserRequest request
    ) {
        return userService.updateCurrentUser(request);
    }

    @PutMapping("/me/password")
    public org.springframework.http.ResponseEntity<?> changePassword(
            @Valid @RequestBody com.resourcex.resourcex.dto.request.ChangePasswordRequest request
    ) {
        userService.changePassword(request);
        return org.springframework.http.ResponseEntity.ok(java.util.Map.of("message", "Password updated successfully"));
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public UserResponse updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        return userService.updateUser(userId, request);
    }
}
