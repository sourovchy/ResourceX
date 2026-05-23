package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.UpdateUserRequest;
import com.resourcex.resourcex.dto.response.UserResponse;
import com.resourcex.resourcex.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser() {
        return userService.getCurrentUser();
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
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

    @PutMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public UserResponse updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        return userService.updateUser(userId, request);
    }
}
