package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.response.UserResponse;
import com.resourcex.resourcex.dto.request.CreatePrivilegedUserRequest;

import java.util.List;

public interface SuperAdminService {

    /**
     * Promote a normal user or moderator to an ADMIN role
     */
    UserResponse promoteToAdmin(Long userId);

    /**
     * Demote an ADMIN to a normal user role
     */
    UserResponse demoteFromAdmin(Long userId);

    UserResponse createAdmin(CreatePrivilegedUserRequest request);

    UserResponse createModerator(CreatePrivilegedUserRequest request);

    /**
     * Get all users with ADMIN or MODERATOR role
     */
    List<UserResponse> getAllPrivilegedUsers();
}
