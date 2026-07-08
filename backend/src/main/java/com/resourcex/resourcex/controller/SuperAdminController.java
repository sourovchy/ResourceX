package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.CreatePrivilegedUserRequest;
import com.resourcex.resourcex.dto.response.UserResponse;
import jakarta.validation.Valid;
import com.resourcex.resourcex.service.SuperAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/api/superadmin")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@RequiredArgsConstructor
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    @PostMapping("/admins")
    public ResponseEntity<UserResponse> createAdmin(@Valid @RequestBody CreatePrivilegedUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(superAdminService.createAdmin(request));
    }

    @PostMapping("/moderators")
    public ResponseEntity<UserResponse> createModerator(@Valid @RequestBody CreatePrivilegedUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(superAdminService.createModerator(request));
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
    public ResponseEntity<Page<UserResponse>> getAllPrivilegedUsers(
            @PageableDefault(size = 10, sort = "userId", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(superAdminService.getAllPrivilegedUsers(pageable));
    }

    @DeleteMapping("/privileged-users/{userId}")
    public ResponseEntity<Void> deletePrivilegedUser(@PathVariable Long userId) {
        superAdminService.deletePrivilegedUser(userId);
        return ResponseEntity.noContent().build();
    }
}
