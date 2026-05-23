package com.resourcex.resourcex.exception.custom;

/**
 * Thrown when request data or business rules fail validation.
 */
public class ValidationException extends RuntimeException {

    public ValidationException(String message) {
        super(message);
    }

    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}