package com.resourcex.resourcex.exception;

/**
 * Thrown when a request conflicts with the current state of the system.
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }

    public ConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}