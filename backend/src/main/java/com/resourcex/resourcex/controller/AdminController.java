package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.RejectUserRequest;
import com.resourcex.resourcex.dto.request.SuspendUserRequest;
import jakarta.validation.Valid;
import com.resourcex.resourcex.dto.response.DashboardStatsResponse;
import com.resourcex.resourcex.dto.response.PendingUserResponse;
import com.resourcex.resourcex.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
public class AdminController {


    private final AdminService adminService;

    @GetMapping("/dashboard")
    public DashboardStatsResponse getDashboardStats() {
        return adminService.getDashboardStats();
    }

    @GetMapping("/pending-users")
    public Page<PendingUserResponse> getPendingUsers(
            @PageableDefault(size = 10, sort = "pendingUserId", direction = Sort.Direction.DESC) Pageable pageable) {
        return adminService.getPendingUsers(pageable);
    }

    @GetMapping("/pending-users/{id}")
    public PendingUserResponse getPendingUserById(@PathVariable Long id) {
        return adminService.getPendingUserById(id);
    }

    @PostMapping("/approve/{id}")
    public ResponseEntity<Void> approveUser(@PathVariable Long id) {
        adminService.approveUser(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reject/{id}")
    public ResponseEntity<Void> rejectUser(
            @PathVariable Long id,
            @RequestBody(required = false) RejectUserRequest request
    ) {
        String reason = request != null ? request.getReason() : null;
        adminService.rejectUser(id, reason);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/block-item/{id}")
    public ResponseEntity<Void> blockItem(@PathVariable Long id, @RequestParam String reason) {
        adminService.blockItem(id, reason);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/block/{id}")
    public ResponseEntity<Void> blockUser(
            @PathVariable Long id,
            @Valid @RequestBody SuspendUserRequest request) {
        adminService.blockUser(id, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/unblock/{id}")
    public ResponseEntity<Void> unblockUser(@PathVariable Long id) {
        adminService.unblockUser(id);
        return ResponseEntity.ok().build();
    }
}
