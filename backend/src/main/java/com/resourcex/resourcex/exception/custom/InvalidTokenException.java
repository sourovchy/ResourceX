package com.resourcex.resourcex.exception.custom;

/**
 * Thrown when a JWT token is invalid, expired,
 * malformed, or cannot be verified.
 */
public class InvalidTokenException extends RuntimeException {

    public InvalidTokenException(String message) {
        super(message);
    }

    public InvalidTokenException(String message, Throwable cause) {
        super(message, cause);
    }
}