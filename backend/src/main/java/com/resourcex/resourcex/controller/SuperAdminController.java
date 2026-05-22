package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.CreatePrivilegedUserRequest;
import com.resourcex.resourcex.dto.response.UserResponse;
import jakarta.validation.Valid;
import com.resourcex.resourcex.service.SuperAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/superadmin")
@RequiredArgsConstructor
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    @PostMapping("/admins")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<UserResponse> createAdmin(@Valid @RequestBody CreatePrivilegedUserRequest request) {
        return ResponseEntity.ok(superAdminService.createAdmin(request));
    }

    @PostMapping("/moderators")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<UserResponse> createModerator(@Valid @RequestBody CreatePrivilegedUserRequest request) {
        return ResponseEntity.ok(superAdminService.createModerator(request));
    }

    @PostMapping("/promote-to-admin/{userId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<UserResponse> promoteToAdmin(@PathVariable Long userId) {
        UserResponse response = superAdminService.promoteToAdmin(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/demote-from-admin/{userId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<UserResponse> demoteFromAdmin(@PathVariable Long userId) {
        UserResponse response = superAdminService.demoteFromAdmin(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/privileged-users")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllPrivilegedUsers() {
        List<UserResponse> response = superAdminService.getAllPrivilegedUsers();
        return ResponseEntity.ok(response);
    }
}
