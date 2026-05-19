package com.thirdhand.campusvault.service.impl;

import com.thirdhand.campusvault.dto.response.DashboardStatsResponse;
import com.thirdhand.campusvault.service.AdminService;
import org.springframework.stereotype.Service;

@Service
public class AdminServiceImpl implements AdminService {

    @Override
    public DashboardStatsResponse getDashboardStats() {
        return new DashboardStatsResponse();
    }
}