package com.thirdhand.campusvault.service;

import com.thirdhand.campusvault.dto.response.DashboardStatsResponse;
import com.thirdhand.campusvault.dto.response.PendingUserResponse;
import java.util.List;

public interface AdminService {
    DashboardStatsResponse getDashboardStats();
    List<PendingUserResponse> getPendingUsers();
    void approveUser(Long pendingId);
    void rejectUser(Long pendingId);
    void blockItem(Long itemId, String reason);
}