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
@PreAuthorize("hasRole('SUPER_ADMIN')")
@RequiredArgsConstructor
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    @PostMapping("/admins")
    public ResponseEntity<UserResponse> createAdmin(@Valid @RequestBody CreatePrivilegedUserRequest request) {
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(superAdminService.createAdmin(request));
    }

    @PostMapping("/moderators")
    public ResponseEntity<UserResponse> createModerator(@Valid @RequestBody CreatePrivilegedUserRequest request) {
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(superAdminService.createModerator(request));
    }

    @PostMapping("/promote-to-admin/{userId}")
    public ResponseEntity<UserResponse> promoteToAdmin(@PathVariable Long userId) {
        return ResponseEntity.ok(superAdminService.promoteToAdmin(userId));
    }

    @PostMapping("/demote-from-admin/{userId}")
    public ResponseEntity<UserResponse> demoteFromAdmin(@PathVariable Long userId) {
        return ResponseEntity.ok(superAdminService.demoteFromAdmin(userId));
    }

    @GetMapping("/privileged-users")
    public ResponseEntity<List<UserResponse>> getAllPrivilegedUsers() {
        return ResponseEntity.ok(superAdminService.getAllPrivilegedUsers());
    }

    @DeleteMapping("/privileged-users/{userId}")
    public ResponseEntity<Void> deletePrivilegedUser(@PathVariable Long userId) {
        superAdminService.deletePrivilegedUser(userId);
        return ResponseEntity.noContent().build();
    }
}
