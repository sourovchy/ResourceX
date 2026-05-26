package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.response.UserResponse;
import com.resourcex.resourcex.dto.request.CreatePrivilegedUserRequest;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SuperAdminService {

    /**
     * Promote a normal user or moderator to an ADMIN role
     */
    UserResponse promoteToAdmin(Long userId);

    /**
     * Demote an ADMIN to a normal user role
     */
    UserResponse demoteFromAdmin(Long userId);

    /**
     * Create a new ADMIN account
     */
    UserResponse createAdmin(CreatePrivilegedUserRequest request);

    /**
     * Create a new MODERATOR account
     */
    UserResponse createModerator(CreatePrivilegedUserRequest request);

    /**
     * Delete an ADMIN or MODERATOR account
     */
    void deletePrivilegedUser(Long userId);

    /**
     * Get all users with ADMIN or MODERATOR role
     */
    Page<UserResponse> getAllPrivilegedUsers(Pageable pageable);
}
