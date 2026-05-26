package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.CreatePrivilegedUserRequest;
import com.resourcex.resourcex.dto.response.ApiResponse;
import com.resourcex.resourcex.dto.response.UserResponse;
import jakarta.validation.Valid;
import com.resourcex.resourcex.service.SuperAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    public ResponseEntity<ApiResponse<UserResponse>> createAdmin(@Valid @RequestBody CreatePrivilegedUserRequest request) {
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(ApiResponse.success("Admin created successfully", superAdminService.createAdmin(request)));
    }

    @PostMapping("/moderators")
    public ResponseEntity<ApiResponse<UserResponse>> createModerator(@Valid @RequestBody CreatePrivilegedUserRequest request) {
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(ApiResponse.success("Moderator created successfully", superAdminService.createModerator(request)));
    }

    @PostMapping("/promote-to-admin/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> promoteToAdmin(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("User promoted to Admin", superAdminService.promoteToAdmin(userId)));
    }

    @PostMapping("/demote-from-admin/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> demoteFromAdmin(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("User demoted to Moderator", superAdminService.demoteFromAdmin(userId)));
    }

    @GetMapping("/privileged-users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllPrivilegedUsers(
            @PageableDefault(size = 10, sort = "userId", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Fetched privileged users", superAdminService.getAllPrivilegedUsers(pageable)));
    }

    @DeleteMapping("/privileged-users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deletePrivilegedUser(@PathVariable Long userId) {
        superAdminService.deletePrivilegedUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Privileged user deleted successfully", null));
    }
}
