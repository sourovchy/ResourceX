package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.UpdateUserRequest;
import com.resourcex.resourcex.dto.response.UserResponse;
import com.resourcex.resourcex.dto.response.UserSearchResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {

    UserResponse getCurrentUser();

    /**
     * Public-safe search for active users (to start a conversation), excluding the searcher.
     */
    List<UserSearchResponse> searchUsers(String query, int limit);

    UserResponse getUserById(Long userId);

    Page<UserResponse> getAllUsers(Pageable pageable);

    UserResponse updateCurrentUser(UpdateUserRequest request);

    UserResponse updateUser(Long userId, UpdateUserRequest request);

    void changePassword(com.resourcex.resourcex.dto.request.ChangePasswordRequest request);
}
