package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.response.DashboardStatsResponse;
import com.resourcex.resourcex.dto.response.PendingUserResponse;
import java.util.List;

public interface AdminService {
    DashboardStatsResponse getDashboardStats();
    List<PendingUserResponse> getPendingUsers();
    void approveUser(Long pendingId);
    void rejectUser(Long pendingId, String reason);
    void blockItem(Long itemId, String reason);
}
