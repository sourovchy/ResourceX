package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.response.DashboardStatsResponse;
import com.resourcex.resourcex.dto.response.PendingUserResponse;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminService {
    DashboardStatsResponse getDashboardStats();
    Page<PendingUserResponse> getPendingUsers(Pageable pageable);
    void approveUser(Long pendingId);
    void rejectUser(Long pendingId, String reason);
    void blockItem(Long itemId, String reason);
}
