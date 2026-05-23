package com.resourcex.resourcex.exception;

/**
 * Thrown when a user is authenticated
 * but does not have permission to access a resource.
 */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }

    public ForbiddenException(String message, Throwable cause) {
        super(message, cause);
    }
}