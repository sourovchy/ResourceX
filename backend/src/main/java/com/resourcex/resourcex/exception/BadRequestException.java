package com.resourcex.resourcex.exception;

/**
 * Thrown when a client sends an invalid or malformed request.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }

    public BadRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}