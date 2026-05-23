package com.resourcex.resourcex.exception;

/**
 * Thrown when a user is not authenticated
 * or authentication credentials are invalid.
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }

    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}