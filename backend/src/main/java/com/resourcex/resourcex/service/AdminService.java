package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.SuspendUserRequest;
import com.resourcex.resourcex.dto.response.DashboardStatsResponse;
import com.resourcex.resourcex.dto.response.PendingUserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminService {
    DashboardStatsResponse getDashboardStats();
    Page<PendingUserResponse> getPendingUsers(Pageable pageable);
    PendingUserResponse getPendingUserById(Long pendingId);
    void approveUser(Long pendingId);
    void rejectUser(Long pendingId, String reason);
    void blockItem(Long itemId, String reason);
    void blockUser(Long userId, SuspendUserRequest request);
    void unblockUser(Long userId);
}
