package com.thirdhand.campusvault.service.impl;

import com.thirdhand.campusvault.dto.request.UpdateUserRequest;
import com.thirdhand.campusvault.dto.response.UserResponse;
import com.thirdhand.campusvault.service.UserService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Override
    public UserResponse getUserById(Long userId) {
        return new UserResponse();
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return List.of();
    }

    @Override
    public UserResponse updateUser(Long userId, UpdateUserRequest request) {
        return new UserResponse();
    }
}