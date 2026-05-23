package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.RejectUserRequest;
import com.resourcex.resourcex.dto.response.DashboardStatsResponse;
import com.resourcex.resourcex.dto.response.PendingUserResponse;
import com.resourcex.resourcex.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor

public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public DashboardStatsResponse getDashboardStats() {
        return adminService.getDashboardStats();
    }

    @GetMapping("/pending-users")
    public List<PendingUserResponse> getPendingUsers() {
        return adminService.getPendingUsers();
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
}
