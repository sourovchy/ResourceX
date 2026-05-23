package com.resourcex.resourcex.exception.custom;

/**
 * Thrown when an attempt is made to create a resource that already exists.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }

    public DuplicateResourceException(String message, Throwable cause) {
        super(message, cause);
    }
}