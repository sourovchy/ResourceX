package com.resourcex.resourcex.util;

import com.resourcex.resourcex.dto.response.ApiResponse;

public final class ResponseUtil {

        private static final String DEFAULT_SUCCESS_MESSAGE = "Request successful";
        private static final String DEFAULT_ERROR_MESSAGE = "Request failed";

        private ResponseUtil() {
        }

        public static <T> ApiResponse<T> success(
                        String message,
                        T data) {

                if (message == null || message.isBlank()) {
                        message = DEFAULT_SUCCESS_MESSAGE;
                }

                return ApiResponse.<T>builder()
                                .success(true)
                                .message(message.trim())
                                .data(data)
                                .build();
        }

        public static <T> ApiResponse<T> success(T data) {
                return success(DEFAULT_SUCCESS_MESSAGE, data);
        }

        public static <T> ApiResponse<T> error(
                        String message) {

                if (message == null || message.isBlank()) {
                        message = DEFAULT_ERROR_MESSAGE;
                }

                return ApiResponse.<T>builder()
                                .success(false)
                                .message(message.trim())
                                .build();
        }

        public static <T> ApiResponse<T> error() {
                return error(DEFAULT_ERROR_MESSAGE);
        }
}