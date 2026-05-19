package com.thirdhand.campusvault.util;

import com.thirdhand.campusvault.dto.response.ApiResponse;

public class ResponseUtil {

    private ResponseUtil() {
    }

    public static <T> ApiResponse<T> success(
            String message,
            T data
    ) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> error(
            String message
    ) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }
}