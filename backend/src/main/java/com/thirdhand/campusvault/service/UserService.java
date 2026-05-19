package com.thirdhand.campusvault.service;

import com.thirdhand.campusvault.dto.request.UpdateUserRequest;
import com.thirdhand.campusvault.dto.response.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse getUserById(Long userId);

    List<UserResponse> getAllUsers();

    UserResponse updateUser(Long userId, UpdateUserRequest request);
}