package com.resourcex.resourcex.exception;

import com.resourcex.resourcex.dto.response.ApiResponse;
import com.resourcex.resourcex.exception.custom.DuplicateResourceException;
import com.resourcex.resourcex.exception.custom.InvalidTokenException;
import com.resourcex.resourcex.exception.custom.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.ConcurrencyFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ApiResponse<?>> handleNotFound(
                        ResourceNotFoundException ex) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(ApiResponse.builder()
                                                .success(false)
                                                .message(ex.getMessage())
                                                .build());
        }

        @ExceptionHandler(BadRequestException.class)
        public ResponseEntity<ApiResponse<?>> handleBadRequest(
                        BadRequestException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.builder()
                                                .success(false)
                                                .message(ex.getMessage())
                                                .build());
        }

        @ExceptionHandler(ConflictException.class)
        public ResponseEntity<ApiResponse<?>> handleConflict(
                        ConflictException ex) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(ApiResponse.builder()
                                                .success(false)
                                                .message(ex.getMessage())
                                                .build());
        }

        @ExceptionHandler(UnauthorizedException.class)
        public ResponseEntity<ApiResponse<?>> handleUnauthorized(
                        UnauthorizedException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(ApiResponse.builder()
                                                .success(false)
                                                .message(ex.getMessage())
                                                .build());
        }

        @ExceptionHandler(ForbiddenException.class)
        public ResponseEntity<ApiResponse<?>> handleForbidden(
                        ForbiddenException ex) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(ApiResponse.builder()
                                                .success(false)
                                                .message(ex.getMessage())
                                                .build());
        }

        @ExceptionHandler(InvalidTokenException.class)
        public ResponseEntity<ApiResponse<?>> handleInvalidToken(
                        InvalidTokenException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(ApiResponse.builder()
                                                .success(false)
                                                .message(ex.getMessage())
                                                .build());
        }

        @ExceptionHandler(ValidationException.class)
        public ResponseEntity<ApiResponse<?>> handleBusinessValidation(
                        ValidationException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.builder()
                                                .success(false)
                                                .message(ex.getMessage())
                                                .build());
        }

        @ExceptionHandler(DuplicateResourceException.class)
        public ResponseEntity<ApiResponse<?>> handleDuplicateResource(
                        DuplicateResourceException ex) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(ApiResponse.builder()
                                                .success(false)
                                                .message(ex.getMessage())
                                                .build());
        }

        @ExceptionHandler(EmailDeliveryException.class)
        public ResponseEntity<ApiResponse<?>> handleEmailDelivery(
                        EmailDeliveryException ex) {
                log.error("OTP email delivery failed", ex);
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                                .body(ApiResponse.builder()
                                                .success(false)
                                                .message(ex.getMessage())
                                                .build());
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiResponse<?>> handleValidation(
                        MethodArgumentNotValidException ex) {
                Map<String, String> fieldErrors = new LinkedHashMap<>();
                ex.getBindingResult().getFieldErrors().forEach(error -> fieldErrors
                                .putIfAbsent(error.getField(), error.getDefaultMessage()));

                String message = fieldErrors.values().stream()
                                .findFirst()
                                .orElse("Invalid request");

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.failure(message, fieldErrors));
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ApiResponse<?>> handleAccessDenied(
                        AccessDeniedException ex) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(ApiResponse.builder()
                                                .success(false)
                                                .message("Access denied")
                                                .build());
        }

        @ExceptionHandler(ConcurrencyFailureException.class)
        public ResponseEntity<ApiResponse<?>> handleOptimisticLock(
                        ConcurrencyFailureException ex) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(ApiResponse.builder()
                                                .success(false)
                                                .message("This record was modified by someone else. Please refresh and try again.")
                                                .build());
        }

        @ExceptionHandler({
                        HttpMessageNotReadableException.class,
                        MethodArgumentTypeMismatchException.class,
                        MissingServletRequestParameterException.class,
                        IllegalArgumentException.class })
        public ResponseEntity<ApiResponse<?>> handleMalformedRequest(
                        Exception ex) {
                String message = ex instanceof IllegalArgumentException
                                ? ex.getMessage()
                                : "Malformed or invalid request";
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.builder()
                                                .success(false)
                                                .message(message)
                                                .build());
        }

        @ExceptionHandler(MaxUploadSizeExceededException.class)
        public ResponseEntity<ApiResponse<?>> handleMaxUpload(
                        MaxUploadSizeExceededException ex) {
                return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                                .body(ApiResponse.builder()
                                                .success(false)
                                                .message("File exceeds the maximum allowed size of 10MB")
                                                .build());
        }

        @ExceptionHandler(DataAccessException.class)
        public ResponseEntity<ApiResponse<?>> handleDataAccess(
                        DataAccessException ex) {
                log.error("Database operation failed", ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ApiResponse.builder()
                                                .success(false)
                                                .message("Database operation failed")
                                                .build());
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiResponse<?>> handleException(
                        Exception ex) {
                log.error("Unhandled application error", ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ApiResponse.builder()
                                                .success(false)
                                                .message("Internal server error")
                                                .build());
        }
}
