package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.SuspendUserRequest;
import com.resourcex.resourcex.dto.response.DashboardStatsResponse;

import com.resourcex.resourcex.dto.response.PlatformActivityResponse;
import com.resourcex.resourcex.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface AdminService {
    DashboardStatsResponse getDashboardStats();
    Page<UserResponse> getPendingUsers(Pageable pageable);
    UserResponse getPendingUserById(Long pendingId);
    void approveUser(Long pendingId);
    void rejectUser(Long pendingId, String reason);
    void blockItem(Long itemId, String reason);
    void blockUser(Long userId, SuspendUserRequest request);
    void unblockUser(Long userId);
    List<PlatformActivityResponse> getPlatformActivities();
    List<UserResponse> getAdminsAndModerators();
    void unblockItem(Long itemId);
}
