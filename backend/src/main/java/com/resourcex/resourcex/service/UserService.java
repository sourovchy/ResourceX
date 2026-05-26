package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.UpdateUserRequest;
import com.resourcex.resourcex.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {

    UserResponse getCurrentUser();

    UserResponse getUserById(Long userId);

    Page<UserResponse> getAllUsers(Pageable pageable);

    UserResponse updateCurrentUser(UpdateUserRequest request);

    UserResponse updateUser(Long userId, UpdateUserRequest request);
}
